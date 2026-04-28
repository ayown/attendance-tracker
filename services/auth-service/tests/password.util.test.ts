import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/utils/password.util.js';

describe('Password utils', () => {
  it('hashes a password', async () => {
    const hash = await hashPassword('MyPassword123');
    expect(hash).not.toBe('MyPassword123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('comparePassword returns true for matching password', async () => {
    const hash = await hashPassword('MyPassword123');
    expect(await comparePassword('MyPassword123', hash)).toBe(true);
  });

  it('comparePassword returns false for wrong password', async () => {
    const hash = await hashPassword('MyPassword123');
    expect(await comparePassword('WrongPassword', hash)).toBe(false);
  });

  it('produces unique hashes for same input', async () => {
    const h1 = await hashPassword('SamePassword');
    const h2 = await hashPassword('SamePassword');
    expect(h1).not.toBe(h2);
  });
});
