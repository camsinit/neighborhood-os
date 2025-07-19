
/**
 * Development server connection handler
 * 
 * This handles connections to development servers with proper error handling
 * to prevent infinite loops and CORS issues
 */

import { safeFetch, resetRetryCounters } from './safeFetch';

interface DevServerConfig {
  enabled: boolean;
  url?: string;
  pollInterval: number;
  maxRetries: number;
}

// Default configuration for development server
const DEFAULT_CONFIG: DevServerConfig = {
  enabled: process.env.NODE_ENV === 'development',
  pollInterval: 5000, // 5 seconds
  maxRetries: 3
};

let pollTimeoutId: NodeJS.Timeout | null = null;
let isPolling = false;

/**
 * Start polling the development server
 * 
 * @param config - Optional configuration overrides
 */
export function startDevServerPolling(config: Partial<DevServerConfig> = {}): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Don't start if already polling or disabled
  if (isPolling || !finalConfig.enabled) {
    return;
  }

  // Don't poll in production
  if (process.env.NODE_ENV === 'production') {
    console.log('[DevServer] Skipping dev server polling in production');
    return;
  }

  // Only log startup once to reduce console noise
  if (process.env.NODE_ENV === 'development' && window.location.search.includes('debug=true')) {
    console.log('[DevServer] Starting development server polling');
  }
  isPolling = true;
  
  pollDevServer(finalConfig);
}

/**
 * Stop polling the development server
 */
export function stopDevServerPolling(): void {
  if (pollTimeoutId) {
    clearTimeout(pollTimeoutId);
    pollTimeoutId = null;
  }
  isPolling = false;
  console.log('[DevServer] Stopped development server polling');
}

/**
 * Internal polling function
 */
async function pollDevServer(config: DevServerConfig): Promise<void> {
  if (!isPolling) {
    return;
  }

  try {
    // Try to detect the dev server URL if not provided
    const devServerUrl = config.url || detectDevServerUrl();
    
    if (!devServerUrl) {
      // Only log if debug mode is enabled
      if (process.env.NODE_ENV === 'development' && window.location.search.includes('debug=true')) {
        console.log('[DevServer] No dev server URL detected, skipping poll');
      }
      scheduleNextPoll(config);
      return;
    }

    // Make safe request to dev server
    const response = await safeFetch(devServerUrl, {
      maxRetries: 1, // Reduce retries to prevent infinite loops
      timeout: 3000, // Short timeout for dev server
      method: 'GET'
    });

    if (response.ok) {
      // Only log successful connection once per session to reduce noise
      if (!window.sessionStorage.getItem('devServerConnected')) {
        console.log('[DevServer] Successfully connected to development server');
        window.sessionStorage.setItem('devServerConnected', 'true');
      }
      // Reset retry counters on successful connection
      resetRetryCounters(devServerUrl);
    } else if (response.status === 404) {
      // Don't continue polling if dev server doesn't exist
      console.log('[DevServer] Dev server endpoint not found (404), stopping polling');
      stopDevServerPolling();
      return;
    }

  } catch (error) {
    // Log error but don't throw - we want to continue polling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[DevServer] Failed to connect to development server:', errorMessage);
    
    // Check if this looks like a CORS error or 404 error
    if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) {
      console.warn('[DevServer] CORS error detected - this is normal in some development setups');
    } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      console.warn('[DevServer] Dev server not found, stopping polling to prevent infinite retries');
      stopDevServerPolling();
      return;
    }
  }

  // Schedule next poll
  scheduleNextPoll(config);
}

/**
 * Schedule the next polling attempt
 */
function scheduleNextPoll(config: DevServerConfig): void {
  if (isPolling) {
    pollTimeoutId = setTimeout(() => pollDevServer(config), config.pollInterval);
  }
}

/**
 * Try to detect the development server URL
 */
function detectDevServerUrl(): string | null {
  // Common development server endpoints
  const possibleEndpoints = [
    '/_sandbox/dev-server',
    '/dev-server',
    '/__dev__'
  ];

  // Return the first endpoint that looks like it might exist
  // In a real implementation, you might want to check these
  for (const endpoint of possibleEndpoints) {
    if (window.location.origin.includes('lovable')) {
      return `${window.location.origin}${endpoint}`;
    }
  }

  return null;
}

/**
 * Initialize development server handling
 * 
 * This should be called once when the app starts
 */
export function initializeDevServerHandler(): void {
  // Only initialize in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Only log initialization in debug mode
  if (window.location.search.includes('debug=true')) {
    console.log('[DevServer] Initializing development server handler');
  }
  
  // Start polling with default config
  startDevServerPolling();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    stopDevServerPolling();
  });

  // Also clean up on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopDevServerPolling();
    } else {
      startDevServerPolling();
    }
  });
}
