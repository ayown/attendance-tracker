import jwt from 'jsonwebtoken';
import type { JWTPayload, Role } from '@attendance-tracker/shared-types';
import { JWT_CONFIG } from '@attendance-tracker/config';

const ACCESS_SECRET = process.env['JWT_SECRET']!;
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']!;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment');
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

export function buildTokenPair(userId: string, email: string, role: Role) {
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken(userId);
  return { accessToken, refreshToken };
}
