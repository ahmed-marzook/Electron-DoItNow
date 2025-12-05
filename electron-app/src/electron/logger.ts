import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { app } from 'electron'
import path from 'path'
import { isDev } from './util.js'
import chalk from 'chalk'

// Get logs directory path
const getLogsPath = (): string => {
  if (isDev()) {
    // In development, store logs in the project directory
    return path.join(process.cwd(), 'logs')
  }
  // In production, use the app's user data directory
  return path.join(app.getPath('userData'), 'logs')
}

// Custom format for console output with chalk colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Format timestamp with gray color
    const formattedTimestamp = chalk.gray(timestamp)

    // Format level with appropriate colors and badges
    let formattedLevel = ''
    switch (level) {
      case 'error':
        formattedLevel = chalk.bgRed.white.bold(' ERROR ')
        break
      case 'warn':
        formattedLevel = chalk.bgYellow.black.bold(' WARN  ')
        break
      case 'info':
        formattedLevel = chalk.bgBlue.white.bold(' INFO  ')
        break
      case 'debug':
        formattedLevel = chalk.bgMagenta.white.bold(' DEBUG ')
        break
      default:
        formattedLevel = chalk.bgGray.white.bold(` ${level.toUpperCase().padEnd(5)} `)
    }

    // Format message
    let formattedMessage = message
    if (level === 'error') {
      formattedMessage = chalk.red(message)
    } else if (level === 'warn') {
      formattedMessage = chalk.yellow(message)
    } else if (level === 'info') {
      formattedMessage = chalk.cyan(message)
    } else if (level === 'debug') {
      formattedMessage = chalk.magenta(message)
    }

    // Format metadata
    let metaStr = ''
    if (Object.keys(meta).length > 0) {
      // Remove Winston internal fields
      const cleanMeta = { ...meta }
      delete cleanMeta.service
      delete cleanMeta.timestamp
      delete cleanMeta.level
      delete cleanMeta.message

      if (Object.keys(cleanMeta).length > 0) {
        metaStr = '\n' + chalk.dim(JSON.stringify(cleanMeta, null, 2))
      }
    }

    return `${formattedTimestamp} ${formattedLevel} ${formattedMessage}${metaStr}`
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
