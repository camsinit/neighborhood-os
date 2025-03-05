
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, RefreshCw, Mail, HelpCircle } from "lucide-react";
import { useState } from "react";

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
  // State to track if FAQ is shown
  const [showFAQ, setShowFAQ] = useState(false);
  
  // Log when this component renders
  console.log("[NoNeighborhoodState] Rendering with state:", { 
    hasAttemptedRefresh, 
    isRefreshing,
    timestamp: new Date().toISOString()
  });
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
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
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
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
          
          {/* FAQ section */}
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs flex items-center w-full justify-between"
              onClick={() => setShowFAQ(!showFAQ)}
            >
              <span>Frequently Asked Questions</span>
              <HelpCircle className="h-3 w-3 ml-1" />
            </Button>
            
            {showFAQ && (
              <div className="mt-2 text-xs bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
                <div>
                  <h4 className="font-bold">How do I join a neighborhood?</h4>
                  <p>You need an invitation from an existing member. They'll send you a link to join.</p>
                </div>
                <div>
                  <h4 className="font-bold">I have an invitation but can't join</h4>
                  <p>Check your invitation link and make sure you're logged in with the correct email address.</p>
                </div>
                <div>
                  <h4 className="font-bold">Can I create my own neighborhood?</h4>
                  <p>Neighborhood creation is currently by approval only. Contact support for more information.</p>
                </div>
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
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={onNavigateHome}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center mt-4"
            onClick={() => window.location.href = "mailto:support@neighborly.com?subject=Neighborhood Access Request"}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoNeighborhoodState;
