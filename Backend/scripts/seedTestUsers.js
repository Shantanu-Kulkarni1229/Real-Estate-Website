/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

const TEST_USERS = [
  {
    role: 'buyer',
    firstName: 'Test',
    lastName: 'Buyer',
    email: 'buyer.test@example.com',
    phone: '9000000001',
    password: 'Buyer@123',
    whatsappNumber: '9000000001'
  },
  {
    role: 'seller',
    firstName: 'Test',
    lastName: 'Seller',
    email: 'seller.test@example.com',
    phone: '9000000002',
    password: 'Seller@123',
    whatsappNumber: '9000000002',
    businessName: 'Test Seller Realty'
  },
  {
    role: 'renter',
    firstName: 'Test',
    lastName: 'Renter',
    email: 'renter.test@example.com',
    phone: '9000000003',
    password: 'Renter@123',
    whatsappNumber: '9000000003'
  },
  {
    role: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin.test@example.com',
    phone: '9000000004',
    password: 'Admin@123',
    whatsappNumber: '9000000004',
    isVerified: true
  }
];

async function upsertUser(userData) {
  const existing = await User.findOne({ email: userData.email }).select('+password');

  if (existing) {
    existing.firstName = userData.firstName;
    existing.lastName = userData.lastName;
    existing.phone = userData.phone;
    existing.whatsappNumber = userData.whatsappNumber;
    existing.role = userData.role;
    existing.password = userData.password;
    existing.businessName = userData.businessName || existing.businessName;
    existing.isVerified = userData.isVerified || false;
    existing.isActive = true;
    await existing.save();

    return { mode: 'updated', email: existing.email, role: existing.role };
  }

  const created = await User.create({
    ...userData,
    isActive: true
  });

  return { mode: 'created', email: created.email, role: created.role };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  await mongoose.connect(mongoUri);

  const results = [];
  for (const user of TEST_USERS) {
    const result = await upsertUser(user);
    results.push(result);
  }

  console.log('Test user seed completed successfully');
  console.table(results);
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed script failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
