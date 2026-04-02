const {
  validateSyncPayload,
  buildRowsFromPayload
} = require('../utils/googleSheets.utils');

describe('googleSheets.utils', () => {
  test('validateSyncPayload should report missing required fields', () => {
    const missing = validateSyncPayload({
      buyer: { id: 'b1' },
      seller: {},
      property: { title: 'Prop 1' }
    });

    expect(missing).toEqual(
      expect.arrayContaining([
        'buyer.name',
        'seller.id',
        'seller.name',
        'property.id'
      ])
    );
  });

  test('validateSyncPayload should pass for minimum valid payload', () => {
    const missing = validateSyncPayload({
      buyer: { id: 'b1', name: 'Buyer One' },
      seller: { id: 's1', name: 'Seller One' },
      property: { id: 'p1', title: 'Property One' }
    });

    expect(missing).toEqual([]);
  });

  test('buildRowsFromPayload should build three sheet rows', () => {
    const payload = {
      buyer: {
        id: 'b1',
        name: 'Buyer One',
        email: 'buyer@example.com',
        mobile: '9999999999',
        whatsapp: '9999999999'
      },
      seller: {
        id: 's1',
        name: 'Seller One',
        email: 'seller@example.com',
        mobile: '8888888888',
        whatsapp: '8888888888'
      },
      property: {
        id: 'p1',
        title: '2BHK Apartment',
        type: 'residential',
        purpose: 'buy',
        price: 5000000,
        city: 'Delhi'
      },
      interest: {
        id: 'i1',
        status: 'new',
        createdAt: '2026-04-02T10:00:00.000Z'
      }
    };

    const rows = buildRowsFromPayload(payload);

    expect(rows.buyerRow.length).toBe(6);
    expect(rows.sellerRow.length).toBe(6);
    expect(rows.linkRow.length).toBe(13);
    expect(rows.buyerRow[0]).toBe('b1');
    expect(rows.sellerRow[0]).toBe('s1');
    expect(rows.linkRow[0]).toBe('i1');
    expect(rows.linkRow[5]).toBe('p1');
  });
});
