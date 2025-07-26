
/**
 * Centralized logging utility with environment-aware configuration
 * Provides clean, consistent logging across the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  debugMode: boolean;
}

// Check for debug mode from URL parameters or environment
const isDebugMode = () => {
  if (typeof window !== 'undefined') {
    return window.location.search.includes('debug=true');
  }
  return process.env.NODE_ENV === 'development';
};

// Production-ready configuration with minimal logging by default
const config: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'error' : 'error', // Only show errors
  enabled: true,
  debugMode: isDebugMode()
};

const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Create a logger instance for a specific module
 * 
 * @param moduleName - Name of the module/component using the logger
 * @returns Logger instance with debug, info, warn, error methods
 */
export function createLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    if (!config.enabled) return false;
    
    // In debug mode, allow all levels
    if (config.debugMode && level === 'debug') return true;
    
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
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
 * Set global log level
 */
export function setLogLevel(level: LogLevel): void {
  config.minLevel = level;
}

/**
 * Enable/disable all logging
 */
export function setLoggingEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

/**
 * Toggle debug mode programmatically
 */
export function setDebugMode(enabled: boolean): void {
  config.debugMode = enabled;
}

// Default logger for general app use
export default createLogger('App');
