
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * UserError Component
 * 
 * This component is shown when there's an error loading user data.
 * 
 * @param error - The error object
 * @param onRetry - Callback function to retry loading the data
 */
interface UserErrorProps {
  error: Error;
  onRetry: () => void;
}

export const UserError = ({ error, onRetry }: UserErrorProps) => {
  return (
    <div className="p-6 text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5 mr-2" />
        <AlertDescription>
          Error loading users: {error.message}
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
