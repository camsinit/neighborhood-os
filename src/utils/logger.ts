
/**
 * Centralized logging utility with configurable log levels
 * 
 * This utility helps control console output throughout the application,
 * allowing developers to:
 * - Set global log levels to control verbosity
 * - Categorize logs by component/module
 * - Enable/disable debugging logs via localStorage
 */

// Log levels in order of increasing verbosity
export enum LogLevel {
  NONE = 0,   // No logging
  ERROR = 1,  // Only errors
  WARN = 2,   // Errors and warnings
  INFO = 3,   // Standard information
  DEBUG = 4,  // Detailed debugging info
  TRACE = 5   // Very verbose tracing
}

// Default to INFO level in production, DEBUG in development
const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

// Configuration interface for the logger
interface LoggerConfig {
  level: LogLevel;
  enabledModules: string[];
}

// Initialize configuration from localStorage or defaults
const initConfig = (): LoggerConfig => {
  try {
    // Check if user has set preferences in localStorage
    const savedConfig = localStorage.getItem('logger-config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // Default configuration - changed from DEBUG to TRACE to see more detailed logs
  return {
    level: LogLevel.TRACE,
    enabledModules: ['*'] // '*' means all modules enabled
  };
};

// Global configuration
let config = initConfig();

/**
 * Logger class for consistent, configurable logging
 */
export class Logger {
  private moduleName: string;
  
  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }
  
  // Check if this module's logs should be shown
  private isModuleEnabled(): boolean {
    return (
      config.enabledModules.includes('*') || 
      config.enabledModules.includes(this.moduleName)
    );
  }
  
  // Format a message with the module name
  private format(message: string): string {
    return `[${this.moduleName}] ${message}`;
  }
  
  // Core logging method
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // Skip logging if level is too verbose or module is disabled
    if (level > config.level || !this.isModuleEnabled()) {
      return;
    }
    
    const formattedMessage = this.format(message);
    
    switch(level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.log(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedMessage, ...args);
        break;
    }
  }
  
  // Public API methods
  
  /**
   * Log an error message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param args Additional arguments to log
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
  
  /**
   * Log a trace message (very verbose)
   * @param message The message to log
   * @param args Additional arguments to log
   */
  trace(message: string, ...args: any[]): void {
    this.log(LogLevel.TRACE, message, ...args);
  }
}

/**
 * Set the global log level
 * @param level The new log level
 */
export const setLogLevel = (level: LogLevel): void => {
  config.level = level;
  saveConfig();
};

/**
 * Enable logging for specific modules
 * @param modules Module names to enable
 */
export const enableModules = (modules: string[]): void => {
  config.enabledModules = modules;
  saveConfig();
};

/**
 * Save current config to localStorage
 */
const saveConfig = (): void => {
  try {
    localStorage.setItem('logger-config', JSON.stringify(config));
  } catch (e) {
    // Ignore localStorage errors
  }
};

/**
 * Create a new logger for a specific module
 * @param moduleName Name of the module for log messages
 * @returns A Logger instance
 */
export const createLogger = (moduleName: string): Logger => {
  return new Logger(moduleName);
};
