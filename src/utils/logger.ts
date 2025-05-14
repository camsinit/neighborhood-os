
/**
 * Logging utility for consistent logging across the application
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  debugMode: boolean;
}

// Default configuration
const config: LoggerConfig = {
  minLevel: 'info',
  debugMode: process.env.NODE_ENV === 'development'
};

// Log level priority
const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Create a logger instance with a specific module name
 * 
 * @param moduleName Name of the module for context
 * @returns Logger instance with debug, info, warn, and error methods
 */
export function createLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    if (!config.debugMode && level === 'debug') return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
  };

  const formatMessage = (message: string): string => {
    return `[${moduleName}] ${message}`;
  };

  return {
    /**
     * Log a debug message (only in development)
     */
    debug: (message: string, ...args: any[]): void => {
      if (shouldLog('debug')) {
        console.debug(formatMessage(message), ...args);
      }
    },

    /**
     * Log an info message
     */
    info: (message: string, ...args: any[]): void => {
      if (shouldLog('info')) {
        console.info(formatMessage(message), ...args);
      }
    },

    /**
     * Log a warning message
     */
    warn: (message: string, ...args: any[]): void => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(message), ...args);
      }
    },

    /**
     * Log an error message
     */
    error: (message: string, ...args: any[]): void => {
      if (shouldLog('error')) {
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
