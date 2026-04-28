import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { Role } from '@attendance-tracker/shared-types';
import { authenticate } from '../src/middleware/auth.middleware.js';
import { requireRole } from '../src/middleware/role.middleware.js';
import { signAccessToken } from '../src/utils/jwt.util.js';

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('authenticate middleware', () => {
  it('calls next() with valid token', () => {
    const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: Role.STUDENT });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.sub).toBe('u1');
  });

  it('returns 401 for missing header', () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad.token' } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('requireRole middleware', () => {
  it('calls next() when role matches', () => {
    const req = {
      user: { sub: 'u1', email: 'a@b.com', role: Role.ADMIN },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireRole(Role.ADMIN, Role.SUPER_ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 when role does not match', () => {
    const req = {
      user: { sub: 'u1', email: 'a@b.com', role: Role.STUDENT },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireRole(Role.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not attached', () => {
    const req = {} as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireRole(Role.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
