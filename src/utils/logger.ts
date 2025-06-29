
/**
 * Simplified logging utility
 * Reduced verbosity and better performance
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
}

// More conservative configuration - only essential logging
const config: LoggerConfig = {
  minLevel: 'warn', // Only warnings and errors by default
  enabled: process.env.NODE_ENV === 'development'
};

const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Create a logger instance
 */
export function createLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    return config.enabled && LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
  };

  const formatMessage = (message: string): string => {
    return `[${moduleName}] ${message}`;
  };

  return {
    debug: (message: string, ...args: any[]): void => {
      if (shouldLog('debug')) {
        console.debug(formatMessage(message), ...args);
      }
    },

    info: (message: string, ...args: any[]): void => {
      if (shouldLog('info')) {
        console.info(formatMessage(message), ...args);
      }
    },

    warn: (message: string, ...args: any[]): void => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(message), ...args);
      }
    },

    error: (message: string, ...args: any[]): void => {
      if (shouldLog('error')) {
        console.error(formatMessage(message), ...args);
      }
    }
  };
}

/**
 * Set log level
 */
export function setLogLevel(level: LogLevel): void {
  config.minLevel = level;
}

/**
 * Enable/disable logging
 */
export function setLoggingEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

// Default logger
export default createLogger('App');
