
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, Gift, Brain, Shield, Settings, Users, UserPlus, RefreshCw, AlertTriangle, Wrench, Database } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import InviteDialog from "@/components/InviteDialog";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Sidebar component props
 * onOpenSettings is a function that will be called when the settings button is clicked
 */
interface SidebarProps {
  onOpenSettings: () => void;
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  
  // State to control the invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // State to control the diagnostics dialog visibility
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  
  // State to track diagnostics data
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  
  // Get the toast notification function
  const { toast } = useToast();
  
  // Get neighborhood context to help with troubleshooting
  const { 
    currentNeighborhood, 
    isLoading: isNeighborhoodLoading, 
    error: neighborhoodError,
    refreshNeighborhoodData, // Use the refresh function from context
    isCoreContributor // Check if user is a core contributor for diagnostics
  } = useNeighborhood();
  
  // Get current user
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  
  // Add a state to track loading timeout
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  // Monitor for stuck loading state
  useEffect(() => {
    // If we're loading neighborhood data, set a timeout to detect stuck state
    if (isNeighborhoodLoading) {
      const timeoutId = setTimeout(() => {
        // Only set timeout flag if still loading after delay
        if (isNeighborhoodLoading) {
          setIsLoadingTimeout(true);
          console.log("[Sidebar] Neighborhood loading timeout detected");
        }
      }, 8000); // 8 seconds should be plenty of time
      
      return () => clearTimeout(timeoutId);
    } else {
      // Reset timeout flag if no longer loading
      setIsLoadingTimeout(false);
    }
  }, [isNeighborhoodLoading]);
  
  // Fetch user profile data using React Query
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id, // Only run query when user is logged in
  });

  // Main navigation item (Home/Dashboard) - This is the main entry point
  const mainNavItems = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/dashboard" // Updated to use /dashboard path
    }
  ];

  // Define middle navigation items with their respective theme colors
  // Each item has a specific color that represents its category
  const middleNavItems = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/dashboard/events", // Updated to include /dashboard prefix
      color: "#0EA5E9" // Calendar uses a bright blue theme
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/dashboard/skills", // Updated to include /dashboard prefix
      color: "#9b87f5" // Skills uses a purple theme
    },
    { 
      icon: Gift, 
      label: "Goods", 
      href: "/dashboard/goods", // Updated to include /dashboard prefix
      color: "#F97316" // Goods uses an orange theme
    },
    { 
      icon: Heart, 
      label: "Care", 
      href: "/dashboard/care", // Updated to include /dashboard prefix
      color: "#22C55E" // Care uses a green theme
    },
    { 
      icon: Shield, 
      label: "Safety", 
      href: "/dashboard/safety", // Updated to include /dashboard prefix
      color: "#EA384C" // Safety uses a red theme
    },
    {
      icon: Users,
      label: "Neighbors",
      href: "/dashboard/neighbors", // Updated to include /dashboard prefix
      color: "#7E69AB" // Neighbors uses a secondary purple theme
    },
  ];

  // Function to handle opening the settings dialog
  const handleOpenSettings = () => {
    // Call the provided callback function to open settings
    if (onOpenSettings) {
      console.log("Opening settings dialog");
      onOpenSettings();
    } else {
      console.error("onOpenSettings function not provided to Sidebar component");
    }
  };

  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    console.log("Opening invite dialog");
    // Show a toast if no neighborhood is available
    if (!currentNeighborhood && !isNeighborhoodLoading) {
      toast({
        title: "No neighborhood found",
        description: "You need to be part of a neighborhood to invite others.",
        variant: "destructive"
      });
      return;
    }
    setIsInviteOpen(true);
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
          currentNeighborhood: currentNeighborhood,
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
  const isStuckLoading = isLoadingTimeout || (isNeighborhoodLoading && !currentNeighborhood);

  return (
    <div className="w-48 border-r bg-white flex flex-col">
      {/* Logo section at the top of sidebar */}
      <div className="p-4 flex justify-center">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png" 
            alt="Terrific Terrace Logo" 
            className="h-24"
          />
        </Link>
      </div>
      
      {/* Navigation menu section */}
      <nav className="flex-1 px-2">
        {/* Home/Dashboard navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            // Check if current path matches this nav item
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-base font-medium",
                    isActive && "bg-gray-100" // Highlight active item
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Divider between navigation groups */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Feature navigation items */}
        <div className="space-y-1">
          {middleNavItems.map((item) => {
            // For the middle items, we need to check if we're on that specific page
            // or any child routes of that page
            const isActive = location.pathname === item.href || 
                            location.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-base font-medium",
                    isActive && "bg-gray-100" // Highlight active item
                  )}
                >
                  <item.icon 
                    className="h-5 w-5" 
                    color={item.color} // Apply the theme color to the icon
                  />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Divider before bottom actions */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Settings and Invite buttons */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={handleOpenSettings} // Now calling our handler function
            type="button" // Explicitly set button type
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={handleOpenInvite} // Now calling our handler function
            type="button" // Explicitly set button type
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
          
          {/* Display user ID for troubleshooting */}
          {user && (
            <div className="mt-4 px-2 py-1 bg-gray-50 rounded text-xs text-gray-500 break-all">
              <div className="font-semibold mb-1">User ID:</div>
              <div>{user.id}</div>
            </div>
          )}
          
          {/* Display current neighborhood info if available */}
          {currentNeighborhood && (
            <div className="mt-2 px-2 py-1 bg-green-50 rounded text-xs text-green-600">
              <div className="font-semibold mb-1">Neighborhood:</div>
              <div>{currentNeighborhood.name}</div>
            </div>
          )}
          
          {/* Show diagnostics data if available */}
          {diagnosticsData && (
            <div className="mt-2 px-2 py-1 bg-blue-50 rounded text-xs text-blue-600 max-h-40 overflow-y-auto">
              <div className="font-semibold mb-1">Diagnostics:</div>
              {diagnosticsData.status === "running" ? (
                <div>Running diagnostics...</div>
              ) : diagnosticsData.status === "error" ? (
                <div className="text-red-500">{diagnosticsData.error}</div>
              ) : (
                <>
                  <div>Neighborhoods: {diagnosticsData.neighborhoods?.length || 0}</div>
                  <div>Memberships: {diagnosticsData.memberships?.length || 0}</div>
                  <div>Core Contributor: {diagnosticsData.isCoreContributor ? "Yes" : "No"}</div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Invite dialog component (shown when isInviteOpen is true) */}
      <InviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
      />
    </div>
  );
};

export default Sidebar;
