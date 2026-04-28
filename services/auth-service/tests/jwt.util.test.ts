import { describe, it, expect } from 'vitest';
import { Role } from '@attendance-tracker/shared-types';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPair,
  decodeToken,
} from '../src/utils/jwt.util.js';

const payload = { sub: 'user-1', email: 'test@test.com', role: Role.STUDENT };

describe('JWT utils', () => {
  it('signs and verifies access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('signs and verifies refresh token', () => {
    const token = signRefreshToken('user-1');
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe('user-1');
  });

  it('buildTokenPair returns both tokens', () => {
    const { accessToken, refreshToken } = buildTokenPair('user-1', 'test@test.com', Role.ADMIN);
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(accessToken).not.toBe(refreshToken);
  });

  it('decodeToken returns payload without verification', () => {
    const token = signAccessToken(payload);
    const decoded = decodeToken(token);
    expect(decoded?.sub).toBe(payload.sub);
  });

  it('verifyAccessToken throws on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('verifyRefreshToken throws on invalid token', () => {
    expect(() => verifyRefreshToken('bad-token')).toThrow();
  });
});
