import mongoose from 'mongoose';
import { buildListFilter } from './todoAccessService.js';

export function decodeCursor(cursorStr) {
  if (!cursorStr) return null;
  try {
    const raw = Buffer.from(cursorStr, 'base64url').toString('utf8');
    const { createdAt, _id } = JSON.parse(raw);
    return { createdAt: new Date(createdAt), _id: new mongoose.Types.ObjectId(_id) };
  } catch {
    return null;
  }
}

export function encodeCursor(doc) {
  if (!doc?.createdAt || !doc?._id) return null;
  const payload = JSON.stringify({
    createdAt: doc.createdAt.toISOString(),
    _id: doc._id.toString(),
  });
  return Buffer.from(payload).toString('base64url');
}

export function buildTodoQuery(user, query) {
  const parts = [{ ...buildListFilter(user) }];

  if (query.status) parts.push({ status: query.status });
  if (query.priority) parts.push({ priority: query.priority });
  if (query.category) parts.push({ category: query.category });
  if (query.assignedTo) {
    parts.push({ assignedTo: new mongoose.Types.ObjectId(query.assignedTo) });
  }
  if (query.dateFrom || query.dateTo) {
    const range = {};
    if (query.dateFrom) range.$gte = new Date(query.dateFrom);
    if (query.dateTo) range.$lte = new Date(query.dateTo);
    parts.push({ dueDate: range });
  }
  if (query.q) {
    parts.push({ $text: { $search: query.q } });
  }

  if (parts.length === 1) return parts[0];
  return { $and: parts };
}

export function parseSort(sortParam) {
  const allowed = new Set(['dueDate', 'priorityRank', 'createdAt', 'status', '_id']);
  const parts = (sortParam || '-createdAt').split(',').filter(Boolean);
  const out = {};
  for (const p of parts) {
    if (p.startsWith('-')) {
      const k = p.slice(1);
      if (allowed.has(k)) out[k] = -1;
    } else if (allowed.has(p)) {
      out[p] = 1;
    }
  }
  if (Object.keys(out).length === 0) {
    return { createdAt: -1, _id: -1 };
  }
  if (!out._id) out._id = -1;
  return out;
}

export function applyCursorFilter(filter, cursorDoc) {
  if (!cursorDoc) return filter;
  const cursorCond = {
    $or: [
      { createdAt: { $lt: cursorDoc.createdAt } },
      { createdAt: cursorDoc.createdAt, _id: { $lt: cursorDoc._id } },
    ],
  };
  if (filter.$and) {
    return { $and: [...filter.$and, cursorCond] };
  }
  return { $and: [filter, cursorCond] };
}
