/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');

function parseArgs(argv) {
  const parsed = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') {
      continue;
    }

    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [rawKey, rawValue] = arg.split('=');
        const key = rawKey.slice(2);
        parsed[key] = rawValue;
        continue;
      }

      const key = arg.slice(2);
      const value = argv[i + 1];
      parsed[key] = value;
      i += 1;
    }
  }
  return parsed;
}

async function createOrUpdateAdmin({ email, password }) {
  if (!email || !password) {
    throw new Error('Usage: npm run create-admin -- --email <email> --password <password> OR node create-admin.js --email <email> --password <password>');
  }

  const normalizedEmail = String(email).toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('+password');

  if (existing) {
    existing.password = password;
    existing.role = 'admin';
    existing.firstName = existing.firstName || 'Admin';
    existing.lastName = existing.lastName || 'User';
    existing.phone = existing.phone || '9000000000';
    existing.isActive = true;
    await existing.save();

    return {
      mode: 'updated',
      userId: existing._id.toString(),
      email: existing.email,
      role: existing.role
    };
  }

  const created = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: normalizedEmail,
    password,
    phone: '9000000000',
    role: 'admin',
    isActive: true,
    isVerified: true
  });

  return {
    mode: 'created',
    userId: created._id.toString(),
    email: created.email,
    role: created.role
  };
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.email || !args.password) {
    throw new Error('Usage: npm run create-admin -- --email <email> --password <password> OR node create-admin.js --email <email> --password <password>');
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  await mongoose.connect(mongoUri);
  const result = await createOrUpdateAdmin({
    email: args.email,
    password: args.password
  });

  console.log('Admin script completed successfully');
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Admin script failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
