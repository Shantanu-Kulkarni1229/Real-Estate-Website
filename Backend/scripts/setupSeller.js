/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

async function createOrUpdateSeller() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  await mongoose.connect(mongoUri);

  try {
    const sellerEmail = 'shantanuprogramming@gmail.com';
    const sellerPassword = 'Shantanu@123';

    let seller = await User.findOne({ email: sellerEmail }).select('+password');

    if (seller) {
      console.log(`\n📝 Updating existing seller account...`);
      seller.password = sellerPassword;
      seller.role = 'seller';
      seller.firstName = seller.firstName || 'Shantanu';
      seller.lastName = seller.lastName || 'Kumar';
      seller.phone = seller.phone || '9000000002';
      seller.whatsappNumber = seller.whatsappNumber || '9000000002';
      seller.businessName = seller.businessName || 'Premium Properties';
      seller.isActive = true;
      seller.isVerified = true;
      await seller.save();
      console.log(`✅ Seller account updated successfully!`);
    } else {
      console.log(`\n📝 Creating new seller account...`);
      seller = await User.create({
        firstName: 'Shantanu',
        lastName: 'Kumar',
        email: sellerEmail,
        password: sellerPassword,
        phone: '9000000002',
        whatsappNumber: '9000000002',
        role: 'seller',
        businessName: 'Premium Properties',
        isActive: true,
        isVerified: true
      });
      console.log(`✅ Seller account created successfully!`);
    }

    console.log(`\n📊 Seller Account Details:`);
    console.log(`   Name: ${seller.firstName} ${seller.lastName}`);
    console.log(`   Email: ${seller.email}`);
    console.log(`   Phone: ${seller.phone}`);
    console.log(`   Business: ${seller.businessName}`);
    console.log(`   Role: ${seller.role}`);
    console.log(`   Verified: ${seller.isVerified}\n`);

    return seller;
  } catch (error) {
    console.error('Setup script failed:', error.message);
    throw error;
  }
}

createOrUpdateSeller()
  .then(async () => {
    await mongoose.disconnect();
    console.log('✅ Seller setup completed! You can now seed dummy properties.\n');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
