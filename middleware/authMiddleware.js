import { verifyAccessToken } from '../utils/tokenService.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing bearer token');
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }
    if (user.isLocked()) {
      throw AppError.unauthorized('Account is temporarily locked');
    }
    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (e) {
    next(e);
  }
}
