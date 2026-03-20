import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthenticatedRequest, TaskQueryParams } from '../types';

const taskService = new TaskService();

export class TaskController {
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const params: TaskQueryParams = {
        page: req.query.page as string,
        limit: req.query.limit as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await taskService.getTasks(req.user!.id, params);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user!.id);
      sendSuccess(res, task);
    } catch (err) { next(err); }
  }

  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.user!.id, req.body);
      sendCreated(res, task, 'Task created successfully');
    } catch (err) { next(err); }
  }

  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.updateTask(req.params.id, req.user!.id, req.body);
      sendSuccess(res, task, 'Task updated successfully');
    } catch (err) { next(err); }
  }

  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.deleteTask(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (err) { next(err); }
  }

  async toggleTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.toggleTask(req.params.id, req.user!.id);
      sendSuccess(res, task, 'Task status updated');
    } catch (err) { next(err); }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await taskService.getTaskStats(req.user!.id);
      sendSuccess(res, stats);
    } catch (err) { next(err); }
  }
}
