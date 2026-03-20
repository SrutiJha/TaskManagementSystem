import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch {
    sendError(res, 'Invalid or expired access token', 401);
  }
};
