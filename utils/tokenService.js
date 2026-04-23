import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRES || '24h';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES || '7d';

function getAccessSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

function getRefreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is not set');
  return s;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getAccessSecret());
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, getRefreshSecret());
  if (decoded.tokenType !== 'refresh') {
    const err = new Error('Invalid refresh token');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
