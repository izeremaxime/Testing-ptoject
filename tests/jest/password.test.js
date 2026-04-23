import { validatePasswordStrength } from '../../utils/password.js';

describe('validatePasswordStrength', () => {
  test('accepts strong password', () => {
    expect(validatePasswordStrength('Aa1!aaaa')).toBe(true);
  });

  test('rejects short password', () => {
    expect(validatePasswordStrength('Aa1!aa')).toBe(false);
  });

  test('rejects missing uppercase', () => {
    expect(validatePasswordStrength('aa1!aaaa')).toBe(false);
  });

  test('rejects missing number', () => {
    expect(validatePasswordStrength('Aa!aaaaa')).toBe(false);
  });

  test('rejects missing special char', () => {
    expect(validatePasswordStrength('Aa1aaaaa')).toBe(false);
  });
});
