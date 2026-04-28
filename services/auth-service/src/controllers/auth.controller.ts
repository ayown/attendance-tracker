import type { Request, Response } from 'express';
import { successResponse, errorResponse } from '@attendance-tracker/utils';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json(errorResponse('Email and password are required'));
    return;
  }

  // TODO: Phase 2 — implement full JWT auth with DB lookup
  res.status(501).json(errorResponse('Not implemented', 'Auth DB not connected yet — Phase 2'));
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(400).json(errorResponse('Refresh token required'));
    return;
  }

  // TODO: Phase 2
  res.status(501).json(errorResponse('Not implemented'));
}

export async function logout(req: Request, res: Response): Promise<void> {
  // TODO: Phase 2 — blacklist token
  res.json(successResponse(null, 'Logged out'));
}
