import { AppError } from '../../utils/AppError.js';

describe('AppError', () => {
  test('carries status and code', () => {
    const e = AppError.badRequest('bad', 'BAD');
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe('BAD');
  });
});
