import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for the timestamp
const timestampFormat = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' });

// Define format for console logs
const consoleFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Define format for file logs
const fileFormat = winston.format.combine(
  timestampFormat,
  winston.format.json()
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file transport
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  
  // All logs file transport
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;