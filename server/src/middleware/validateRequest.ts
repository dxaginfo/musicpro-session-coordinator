import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = formatErrors(errors.array());
    
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: formattedErrors,
      },
    });
  }
  
  next();
};

// Helper function to format validation errors
const formatErrors = (errors: ValidationError[]) => {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach((error) => {
    // If the error has a path, use it as the key
    const field = error.path || 'general';
    
    // Add the error message
    formattedErrors[field] = error.msg;
  });
  
  return formattedErrors;
};