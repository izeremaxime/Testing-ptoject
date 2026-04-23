import mongoose from 'mongoose';
import {
  decodeCursor,
  encodeCursor,
  buildTodoQuery,
  parseSort,
  applyCursorFilter,
} from '../../services/todoQueryService.js';
import { ROLES } from '../../config/constants.js';

describe('todoQueryService', () => {
  const user = { _id: new mongoose.Types.ObjectId(), role: ROLES.USER };

  test('encodeCursor round-trip', () => {
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };
    const c = encodeCursor(doc);
    const decoded = decodeCursor(c);
    expect(decoded._id.toString()).toBe(doc._id.toString());
    expect(decoded.createdAt.getTime()).toBe(doc.createdAt.getTime());
  });

  test('buildTodoQuery applies filters for user', () => {
    const q = buildTodoQuery(user, { status: 'pending', priority: 'high' });
    expect(q.$and).toBeDefined();
    expect(q.$and.some((p) => p.status === 'pending')).toBe(true);
    expect(q.$and.some((p) => p.priority === 'high')).toBe(true);
  });

  test('parseSort default', () => {
    expect(parseSort()).toMatchObject({ createdAt: -1 });
  });

  test('applyCursorFilter wraps filter', () => {
    const base = { a: 1 };
    const cur = { createdAt: new Date(), _id: new mongoose.Types.ObjectId() };
    const out = applyCursorFilter(base, cur);
    expect(out.$and).toHaveLength(2);
  });
});
