
import { Settings, UserPlus, RefreshCw, AlertTriangle, Database, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ActionButtons component props
 */
interface ActionButtonsProps {
  onOpenSettings: () => void;
  onOpenInvite: () => void;
  isNeighborhoodLoading: boolean;
  neighborhoodError: Error | null;
  refreshNeighborhoodData: () => void;
}

/**
 * ActionButtons component
 * 
 * Displays the settings, invite, and diagnostic action buttons
 */
const ActionButtons = ({ 
  onOpenSettings, 
  onOpenInvite, 
  isNeighborhoodLoading, 
  neighborhoodError,
  refreshNeighborhoodData 
}: ActionButtonsProps) => {
  // Get the toast notification function
  const { toast } = useToast();
  
  // Get current user for diagnostics
  const user = useUser();
  
  // Get navigation for logout redirect
  const navigate = useNavigate();
  
  // State to track loading timeout
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  // State to track diagnostics data
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  
  // Function to handle opening the settings dialog
  const handleOpenSettings = () => {
    // Call the provided callback function to open settings
    if (onOpenSettings) {
      // Add extra debugging to track if the function is actually called
      console.log("[ActionButtons] Opening settings dialog - triggering callback");
      try {
        onOpenSettings();
        console.log("[ActionButtons] Settings callback executed successfully");
      } catch (error) {
        console.error("[ActionButtons] Error executing settings callback:", error);
      }
    } else {
      console.error("[ActionButtons] onOpenSettings function not provided or is undefined");
    }
  };

  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    // Call the provided callback function to open invite dialog
    onOpenInvite();
  };
  
  // Function to handle user logout
  const handleLogout = async () => {
    try {
      // Display a logout notification
      toast({
        title: "Logging out",
        description: "You are being signed out...",
      });
      
      // Sign out the user using Supabase auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect to login page
      navigate("/login");
      
      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Show error toast
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem signing out",
        variant: "destructive"
      });
    }
  };
  
  // Function to force refresh neighborhood data
  const handleRefreshNeighborhood = () => {
    console.log("Manually refreshing neighborhood data");
    refreshNeighborhoodData();
    setIsLoadingTimeout(false); // Reset timeout flag
    
    // Show toast to let user know refresh is happening
    toast({
      title: "Refreshing neighborhood data",
      description: "Please wait while we reconnect to your neighborhood...",
    });
  };
  
  // Function to run neighborhood diagnostics
  const runNeighborhoodDiagnostics = async () => {
    if (!user) {
      console.log("[Diagnostics] No user found");
      toast({
        title: "No user found",
        description: "Please login again to resolve this issue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("[Diagnostics] Running neighborhood diagnostics for user:", user.id);
      setDiagnosticsData({
        status: "running",
        userId: user.id
      });
      
      // Check if user has created neighborhoods
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from("neighborhoods")
        .select("id, name")
        .eq("created_by", user.id);
        
      if (createdError) throw createdError;
      
      // Check neighborhood memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("neighborhood_members")
        .select("neighborhood_id, status")
        .eq("user_id", user.id);
        
      if (membershipError) throw membershipError;
      
      // Get neighborhood details for memberships
      let neighborhoodDetails = [];
      if (memberships && memberships.length > 0) {
        const { data: details, error: detailsError } = await supabase
          .from("neighborhoods")
          .select("id, name")
          .in("id", memberships.map(m => m.neighborhood_id));
          
        if (detailsError) throw detailsError;
        neighborhoodDetails = details || [];
      }
      
      // Check if user is a core contributor
      const { data: coreContributor, error: coreError } = await supabase
        .from("core_contributors")
        .select("*")
        .eq("user_id", user.id);
      
      if (coreError) throw coreError;
      
      // Also check authentication state
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      // Log diagnostic information
      const diagnosticInfo = {
        userId: user.id,
        email: user.email,
        createdNeighborhoods: createdNeighborhoods || [],
        memberships: memberships || [],
        neighborhoods: neighborhoodDetails,
        isCoreContributor: coreContributor && coreContributor.length > 0,
        hasSession: !!session?.session,
        contextData: {
          isLoading: isNeighborhoodLoading,
          hasError: !!neighborhoodError,
          errorMessage: neighborhoodError?.message,
          isLoadingTimeout: isLoadingTimeout
        },
        timestamp: new Date().toISOString()
      };
      
      console.log("[Diagnostics] Results:", diagnosticInfo);
      setDiagnosticsData(diagnosticInfo);
      
      // Show diagnostic info to user
      toast({
        title: "Diagnostic Information",
        description: `Found ${createdNeighborhoods?.length || 0} created neighborhoods and ${memberships?.length || 0} memberships.`,
      });
      
      // If no neighborhoods found, show how to debug
      if ((!createdNeighborhoods || createdNeighborhoods.length === 0) && 
          (!memberships || memberships.length === 0)) {
        toast({
          title: "No neighborhood association found",
          description: "Check your Supabase database to verify your user's neighborhood linkage.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("[Diagnostics] Error:", error);
      setDiagnosticsData({
        status: "error",
        error: error.message,
        userId: user.id
      });
      toast({
        title: "Diagnostic error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Determine if we're in a stuck loading state
  // This happens if isNeighborhoodLoading is true for too long
  const isStuckLoading = isLoadingTimeout || (isNeighborhoodLoading && !diagnosticsData?.currentNeighborhood);

  return (
    <div className="space-y-1">
      {/* Settings button with dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            type="button"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Settings option */}
          <DropdownMenuItem onClick={handleOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Logout option */}
          <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={handleOpenInvite}
        type="button"
      >
        <UserPlus className="h-5 w-5" />
        Invite Neighbor
      </Button>
      
      {/* Database Diagnostics button - always visible but subtle */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-xs font-medium text-gray-500"
        onClick={runNeighborhoodDiagnostics}
        type="button"
      >
        <Database className="h-4 w-4" />
        Database Status
      </Button>
      
      {/* Show refresh button if neighborhood data is stuck loading */}
      {isStuckLoading && (
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-base font-medium text-amber-600 border-amber-200 bg-amber-50 mt-2"
          onClick={handleRefreshNeighborhood}
          type="button"
        >
          <RefreshCw className={cn("h-5 w-4", isNeighborhoodLoading && "animate-spin")} />
          Refresh Connection
        </Button>
      )}
      
      {/* Display error message if there's an error with neighborhood data */}
      {neighborhoodError && (
        <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md mt-2">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Error: {neighborhoodError.message}</span>
          </div>
          <Button
            variant="link"
            className="w-full text-red-600 p-0 h-auto text-xs mt-1"
            onClick={handleRefreshNeighborhood}
            type="button"
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
