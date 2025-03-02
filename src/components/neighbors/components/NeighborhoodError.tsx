
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * NeighborhoodError Component
 * 
 * This component is shown when there's an error loading neighborhood data.
 * 
 * @param error - The error object
 * @param onRetry - Callback function to retry loading the data
 */
interface NeighborhoodErrorProps {
  error: Error;
  onRetry: () => void;
}

export const NeighborhoodError = ({ error, onRetry }: NeighborhoodErrorProps) => {
  // Check if this is a recursion error (specific to our RLS policies)
  const isRecursionError = error.message.includes("recursion");

  return (
    <div className="p-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5 mr-2" />
        <AlertDescription>
          Error loading neighborhood data: {error.message}
          {/* Display additional help text for recursion errors */}
          {isRecursionError && (
            <span className="block mt-2 text-sm">
              There is a database policy issue. Please contact support.
            </span>
          )}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex justify-center">
        <Button onClick={onRetry} variant="outline" className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
};
