import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorMiddleware';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import sessionRoutes from './routes/sessionRoutes';
import messageRoutes from './routes/messageRoutes';
import fileRoutes from './routes/fileRoutes';

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('MusicPro Session Coordinator API');
});

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join a room (e.g., for private messages or project updates)
  socket.on('join', (room) => {
    socket.join(room);
    logger.info(`User ${socket.id} joined room: ${room}`);
  });

  // Leave a room
  socket.on('leave', (room) => {
    socket.leave(room);
    logger.info(`User ${socket.id} left room: ${room}`);
  });

  // Handle private messages
  socket.on('private-message', (data) => {
    const { room, message } = data;
    io.to(room).emit('private-message', message);
    logger.info(`Private message sent to room: ${room}`);
  });

  // Handle project updates
  socket.on('project-update', (data) => {
    const { projectId, update } = data;
    io.to(`project-${projectId}`).emit('project-update', update);
    logger.info(`Project update sent to project: ${projectId}`);
  });

  // Handle session updates
  socket.on('session-update', (data) => {
    const { sessionId, update } = data;
    io.to(`session-${sessionId}`).emit('session-update', update);
    logger.info(`Session update sent to session: ${sessionId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});