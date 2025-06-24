import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import logger from '../utils/logger';

// Define the extended Request interface with user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Check if token exists in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from the header
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token is found, return unauthorized
    if (!token) {
      return res.status(401).json({ 
        error: {
          message: 'Not authorized, no token provided'
        }
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        role: string;
      };

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true }
      });

      // If user doesn't exist, return unauthorized
      if (!user) {
        return res.status(401).json({ 
          error: {
            message: 'Not authorized, user not found'
          } 
        });
      }

      // Add user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      logger.error('Token verification failed', { error });
      return res.status(401).json({ 
        error: {
          message: 'Not authorized, token invalid'
        } 
      });
    }
  } catch (error) {
    logger.error('Error in auth middleware', { error });
    return res.status(500).json({ 
      error: {
        message: 'Server error during authentication'
      } 
    });
  }
};

// Middleware to check if user has the required role
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: {
          message: 'Not authorized, no user found'
        } 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: {
          message: 'Not authorized, insufficient permissions'
        } 
      });
    }

    next();
  };
};