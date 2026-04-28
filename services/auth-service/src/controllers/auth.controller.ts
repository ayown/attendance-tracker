import type { Request, Response } from 'express';
import { successResponse, errorResponse } from '@attendance-tracker/utils';
import { Role } from '@attendance-tracker/shared-types';
import prisma from '../lib/prisma.js';
import { comparePassword } from '../utils/password.util.js';
import { buildTokenPair, verifyRefreshToken } from '../utils/jwt.util.js';
import { loginSchema, refreshSchema } from '../utils/validator.util.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse('Validation failed', parsed.error.issues[0]?.message));
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    res.status(401).json(errorResponse('Invalid credentials'));
    return;
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    res.status(401).json(errorResponse('Invalid credentials'));
    return;
  }

  const { accessToken, refreshToken } = buildTokenPair(user.id, user.email, user.role as Role);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  res.json(
    successResponse(
      {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      'Login successful'
    )
  );
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse('Refresh token is required'));
    return;
  }

  const { refreshToken: token } = parsed.data;

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.status(401).json(errorResponse('Invalid or expired refresh token'));
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    res.status(401).json(errorResponse('Refresh token revoked or expired'));
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    res.status(401).json(errorResponse('User not found or inactive'));
    return;
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });

  const { accessToken, refreshToken: newRefreshToken } = buildTokenPair(
    user.id,
    user.email,
    user.role as Role
  );

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  res.json(successResponse({ accessToken, refreshToken: newRefreshToken }));
}

export async function logout(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    await prisma.refreshToken
      .update({
        where: { token: parsed.data.refreshToken },
        data: { isRevoked: true },
      })
      .catch(() => null);
  }
  res.json(successResponse(null, 'Logged out successfully'));
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  res.json(successResponse(user));
}
