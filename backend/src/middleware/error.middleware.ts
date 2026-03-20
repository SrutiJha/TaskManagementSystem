import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${err.message}`, err.stack);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    sendError(res, 'A record with this value already exists', 409);
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    sendError(res, 'Record not found', 404);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  sendError(res, message, statusCode);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
