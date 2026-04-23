import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validatePasswordStrength } from '../utils/password.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenService.js';
import { ROLES } from '../config/constants.js';

const MAX_FAILED = 3;
const LOCK_DURATION_MS = 30 * 60 * 1000;
const MAX_REFRESH_TOKENS = 10;

export async function registerUser({ name, email, password }) {
  if (!validatePasswordStrength(password)) {
    throw AppError.badRequest(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      'WEAK_PASSWORD',
    );
  }
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.USER,
    emailVerified: false,
    verificationToken,
  });
  const tokens = await issueTokensForUser(user);
  return { user: user.toSafeJSON(), ...tokens };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select(
    '+password +refreshTokens +lockUntil +failedLoginAttempts',
  );
  if (!user) {
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }
  if (user.isLocked()) {
    throw AppError.unauthorized('Account locked due to failed attempts', 'ACCOUNT_LOCKED');
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  const tokens = await issueTokensForUser(user);
  return { user: user.toSafeJSON(), ...tokens };
}

async function issueTokensForUser(user) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  const tokenHash = hashToken(refreshToken);
  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  const full = await User.findById(user._id).select('+refreshTokens');
  full.refreshTokens.push({ tokenHash, expiresAt });
  while (full.refreshTokens.length > MAX_REFRESH_TOKENS) {
    full.refreshTokens.shift();
  }
  await full.save();

  return { accessToken, refreshToken, expiresIn: '24h' };
}

export async function refreshSession(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token', 'INVALID_REFRESH');
  }
  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user) throw AppError.unauthorized('User not found', 'INVALID_REFRESH');
  const tokenHash = hashToken(refreshToken);
  const exists = user.refreshTokens.some((t) => t.tokenHash === tokenHash && t.expiresAt > new Date());
  if (!exists) throw AppError.unauthorized('Refresh token revoked', 'INVALID_REFRESH');

  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();

  return issueTokensForUser(user);
}

export async function logoutUser(userId, refreshToken) {
  if (!refreshToken) return;
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  const tokenHash = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();
}
