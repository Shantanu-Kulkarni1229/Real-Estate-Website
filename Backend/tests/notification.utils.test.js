jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}));

const nodemailer = require('nodemailer');
const {
  getRetryDelayMs,
  buildLeadNotificationTemplate,
  buildPropertyReviewTemplate,
  sendEmailNotification
} = require('../utils/notification.utils');

describe('notification.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'noreply@example.com';
    process.env.EMAIL_PASS = 'secret';
  });

  test('getRetryDelayMs should backoff and cap at 5000', () => {
    expect(getRetryDelayMs(0)).toBe(500);
    expect(getRetryDelayMs(1)).toBe(1000);
    expect(getRetryDelayMs(5)).toBe(5000);
  });

  test('buildLeadNotificationTemplate should return subject and text', () => {
    const template = buildLeadNotificationTemplate({
      buyerName: 'Rahul',
      propertyTitle: '2BHK Flat',
      city: 'Delhi',
      status: 'new'
    });

    expect(template.subject).toContain('2BHK Flat');
    expect(template.text).toContain('Rahul');
  });

  test('buildPropertyReviewTemplate should return subject and text', () => {
    const template = buildPropertyReviewTemplate({
      sellerName: 'Anita',
      propertyTitle: 'Villa 22',
      status: 'approved'
    });

    expect(template.subject).toContain('approved');
    expect(template.text).toContain('Anita');
  });

  test('sendEmailNotification should retry on failure and then succeed', async () => {
    const sendMail = jest
      .fn()
      .mockRejectedValueOnce(new Error('smtp temporary error'))
      .mockResolvedValueOnce({ messageId: 'msg-1' });

    nodemailer.createTransport.mockReturnValue({ sendMail });

    const result = await sendEmailNotification(
      {
        to: 'admin@example.com',
        subject: 'Test',
        text: 'Hello'
      },
      { maxRetries: 2 }
    );

    expect(result.skipped).toBe(false);
    expect(result.messageId).toBe('msg-1');
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  test('sendEmailNotification should skip when recipient is missing', async () => {
    const result = await sendEmailNotification({ subject: 'No recipient', text: 'x' });
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('Missing recipient');
  });
});
