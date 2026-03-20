import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// POST /auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validate,
  (req, res, next) => authController.register(req, res, next)
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  (req, res, next) => authController.login(req, res, next)
);

// POST /auth/refresh
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// POST /auth/logout
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// POST /auth/logout-all (requires auth)
router.post('/logout-all', authenticate, (req, res, next) =>
  authController.logoutAll(req as import('../types').AuthenticatedRequest, res, next)
);

// GET /auth/me (requires auth)
router.get('/me', authenticate, (req, res) =>
  authController.me(req as import('../types').AuthenticatedRequest, res)
);

export default router;
