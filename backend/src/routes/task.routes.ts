import { Router } from 'express';
import { body, query } from 'express-validator';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  ],
  validate,
  (req, res, next) => taskController.getTasks(req as AuthenticatedRequest, res, next)
);

router.get('/stats', (req, res, next) =>
  taskController.getStats(req as AuthenticatedRequest, res, next)
);

router.get('/:id', (req, res, next) =>
  taskController.getTask(req as AuthenticatedRequest, res, next)
);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  (req, res, next) => taskController.createTask(req as AuthenticatedRequest, res, next)
);

router.patch(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  (req, res, next) => taskController.updateTask(req as AuthenticatedRequest, res, next)
);

router.delete('/:id', (req, res, next) =>
  taskController.deleteTask(req as AuthenticatedRequest, res, next)
);

router.patch('/:id/toggle', (req, res, next) =>
  taskController.toggleTask(req as AuthenticatedRequest, res, next)
);

export default router;
