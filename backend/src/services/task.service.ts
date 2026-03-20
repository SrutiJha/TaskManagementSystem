import { PrismaClient } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto, TaskQueryParams, PaginatedResponse } from '../types';

const prisma = new PrismaClient();

export class TaskService {
  async getTasks(userId: string, params: TaskQueryParams): Promise<PaginatedResponse<object>> {
    const page = Math.max(1, parseInt(params.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.search) where.title = { contains: params.search };

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    const validSortFields = ['title', 'createdAt', 'updatedAt', 'dueDate', 'priority', 'status'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, skip, take: limit, orderBy: { [orderByField]: sortOrder } }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: tasks,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) {
      const error = new Error('Task not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  async createTask(userId: string, dto: CreateTaskDto) {
    return prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'PENDING',
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        userId,
      },
    });
  }

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto) {
    await this.getTaskById(taskId, userId);
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
      },
    });
  }

  async deleteTask(taskId: string, userId: string) {
    await this.getTaskById(taskId, userId);
    await prisma.task.delete({ where: { id: taskId } });
  }

  async toggleTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId, userId);
    const nextStatus =
      task.status === 'COMPLETED' ? 'PENDING' :
      task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
    return prisma.task.update({ where: { id: taskId }, data: { status: nextStatus } });
  }

  async getTaskStats(userId: string) {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    ]);
    return { total, pending, inProgress, completed };
  }
}
