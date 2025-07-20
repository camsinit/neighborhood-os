
/**
 * Safe fetch utility with retry limits and minimal logging
 * 
 * This utility prevents infinite loops by limiting retry attempts
 * and providing graceful degradation when requests fail
 */
import { createLogger } from './logger';

const logger = createLogger('safeFetch');

interface SafeFetchOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface RetryState {
  attempts: number;
  lastError?: Error;
}

// Track retry attempts per URL to prevent infinite loops
const retryTracker = new Map<string, RetryState>();

/**
 * Fetch with built-in retry limits and error handling
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options with additional retry configuration
 * @returns Promise that resolves with response or rejects with error
 */
export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  // Get or create retry state for this URL
  const retryState = retryTracker.get(url) || { attempts: 0 };
  
  // If we've exceeded max retries, throw the last error
  if (retryState.attempts >= maxRetries) {
    logger.warn(`Max retries (${maxRetries}) exceeded for ${url}`, retryState.lastError);
    throw retryState.lastError || new Error(`Max retries exceeded for ${url}`);
  }

  // Increment attempt counter
  retryState.attempts++;
  retryTracker.set(url, retryState);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Only log on first attempt to reduce noise
    if (retryState.attempts === 1) {
      logger.debug(`Fetching ${url}`);
    }

    // Make the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    // Clear timeout
    clearTimeout(timeoutId);

    // If successful, reset retry counter
    if (response.ok) {
      retryTracker.delete(url);
      return response;
    }

    // Handle non-ok responses
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    retryState.lastError = error;
    retryTracker.set(url, retryState);
    
    throw error;

  } catch (error) {
    const fetchError = error as Error;
    retryState.lastError = fetchError;
    retryTracker.set(url, retryState);

    // If this was the last attempt, clean up and throw
    if (retryState.attempts >= maxRetries) {
      retryTracker.delete(url);
      throw fetchError;
    }

    // Only log retries, not every attempt
    if (retryState.attempts > 1) {
      logger.debug(`Retry ${retryState.attempts - 1}/${maxRetries - 1} for ${url}: ${fetchError.message}`);
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    // Retry recursively
    return safeFetch(url, options);
  }
}

/**
 * Reset retry counters for a specific URL or all URLs
 * 
 * @param url - Optional URL to reset, if not provided resets all
 */
export function resetRetryCounters(url?: string): void {
  if (url) {
    retryTracker.delete(url);
  } else {
    retryTracker.clear();
  }
}

/**
 * Get current retry statistics
 * 
 * @returns Object with retry statistics
 */
export function getRetryStats(): Record<string, RetryState> {
  return Object.fromEntries(retryTracker.entries());
}
