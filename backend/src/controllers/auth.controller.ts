import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, password } = req.body;
      const result = await authService.register(email, name, password);
      sendCreated(res, result, 'Registration successful');
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, 'Refresh token is required', 400);
        return;
      }
      const tokens = await authService.refresh(refreshToken);
      sendSuccess(res, tokens, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.id);
      sendSuccess(res, null, 'Logged out from all devices');
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    sendSuccess(res, { user: req.user });
  }
}
