const REQUIRED_SHEET_HEADERS = {
  buyers: [
    'buyer_id',
    'name',
    'email',
    'mobile',
    'whatsapp',
    'created_at'
  ],
  sellers: [
    'seller_id',
    'name',
    'email',
    'mobile',
    'whatsapp',
    'created_at'
  ],
  buyer_seller_links: [
    'link_id',
    'buyer_id',
    'buyer_name',
    'seller_id',
    'seller_name',
    'property_id',
    'property_title',
    'property_type',
    'purpose',
    'price',
    'city',
    'interest_status',
    'created_at'
  ]
};

function getSheetConfig() {
  const buyerTab = process.env.GOOGLE_SHEET_BUYER_TAB || 'buyers';
  const sellerTab = process.env.GOOGLE_SHEET_SELLER_TAB || 'sellers';
  const linkTab = process.env.GOOGLE_SHEET_LINK_TAB || 'buyer_seller_links';

  return {
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    tabs: {
      buyers: buyerTab,
      sellers: sellerTab,
      buyer_seller_links: linkTab
    }
  };
}

function parseServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing in environment variables');
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON. It must be valid JSON');
  }
}

async function getSheetsClient() {
  const { google } = require('googleapis');
  const credentials = parseServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

async function getSpreadsheetSheetNames(sheets, spreadsheetId) {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = response.data.sheets || [];
  return sheetList.map((sheet) => sheet.properties.title);
}

async function addSheetIfMissing(sheets, spreadsheetId, sheetName) {
  const existingNames = await getSpreadsheetSheetNames(sheets, spreadsheetId);
  if (existingNames.includes(sheetName)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        }
      ]
    }
  });
}

async function ensureHeaderRow(sheets, spreadsheetId, tabName, headers) {
  const readRange = `${tabName}!A1:Z1`;
  const readResult = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: readRange
  });

  const existingHeader = readResult.data.values && readResult.data.values[0]
    ? readResult.data.values[0]
    : [];

  if (existingHeader.length > 0) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers]
    }
  });
}

async function initializeGoogleSheets() {
  const { spreadsheetId, tabs } = getSheetConfig();

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is missing in environment variables');
  }

  const sheets = await getSheetsClient();

  await addSheetIfMissing(sheets, spreadsheetId, tabs.buyers);
  await addSheetIfMissing(sheets, spreadsheetId, tabs.sellers);
  await addSheetIfMissing(sheets, spreadsheetId, tabs.buyer_seller_links);

  await ensureHeaderRow(sheets, spreadsheetId, tabs.buyers, REQUIRED_SHEET_HEADERS.buyers);
  await ensureHeaderRow(sheets, spreadsheetId, tabs.sellers, REQUIRED_SHEET_HEADERS.sellers);
  await ensureHeaderRow(sheets, spreadsheetId, tabs.buyer_seller_links, REQUIRED_SHEET_HEADERS.buyer_seller_links);

  return {
    success: true,
    spreadsheetId,
    tabs
  };
}

async function appendRow(sheets, spreadsheetId, tabName, rowValues) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowValues]
    }
  });
}

function nowIso() {
  return new Date().toISOString();
}

function buildRowsFromPayload(payload) {
  const buyer = payload.buyer || {};
  const seller = payload.seller || {};
  const property = payload.property || {};
  const interest = payload.interest || {};

  const createdAt = interest.createdAt || nowIso();
  const linkId = interest.id || `${buyer.id || 'buyer'}-${seller.id || 'seller'}-${property.id || 'property'}-${Date.now()}`;

  const buyerRow = [
    buyer.id || '',
    buyer.name || '',
    buyer.email || '',
    buyer.mobile || '',
    buyer.whatsapp || '',
    createdAt
  ];

  const sellerRow = [
    seller.id || '',
    seller.name || '',
    seller.email || '',
    seller.mobile || '',
    seller.whatsapp || '',
    createdAt
  ];

  const linkRow = [
    linkId,
    buyer.id || '',
    buyer.name || '',
    seller.id || '',
    seller.name || '',
    property.id || '',
    property.title || '',
    property.type || '',
    property.purpose || '',
    property.price || '',
    property.city || '',
    interest.status || 'new',
    createdAt
  ];

  return { buyerRow, sellerRow, linkRow };
}

function validateSyncPayload(payload) {
  const missing = [];

  if (!payload || typeof payload !== 'object') {
    return ['payload'];
  }

  if (!payload.buyer || !payload.buyer.id) missing.push('buyer.id');
  if (!payload.buyer || !payload.buyer.name) missing.push('buyer.name');

  if (!payload.seller || !payload.seller.id) missing.push('seller.id');
  if (!payload.seller || !payload.seller.name) missing.push('seller.name');

  if (!payload.property || !payload.property.id) missing.push('property.id');
  if (!payload.property || !payload.property.title) missing.push('property.title');

  return missing;
}

async function syncInterestToGoogleSheets(payload) {
  const missing = validateSyncPayload(payload);
  if (missing.length > 0) {
    throw new Error(`Invalid payload. Missing: ${missing.join(', ')}`);
  }

  const { spreadsheetId, tabs } = getSheetConfig();
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is missing in environment variables');
  }

  const sheets = await getSheetsClient();
  const { buyerRow, sellerRow, linkRow } = buildRowsFromPayload(payload);

  await appendRow(sheets, spreadsheetId, tabs.buyers, buyerRow);
  await appendRow(sheets, spreadsheetId, tabs.sellers, sellerRow);
  await appendRow(sheets, spreadsheetId, tabs.buyer_seller_links, linkRow);

  return {
    success: true,
    spreadsheetId,
    tabs,
    linkId: linkRow[0]
  };
}

module.exports = {
  REQUIRED_SHEET_HEADERS,
  getSheetConfig,
  initializeGoogleSheets,
  validateSyncPayload,
  buildRowsFromPayload,
  syncInterestToGoogleSheets
};
