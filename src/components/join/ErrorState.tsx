
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * ErrorState Component
 * 
 * Displays an error message when an invitation is invalid or has expired.
 * 
 * @param error - The error message to display
 */
interface ErrorStateProps {
  error: string | null;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Card with error details */}
      <Card className="p-6 max-w-md w-full">
        {/* Error title */}
        <h1 className="text-2xl font-bold text-center mb-4">Invalid Invitation</h1>
        
        {/* Error message */}
        <p className="text-center text-gray-600 mb-4">
          {error || "This invitation link is invalid or has expired."}
        </p>
        
        {/* Home button */}
        <Button className="w-full" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Card>
    </div>
  );
};

export default ErrorState;
