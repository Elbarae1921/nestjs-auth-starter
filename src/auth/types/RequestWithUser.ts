import { users } from '@prisma/client';
import { Request } from 'express';

export interface RefreshTokenPayload {
  sub: string;
  refreshToken: string;
}

export interface RequestWithRefreshToken extends Request {
  user: RefreshTokenPayload;
}

export interface RequestWithUser extends Request {
  user: users;
}
