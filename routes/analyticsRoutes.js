import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizeMiddleware.js';
import { PERMISSIONS } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/system',
  requirePermission(PERMISSIONS.SYSTEM_ANALYTICS),
  analyticsController.systemAnalytics,
);
router.get(
  '/team',
  requirePermission(PERMISSIONS.TODOS_TEAM_ANALYTICS),
  analyticsController.teamAnalytics,
);
router.get(
  '/export',
  requirePermission(PERMISSIONS.TODOS_EXPORT),
  analyticsController.exportTodos,
);

export default router;
