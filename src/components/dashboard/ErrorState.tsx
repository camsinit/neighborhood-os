
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {/* Card header with error title and description */}
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2" /> Error Loading Neighborhood
          </CardTitle>
          <CardDescription>
            There was a problem loading your neighborhood information.
          </CardDescription>
        </CardHeader>
        
        {/* Card content with error details */}
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="text-sm overflow-auto max-h-24">
              {error.message}
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-gray-600 mb-4">
            This might be due to a temporary connection issue or a problem with your neighborhood membership.
          </p>
        </CardContent>
        
        {/* Footer with action buttons */}
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={onRefresh} 
            className="w-full"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Trying Again..." : "Try Again"}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onNavigateHome}
          >
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorState;
