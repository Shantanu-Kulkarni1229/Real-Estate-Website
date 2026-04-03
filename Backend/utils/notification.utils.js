const nodemailer = require('nodemailer');

const DEFAULT_MAX_RETRIES = Number(process.env.NOTIFICATION_MAX_RETRIES || 3);
const DEFAULT_BASE_DELAY_MS = Number(process.env.NOTIFICATION_RETRY_DELAY_MS || 500);

const emailQueue = [];
let isProcessingQueue = false;

function hasEmailConfig() {
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryDelayMs(attempt) {
  return Math.min(DEFAULT_BASE_DELAY_MS * (2 ** attempt), 5000);
}

async function sendRawEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  return info;
}

async function processQueue() {
  if (isProcessingQueue) {
    return;
  }

  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const task = emailQueue.shift();
    const {
      payload,
      maxRetries,
      resolve,
      reject
    } = task;

    let attempt = 0;
    let sent = false;
    let lastError = null;

    while (attempt <= maxRetries && !sent) {
      try {
        const info = await sendRawEmail(payload);
        resolve({
          skipped: false,
          messageId: info.messageId,
          attempts: attempt + 1
        });
        sent = true;
      } catch (error) {
        lastError = error;
        if (attempt >= maxRetries) {
          break;
        }

        await delay(getRetryDelayMs(attempt));
      }

      attempt += 1;
    }

    if (!sent) {
      reject(lastError || new Error('Failed to send email notification'));
    }
  }

  isProcessingQueue = false;
}

function enqueueEmail(payload, options = {}) {
  const maxRetries = Number.isInteger(options.maxRetries)
    ? options.maxRetries
    : DEFAULT_MAX_RETRIES;

  return new Promise((resolve, reject) => {
    emailQueue.push({
      payload,
      maxRetries,
      resolve,
      reject
    });

    processQueue().catch((error) => {
      reject(error);
    });
  });
}

function buildLeadNotificationTemplate({ buyerName, propertyTitle, city, status }) {
  const safeBuyerName = buyerName || 'Buyer';
  const safeTitle = propertyTitle || 'Property';
  const safeCity = city || 'N/A';
  const safeStatus = status || 'new';

  return {
    subject: `New Lead Received: ${safeTitle}`,
    text: `Lead alert. Buyer: ${safeBuyerName}. Property: ${safeTitle}. City: ${safeCity}. Status: ${safeStatus}.`
  };
}

function buildPropertyReviewTemplate({ sellerName, propertyTitle, status }) {
  const safeSellerName = sellerName || 'Seller';
  const safeTitle = propertyTitle || 'Property';
  const safeStatus = status || 'updated';

  return {
    subject: `Property ${safeStatus}: ${safeTitle}`,
    text: `Hi ${safeSellerName}, your property "${safeTitle}" is now ${safeStatus}.`
  };
}

async function sendEmailNotification({ to, subject, text, html }, options = {}) {
  if (!to) {
    return { skipped: true, reason: 'Missing recipient email' };
  }

  if (!hasEmailConfig()) {
    return { skipped: true, reason: 'Email configuration missing' };
  }

  return enqueueEmail({ to, subject, text, html }, options);
}

async function sendBulkEmailNotifications(items = [], options = {}) {
  const results = [];

  for (const item of items) {
    try {
      const result = await sendEmailNotification(item, options);
      results.push({
        to: item.to,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        to: item.to,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  hasEmailConfig,
  sendEmailNotification,
  sendBulkEmailNotifications,
  buildLeadNotificationTemplate,
  buildPropertyReviewTemplate,
  getRetryDelayMs,
  enqueueEmail,
  processQueue
};
