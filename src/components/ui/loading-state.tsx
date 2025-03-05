
import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "./loading";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Clock } from "lucide-react";

/**
 * LoadingState Component with Timeout Detection
 * 
 * This improved loading state component provides better feedback to users,
 * especially in cases where loading is taking longer than expected.
 * 
 * @param props Component properties including timeout options and callbacks
 */
interface LoadingStateProps {
  title?: string;
  description?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  showTimeout?: boolean; // Whether to show timeout message after delay
  timeoutDelay?: number; // Time in ms before showing timeout message
}

export function LoadingState({
  title = "Loading Data",
  description = "Please wait while we load your data...",
  isRefreshing = false,
  onRefresh,
  showTimeout = true,
  timeoutDelay = 8000 // Default 8 seconds
}: LoadingStateProps) {
  // State to track if loading is taking too long
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  // Set up timeout detection
  useEffect(() => {
    // Only set up timeout if requested
    if (!showTimeout) return;
    
    // Set timeout to show additional message if loading takes too long
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
      
      // Log this timeout event for debugging
      console.log("[LoadingState] Loading timeout triggered after", timeoutDelay, "ms");
    }, timeoutDelay);
    
    // Clean up timeout
    return () => clearTimeout(timeoutId);
  }, [showTimeout, timeoutDelay]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            {showTimeoutMessage ? (
              <Clock className="h-8 w-8 text-primary animate-pulse" />
            ) : (
              <LoadingSpinner />
            )}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress indication */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-primary h-2.5 rounded-full animate-pulse" 
                 style={{ width: showTimeoutMessage ? '90%' : '50%' }}></div>
          </div>
          
          {/* Show timeout message if loading is taking too long */}
          {showTimeoutMessage && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="font-medium">This is taking longer than expected.</p>
              <p className="mt-1">There might be a delay in connecting to your neighborhood data.</p>
            </div>
          )}
        </CardContent>
        
        {/* Only show footer with refresh button if onRefresh is provided */}
        {onRefresh && (
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
