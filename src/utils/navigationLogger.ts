
/**
 * Navigation Logger Utility
 * 
 * This utility provides functions to log navigation events throughout the app,
 * helping debug routing and redirection issues by creating a clear audit trail.
 */

// Define the structure of a navigation event for consistent logging
interface NavigationEvent {
  source: string;           // Component or page initiating navigation
  from: string;             // Current path when navigation occurs
  to: string;               // Destination path
  replacing: boolean;       // Whether history is being replaced
  authState: 'authenticated' | 'unauthenticated' | 'unknown'; // User auth state
  timestamp: string;        // When the navigation occurred
  cause?: string;           // Optional reason for navigation
}

/**
 * Log a navigation event to the console
 * 
 * @param event The navigation event details to log
 */
export const logNavigation = (event: NavigationEvent): void => {
  // Create a formatted timestamp for easier log reading
  const formattedTime = new Date(event.timestamp).toLocaleTimeString();
  
  // Format the log message with consistent styling
  console.log(
    `%c[Navigation @ ${formattedTime}]%c ${event.source} → ${event.to} %c${event.replacing ? '(replacing history)' : ''}`,
    'color: #3b82f6; font-weight: bold',
    'color: black; font-weight: normal',
    'color: #6b7280; font-style: italic'
  );
  
  // Log additional details as an object for more comprehensive debugging
  console.log({
    from: event.from,
    to: event.to,
    source: event.source,
    replacing: event.replacing,
    authState: event.authState,
    cause: event.cause || 'not specified',
    timestamp: event.timestamp
  });
};

/**
 * Create a navigation logger for a specific component
 * 
 * @param source The name of the component or page using the logger
 * @returns A function to log navigation events from that source
 */
export const createNavigationLogger = (source: string) => {
  return (to: string, options: { 
    replace?: boolean; 
    cause?: string;
    authState?: 'authenticated' | 'unauthenticated' | 'unknown';
  } = {}) => {
    logNavigation({
      source,
      from: window.location.pathname,
      to,
      replacing: !!options.replace,
      authState: options.authState || 'unknown',
      timestamp: new Date().toISOString(),
      cause: options.cause
    });
  };
};

export default createNavigationLogger;
