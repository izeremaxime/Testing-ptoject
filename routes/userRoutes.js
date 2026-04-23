import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizeMiddleware.js';
import { PERMISSIONS } from '../config/constants.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { changePasswordRules } from '../validators/authValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch(
  '/me',
  [body('name').optional().trim().notEmpty(), body('email').optional().isEmail()],
  validateRequest,
  userController.updateProfile,
);
router.post(
  '/me/password',
  changePasswordRules,
  validateRequest,
  userController.changePassword,
);
router.delete('/me', userController.deleteAccount);
router.get('/me/stats', userController.myStats);

router.get('/', requirePermission(PERMISSIONS.USERS_MANAGE), userController.listUsers);
router.patch(
  '/:id/role',
  requirePermission(PERMISSIONS.USERS_MANAGE),
  [body('role').notEmpty()],
  validateRequest,
  userController.updateUserRole,
);

export default router;
