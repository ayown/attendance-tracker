import { describe, it, expect } from 'vitest';
import { loginSchema, refreshSchema, createUserSchema } from '../src/utils/validator.util.js';
import { Role } from '@attendance-tracker/shared-types';

describe('Validator schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret123' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com', password: '123' });
      expect(result.success).toBe(false);
    });

    it('rejects missing fields', () => {
      expect(loginSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('refreshSchema', () => {
    it('accepts a token string', () => {
      expect(refreshSchema.safeParse({ refreshToken: 'some.token.here' }).success).toBe(true);
    });

    it('rejects empty token', () => {
      expect(refreshSchema.safeParse({ refreshToken: '' }).success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('accepts valid user data', () => {
      const result = createUserSchema.safeParse({
        email: 'admin@test.com',
        password: 'Admin@1234',
        name: 'Admin User',
        role: Role.ADMIN,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = createUserSchema.safeParse({
        email: 'admin@test.com',
        password: 'Admin@1234',
        name: 'Admin',
        role: 'INVALID_ROLE',
      });
      expect(result.success).toBe(false);
    });
  });
});
