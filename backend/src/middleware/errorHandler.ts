import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ error: 'Endpoint Not Found' });
};