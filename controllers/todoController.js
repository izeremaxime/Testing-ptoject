import Todo from '../models/Todo.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../config/constants.js';
import { canAccessTodo, canAssignTodo } from '../services/todoAccessService.js';
import {
  applyCursorFilter,
  buildTodoQuery,
  decodeCursor,
  encodeCursor,
  parseSort,
} from '../services/todoQueryService.js';

function mapBodyFromLegacy(body) {
  const out = { ...body };
  if (out.completed !== undefined && out.status === undefined) {
    out.status = out.completed ? 'completed' : 'pending';
  }
  delete out.completed;
  return out;
}

export const createTodo = async (req, res, next) => {
  try {
    const payload = mapBodyFromLegacy(req.body);
    payload.createdBy = req.user._id;
    const todo = await Todo.create(payload);
    res.status(201).json({ success: true, data: todo });
  } catch (e) {
    next(e);
  }
};

export const getAllTodos = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const filter = buildTodoQuery(req.user, req.query);
    const cursorDoc = decodeCursor(req.query.cursor);
    const finalFilter = applyCursorFilter(filter, cursorDoc);
    const sort = parseSort(req.query.sort);

    const items = await Todo.find(finalFilter).sort(sort).limit(limit + 1).lean();

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor =
      hasMore && page.length ? encodeCursor(page[page.length - 1]) : null;

    res.status(200).json({
      success: true,
      count: page.length,
      nextCursor,
      data: page,
    });
  } catch (e) {
    next(e);
  }
};

export const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    if (!canAccessTodo(req.user, todo)) {
      throw AppError.forbidden('Cannot access this todo');
    }
    res.status(200).json({ success: true, data: todo });
  } catch (e) {
    next(e);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    if (!canAccessTodo(req.user, todo)) {
      throw AppError.forbidden('Cannot update this todo');
    }
    const payload = mapBodyFromLegacy(req.body);
    Object.assign(todo, payload);
    await todo.save();
    res.status(200).json({ success: true, data: todo });
  } catch (e) {
    next(e);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    if (!canAccessTodo(req.user, todo)) {
      throw AppError.forbidden('Cannot delete this todo');
    }
    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (e) {
    next(e);
  }
};

export const toggleTodoComplete = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    if (!canAccessTodo(req.user, todo)) {
      throw AppError.forbidden('Cannot modify this todo');
    }
    if (todo.status === 'completed') {
      todo.status = 'pending';
      todo.completed = false;
    } else {
      todo.status = 'completed';
      todo.completed = true;
    }
    await todo.save();
    res.status(200).json({ success: true, data: todo });
  } catch (e) {
    next(e);
  }
};

export const bulkDeleteTodos = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      throw AppError.badRequest('ids array required');
    }
    const todos = await Todo.find({ _id: { $in: ids } });
    const allowed = todos.filter((t) => canAccessTodo(req.user, t)).map((t) => t._id);
    await Todo.deleteMany({ _id: { $in: allowed } });
    res.json({ success: true, data: { deleted: allowed.length } });
  } catch (e) {
    next(e);
  }
};

export const bulkUpdateTodos = async (req, res, next) => {
  try {
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || !ids.length || !data || typeof data !== 'object') {
      throw AppError.badRequest('ids array and data object required');
    }
    const payload = mapBodyFromLegacy(data);
    delete payload.createdBy;
    const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };
    if (payload.priority) {
      payload.priorityRank = PRIORITY_RANK[payload.priority] ?? 2;
    }
    const todos = await Todo.find({ _id: { $in: ids } });
    const allowed = todos.filter((t) => canAccessTodo(req.user, t)).map((t) => t._id);
    await Todo.updateMany({ _id: { $in: allowed } }, { $set: payload });
    res.json({ success: true, data: { updated: allowed.length } });
  } catch (e) {
    next(e);
  }
};

export const assignTodo = async (req, res, next) => {
  try {
    if (!canAssignTodo(req.user)) {
      throw AppError.forbidden('Cannot assign todos');
    }
    const { userId } = req.body;
    const assignee = await User.findById(userId);
    if (!assignee) throw AppError.badRequest('Assignee not found');
    if (assignee.role === ROLES.ADMIN && req.user.role !== ROLES.ADMIN) {
      throw AppError.forbidden('Cannot assign to admin');
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ success: false, error: 'Todo not found' });
    if (!canAccessTodo(req.user, todo)) {
      throw AppError.forbidden('Cannot assign this todo');
    }
    todo.assignedTo = assignee._id;
    todo.assignedBy = req.user._id;
    todo.assignmentHistory.push({
      assignedTo: assignee._id,
      assignedBy: req.user._id,
      at: new Date(),
    });
    await todo.save();

    await Notification.create({
      userId: assignee._id,
      title: 'New todo assignment',
      message: `You were assigned: ${todo.title}`,
      type: 'assignment',
      relatedTodoId: todo._id,
    });

    res.json({ success: true, data: todo });
  } catch (e) {
    next(e);
  }
};
