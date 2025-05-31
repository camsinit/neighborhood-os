
/**
 * Loading spinner component for ProtectedRoute
 * 
 * Shows a loading state while authentication and data are being checked.
 */
import React from 'react';
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  isLoadingAuth: boolean;
  isCheckingOnboarding: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isLoadingAuth,
  isCheckingOnboarding,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {isLoadingAuth ? "Verifying your account..." : 
           isCheckingOnboarding ? "Checking your profile status..." :
           "Loading your neighborhood..."}
        </p>
      </div>
    </div>
  );
};
