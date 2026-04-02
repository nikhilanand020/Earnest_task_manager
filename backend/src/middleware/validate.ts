import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType } from 'zod';

export const validate = (schema: ZodType<any, any, any>) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // Pass Zod error to global handler
    }
  };