import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refresh,
  logout,
  authLimiter,
  loginLimiter,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { registerRules, loginRules } from '../validators/authValidators.js';

const router = express.Router();

router.use(authLimiter);

router.post('/register', registerRules, validateRequest, register);
router.post('/login', loginLimiter, loginRules, validateRequest, login);
router.post('/refresh', [body('refreshToken').notEmpty()], validateRequest, refresh);
router.post('/logout', authenticate, [body('refreshToken').optional()], validateRequest, logout);

export default router;
