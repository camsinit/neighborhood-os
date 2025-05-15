
/**
 * cors.ts
 * 
 * Shared utility functions for edge functions to handle CORS, responses, 
 * and logging in a consistent way
 */

// Standard CORS headers to use across all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Interface for standardized response format
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Handle CORS preflight requests
 * 
 * @param req - The incoming request
 * @returns A response for OPTIONS requests with CORS headers
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
}

/**
 * Create a success response with proper CORS headers
 * 
 * @param data - The data to return
 * @param message - Optional success message
 * @returns A formatted success response
 */
export function successResponse<T = any>(data?: T, message?: string): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

/**
 * Create an error response with proper CORS headers
 * 
 * @param error - Error message or object
 * @param status - HTTP status code (default: 500)
 * @returns A formatted error response
 */
export function errorResponse(error: Error | string, status: number = 500): Response {
  const message = error instanceof Error ? error.message : error;
  
  const body: ApiResponse = {
    success: false,
    error: message,
  };
  
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

/**
 * Create a logger for consistent logging across edge functions
 * 
 * @param functionName - Name of the edge function
 * @returns Object with logging methods
 */
export function createLogger(functionName: string) {
  // Generate a random transaction ID for this function call
  const txId = crypto.randomUUID().substring(0, 8);
  
  function formatMessage(message: string): string {
    return `[${functionName}] [${txId}] ${message}`;
  }
  
  return {
    info: (message: string, data?: any) => {
      if (data) {
        console.log(formatMessage(message), data);
      } else {
        console.log(formatMessage(message));
      }
    },
    
    warn: (message: string, data?: any) => {
      if (data) {
        console.warn(formatMessage(message), data);
      } else {
        console.warn(formatMessage(message));
      }
    },
    
    error: (message: string, error?: any) => {
      if (error) {
        console.error(formatMessage(message), error);
      } else {
        console.error(formatMessage(message));
      }
    }
  };
}
