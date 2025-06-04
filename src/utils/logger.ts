
/**
 * Logging utility for consistent logging across the application
 * Updated to reduce console noise and prevent development tool interference
 */

// Log levels
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  debugMode: boolean;
  enableDevTools: boolean; // New flag to control development tools
}

// Default configuration - more conservative to prevent console spam
const config: LoggerConfig = {
  minLevel: 'warn', // Changed from 'info' to 'warn' to reduce noise
  debugMode: process.env.NODE_ENV === 'development',
  enableDevTools: false // Disable development tools by default
};

// Log level priority
const LOG_LEVEL_PRIORITY = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
};

/**
 * Create a logger instance with a specific module name
 * 
 * @param moduleName Name of the module for context
 * @returns Logger instance with trace, debug, info, warn, and error methods
 */
export function createLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    // Don't log if development tools are disabled and it's a debug/trace message
    if (!config.enableDevTools && (level === 'debug' || level === 'trace')) return false;
    
    if (!config.debugMode && (level === 'debug' || level === 'trace')) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
  };

  const formatMessage = (message: string): string => {
    return `[${moduleName}] ${message}`;
  };

  return {
    /**
     * Log a trace message (lowest level, most detailed debugging)
     * Only shown when explicitly enabled
     */
    trace: (message: string, ...args: any[]): void => {
      if (shouldLog('trace') && config.enableDevTools) {
        console.debug(`TRACE: ${formatMessage(message)}`, ...args);
      }
    },

    /**
     * Log a debug message (only in development with dev tools enabled)
     */
    debug: (message: string, ...args: any[]): void => {
      if (shouldLog('debug') && config.enableDevTools) {
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

/**
 * Enable or disable development tools
 * 
 * @param enabled Whether development tools should be enabled
 */
export function setDevToolsEnabled(enabled: boolean): void {
  config.enableDevTools = enabled;
}

// Create a default application logger
export default createLogger('App');
