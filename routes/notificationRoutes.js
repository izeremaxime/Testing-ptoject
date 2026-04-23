import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', notificationController.listNotifications);
router.patch('/:id/read', notificationController.markRead);

export default router;
