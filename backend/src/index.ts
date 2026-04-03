import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const app = express();
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);

app.get('/', (req, res) => {
  res.send('Task Manager API');
});

app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
