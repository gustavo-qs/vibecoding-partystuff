import winston from 'winston';
import { CONFIG } from '../config/constants';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use to print out messages
const transports = [
  // Allow the use of the console to print the messages
  new winston.transports.Console({
    level: CONFIG.LOG_LEVEL,
    format,
  }),
  // Allow to print all the error level messages inside a file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Allow to print all the error message inside a file
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: CONFIG.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Create a stream object with a 'write' function that will be used by `morgan`
export const stream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Export logger functions with additional context
export const logWithContext = {
  info: (message: string, context?: any) => {
    const logMessage = context ? `${message} | ${JSON.stringify(context)}` : message;
    logger.info(logMessage);
  },

  error: (message: string, error?: any, context?: any) => {
    const logMessage = context ? `${message} | ${JSON.stringify(context)}` : message;
    if (error) {
      logger.error(`${logMessage} | Error: ${error.message || error}`);
    } else {
      logger.error(logMessage);
    }
  },

  warn: (message: string, context?: any) => {
    const logMessage = context ? `${message} | ${JSON.stringify(context)}` : message;
    logger.warn(logMessage);
  },

  debug: (message: string, context?: any) => {
    const logMessage = context ? `${message} | ${JSON.stringify(context)}` : message;
    logger.debug(logMessage);
  },

  http: (message: string, context?: any) => {
    const logMessage = context ? `${message} | ${JSON.stringify(context)}` : message;
    logger.http(logMessage);
  }
};

export default logger;
