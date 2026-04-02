import "dotenv/config";
import express, { type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { type AuthRequest, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, taskIdSchema } from '../schemas/task.schema.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Protect all task routes
router.use(requireAuth as any);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: req.userId,
    };

    if (status === 'pending' || status === 'completed') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    res.status(200).json({
      tasks,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createTaskSchema), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    const { title, description } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: req.userId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validate(taskIdSchema), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    const id = req.params.id as string;
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validate(updateTaskSchema), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    const id = req.params.id as string;
    const { title, description, status } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingTask) {
      throw new AppError(404, 'Task not found');
    }

    const task = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validate(taskIdSchema), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    const id = req.params.id as string;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingTask) {
      throw new AppError(404, 'Task not found');
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', validate(taskIdSchema), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) { throw new AppError(401, 'Unauthorized'); }
    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

export default router;