
/**
 * This module provides the main hook for fetching and managing neighborhood activities
 * It has been refactored for better maintainability, error handling, and code organization
 */
import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "./activities/activityService";
import { Activity, ActivityType, ActivityMetadata } from "./activities/types";
import { isContentDeleted } from "./activities/metadataUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Re-export types for backward compatibility
export type { Activity, ActivityType, ActivityMetadata };
export { isContentDeleted };

/**
 * Custom hook for fetching recent neighborhood activities
 * Returns activities with synchronized titles from their source content
 * and proper handling for deleted content and RLS policy errors
 */
export const useActivities = () => {
  const { toast } = useToast();

  // Using the updated TanStack Query v5 format with proper error handling
  const query = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    retry: 1, // Only retry once to avoid repeated errors
    staleTime: 2 * 60 * 1000, // 2 minutes
    
    // Updated error handling using onError property directly at root level (for v5)
    onError: (error: Error) => {
      console.error("[useActivities] Error fetching activities:", error);
        
      // Check for common RLS errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("infinite recursion") || 
        errorMessage.includes("permission denied") ||
        errorMessage.includes("violates row-level security")
      ) {
        // This is likely an RLS policy issue
        console.warn("[useActivities] Detected RLS policy error:", errorMessage);
      }
    }
  });

  // Show an unobtrusive toast notification on error 
  // but only for specific types of errors and only once
  useEffect(() => {
    if (query.error) {
      const errorMessage = query.error instanceof Error 
        ? query.error.message 
        : String(query.error);
      
      if (errorMessage.includes("infinite recursion") || errorMessage.includes("permission denied")) {
        toast({
          title: "Database Permission Issue",
          description: "Unable to load activity feed due to database policy settings",
          variant: "destructive",
        });
      }
    }
  }, [query.error, toast]);

  return query;
};
