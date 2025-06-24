import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack, 
    details: err.details || {},
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated'
  });

  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';

  // Send the error response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.details && { details: err.details }),
    },
  });
};