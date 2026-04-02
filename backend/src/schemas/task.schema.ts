import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(200, 'Title is too long').optional(),
    description: z.string().max(1000, 'Description is too long').optional(),
    status: z.enum(['pending', 'completed']).optional(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});
