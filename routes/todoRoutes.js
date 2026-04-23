import express from 'express';
import { body } from 'express-validator';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  bulkDeleteTodos,
  bulkUpdateTodos,
  assignTodo,
} from '../controllers/todoController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizeMiddleware.js';
import { PERMISSIONS } from '../config/constants.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/bulk-delete',
  [body('ids').isArray({ min: 1 })],
  validateRequest,
  bulkDeleteTodos,
);
router.patch(
  '/bulk-update',
  [body('ids').isArray({ min: 1 }), body('data').isObject()],
  validateRequest,
  bulkUpdateTodos,
);

router.post(
  '/:id/assign',
  requirePermission(PERMISSIONS.TODOS_ASSIGN),
  [body('userId').notEmpty()],
  validateRequest,
  assignTodo,
);

router.route('/').get(getAllTodos).post(createTodo);
router.route('/:id').get(getTodoById).put(updateTodo).delete(deleteTodo);
router.patch('/:id/toggle', toggleTodoComplete);

export default router;
