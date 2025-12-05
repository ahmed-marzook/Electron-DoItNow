import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { app } from 'electron'
import path from 'path'
import { isDev } from './util.js'

// Get logs directory path
const getLogsPath = (): string => {
  if (isDev()) {
    // In development, store logs in the project directory
    return path.join(process.cwd(), 'logs')
  }
  // In production, use the app's user data directory
  return path.join(app.getPath('userData'), 'logs')
}

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  }),
)

// Format for file output without colors
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Create the logger instance
const logger = winston.createLogger({
  level: isDev() ? 'debug' : 'info',
  format: fileFormat,
  defaultMeta: { service: 'electron-app' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Daily rotate file for all logs
    new DailyRotateFile({
      filename: path.join(getLogsPath(), 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    // Separate file for errors
    new DailyRotateFile({
      filename: path.join(getLogsPath(), 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(getLogsPath(), 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(getLogsPath(), 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
})

// Export the logger instance
export default logger

// Export convenience methods
export const logInfo = (message: string, meta?: object) =>
  logger.info(message, meta)
export const logError = (message: string, error?: Error | object) =>
  logger.error(message, error)
export const logWarn = (message: string, meta?: object) =>
  logger.warn(message, meta)
export const logDebug = (message: string, meta?: object) =>
  logger.debug(message, meta)
