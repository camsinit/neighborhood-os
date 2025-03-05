
/**
 * Error logging utilities for neighborhood hooks
 * 
 * This module provides standardized error logging throughout the neighborhood hooks
 */
import { ErrorLogInfo } from '../types';

/**
 * Log error with detailed context information
 * 
 * @param context - The context where the error occurred
 * @param error - The error object
 * @param additionalInfo - Additional information to include in the log
 */
export const logError = (context: string, error: any, additionalInfo?: ErrorLogInfo) => {
  console.error(`[useNeighborhood] Error in ${context}:`, 
    error?.message || error,
    {
      errorCode: error?.code,
      errorDetails: error?.details,
      ...additionalInfo
    }
  );
};

/**
 * Log debug information for neighborhood operations
 * 
 * @param message - The debug message
 * @param data - Data to include in the log
 */
export const logDebug = (message: string, data?: any) => {
  console.log(`[useNeighborhood] ${message}`, data || '');
};
