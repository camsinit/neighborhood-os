
/**
 * Logging utility for consistent logging across the application
 */

// Log levels
export enum LogLevel {
  TRACE = -1,
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  debugMode: boolean;
}

// Default configuration
const config: LoggerConfig = {
  minLevel: LogLevel.INFO,
  debugMode: process.env.NODE_ENV === 'development'
};

/**
 * Create a logger instance with a specific module name
 * 
 * @param moduleName Name of the module for context
 * @returns Logger instance with debug, info, warn, and error methods
 */
export function createLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    if (!config.debugMode && level === LogLevel.DEBUG) return false;
    return level >= config.minLevel;
  };

  const formatMessage = (message: string): string => {
    return `[${moduleName}] ${message}`;
  };

  return {
    /**
     * Log a trace message (only in development)
     */
    trace: (message: string, ...args: any[]): void => {
      if (shouldLog(LogLevel.TRACE)) {
        console.debug(`TRACE ${formatMessage(message)}`, ...args);
      }
    },

    /**
     * Log a debug message (only in development)
     */
    debug: (message: string, ...args: any[]): void => {
      if (shouldLog(LogLevel.DEBUG)) {
        console.debug(formatMessage(message), ...args);
      }
    },

    /**
     * Log an info message
     */
    info: (message: string, ...args: any[]): void => {
      if (shouldLog(LogLevel.INFO)) {
        console.info(formatMessage(message), ...args);
      }
    },

    /**
     * Log a warning message
     */
    warn: (message: string, ...args: any[]): void => {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(formatMessage(message), ...args);
      }
    },

    /**
     * Log an error message
     */
    error: (message: string, ...args: any[]): void => {
      if (shouldLog(LogLevel.ERROR)) {
        console.error(formatMessage(message), ...args);
      }
    }
  };
}

/**
 * Set minimum log level for all loggers
 * 
 * @param level Minimum log level to display
 */
export function setLogLevel(level: LogLevel): void {
  config.minLevel = level;
}

/**
 * Enable or disable debug mode
 * 
 * @param enabled Whether debug mode should be enabled
 */
export function setDebugMode(enabled: boolean): void {
  config.debugMode = enabled;
}

// Create a default application logger
export default createLogger('App');
