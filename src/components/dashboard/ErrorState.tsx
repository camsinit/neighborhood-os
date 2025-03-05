
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home, Info } from "lucide-react";
import { useState } from "react";

/**
 * ErrorState Component
 * 
 * This component displays an error message when there's a problem loading
 * neighborhood data. It shows details about the error and provides options
 * to retry or navigate away.
 * 
 * @param error - The error object containing the error message
 * @param isRefreshing - Whether a refresh operation is in progress
 * @param onRefresh - Function to call when the retry button is clicked
 * @param onNavigateHome - Function to call when the home button is clicked
 */
interface ErrorStateProps {
  error: Error;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigateHome: () => void;
}

const ErrorState = ({ error, isRefreshing, onRefresh, onNavigateHome }: ErrorStateProps) => {
  // State to track if detailed error info is shown
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine error type to provide tailored guidance
  const isNetworkError = error.message.includes("network") || error.message.includes("fetch");
  const isAuthError = error.message.includes("auth") || error.message.includes("permission") || error.message.includes("access");
  const isTimeoutError = error.message.includes("timeout") || error.message.includes("timed out");
  const isServerError = error.message.includes("500") || error.message.includes("server");
  
  // Get error category and guidance text
  const getErrorCategory = () => {
    if (isNetworkError) return "Network Error";
    if (isAuthError) return "Authentication Error";
    if (isTimeoutError) return "Timeout Error";
    if (isServerError) return "Server Error";
    return "Application Error";
  };
  
  const getErrorGuidance = () => {
    if (isNetworkError) {
      return "Check your internet connection and try again.";
    }
    if (isAuthError) {
      return "You may need to log out and log back in to refresh your authentication.";
    }
    if (isTimeoutError) {
      return "The server is taking too long to respond. Please try again later.";
    }
    if (isServerError) {
      return "There's an issue with our servers. Our team has been notified.";
    }
    return "Try refreshing the page or contact support if the problem persists.";
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        {/* Card header with error title and description */}
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-red-600">
            {getErrorCategory()}
          </CardTitle>
          <CardDescription className="text-center">
            There was a problem loading your neighborhood information.
          </CardDescription>
        </CardHeader>
        
        {/* Card content with error details */}
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" /> 
              Error Details
            </AlertTitle>
            <AlertDescription className="text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-gray-600">
            {getErrorGuidance()}
          </p>
          
          {/* Collapsible technical details */}
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs flex items-center w-full justify-between"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span>Technical Details</span>
              <Info className="h-3 w-3 ml-1" />
            </Button>
            
            {showDetails && (
              <div className="mt-2 text-xs bg-gray-50 p-3 rounded border border-gray-200 font-mono overflow-auto max-h-32">
                <p>Error Name: {error.name}</p>
                <p>Error Message: {error.message}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
                <p>Stack: {error.stack?.substring(0, 300)}...</p>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Footer with action buttons */}
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={onRefresh} 
            className="w-full flex items-center justify-center"
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRefreshing ? "Trying Again..." : "Try Again"}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={onNavigateHome}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorState;
