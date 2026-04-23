/**
 * Promote a user by email (local/dev testing). Registration always creates role "user";
 * there is no API to self-promote, so use this or update MongoDB directly.
 *
 * Usage: node scripts/set-user-role.js <email> <user|manager|admin>
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const validRoles = Object.values(ROLES);

async function main() {
  const [, , email, role] = process.argv;
  if (!email || !role) {
    console.error('Usage: node scripts/set-user-role.js <email> <user|manager|admin>');
    process.exit(1);
  }
  if (!validRoles.includes(role)) {
    console.error(`Invalid role "${role}". Use one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || 'todo-app',
  });

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role },
    { new: true },
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Updated ${user.email} → role: ${user.role}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
