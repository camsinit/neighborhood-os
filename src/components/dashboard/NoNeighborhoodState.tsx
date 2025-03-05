
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home } from "lucide-react";

/**
 * NoNeighborhoodState Component
 * 
 * This component is displayed when a user is authenticated but isn't part of any
 * neighborhood community. It provides information about how to join a neighborhood
 * and options to refresh or navigate home.
 * 
 * @param hasAttemptedRefresh - Whether the user has attempted to refresh already
 * @param isRefreshing - Whether a refresh operation is in progress
 * @param onRefresh - Function to call when the refresh button is clicked
 * @param onNavigateHome - Function to call when the home button is clicked
 */
interface NoNeighborhoodStateProps {
  hasAttemptedRefresh: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigateHome: () => void;
}

const NoNeighborhoodState = ({ 
  hasAttemptedRefresh, 
  isRefreshing, 
  onRefresh, 
  onNavigateHome 
}: NoNeighborhoodStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {/* Card header with icon and title */}
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-center">No Neighborhood Found</CardTitle>
          <CardDescription className="text-center">
            You're not currently part of any neighborhood community.
          </CardDescription>
        </CardHeader>
        
        {/* Card content with information and alerts */}
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <p className="text-sm text-amber-800">
              Neighborhoods are invitation-only communities. You need an invitation from 
              an existing member to join.
            </p>
          </div>
          
          {/* Show additional help if the user has already tried refreshing */}
          {hasAttemptedRefresh && (
            <Alert className="mb-4">
              <AlertTitle>Still having issues?</AlertTitle>
              <AlertDescription className="text-sm">
                If you've just accepted an invitation, it might take a moment for your membership to be processed.
                Try refreshing again or contact the person who invited you.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        {/* Footer with action buttons */}
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={onRefresh} 
            className="w-full"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
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

export default NoNeighborhoodState;
