
import { useState, useEffect } from "react";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { Input } from "@/components/ui/input";
import { Search, Users, RefreshCw } from "lucide-react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { createHighlightListener } from "@/utils/highlight"; // Updated import path
import ModuleLayout from "@/components/layout/ModuleLayout";

/**
 * NeighborsPage Component
 * 
 * This page displays a directory of neighbors in the user's neighborhood.
 * Now using the centralized module structure for consistent styling.
 */
const NeighborsPage = () => {
  // State for the search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // State to handle manual refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get neighborhood context and navigation
  const {
    currentNeighborhood,
    isLoading,
    error,
    refreshNeighborhoodData
  } = useNeighborhood();
  const navigate = useNavigate();

  // Replace the custom highlight implementation with our centralized utility
  useEffect(() => {
    // Use our utility to create a consistent highlight listener for neighbors
    // This will handle finding elements by data-neighbor-id and applying animations
    const handleHighlightItem = createHighlightListener("neighbors");
    
    // Add event listener when component mounts
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  // Add debugging logs
  useEffect(() => {
    console.log("[NeighborsPage] Neighborhood state:", {
      neighborhood: currentNeighborhood,
      isLoading,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error]);

  // Handle manual refresh action
  const handleRefresh = () => {
    // Set refreshing state to show loading indicator
    setIsRefreshing(true);

    // Show toast to notify user
    toast({
      title: "Refreshing...",
      description: "Updating your neighborhood information"
    });

    // Use our new refresh function from the context
    refreshNeighborhoodData();

    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Show loading state while fetching neighborhood data
  if (isLoading) {
    return <div className="min-h-full w-full flex flex-col items-center justify-center p-8">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 text-center">
          Loading your neighborhood information...
        </p>
        <p className="text-sm text-gray-500 max-w-md text-center mt-2">
          We're connecting you with your neighbors. This should only take a moment.
        </p>
        
        {/* Add a button to retry after some time */}
        <Button variant="outline" onClick={handleRefresh} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>;
  }

  // UPDATED: More helpful UI when no neighborhood is found
  if (error || !currentNeighborhood) {
    return <div className="min-h-full w-full flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">No Neighborhood Found</CardTitle>
            <CardDescription className="text-gray-600">
              {error ? <>
                  There was an error loading your neighborhood data. 
                  {error.message.includes("RLS") ? " This appears to be a permission issue." : ""}
                </> : "You aren't currently part of any neighborhood community."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-sm text-amber-800">
                  You can continue using the app without a neighborhood. Some features may be limited.
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button onClick={() => navigate('/')} className="w-full">
                  Go to Home Page
                </Button>
                
                <Button variant="outline" onClick={handleRefresh} className="w-full" disabled={isRefreshing}>
                  {isRefreshing ? <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </> : <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  // User has a neighborhood, show the neighbors directory with enhanced UI
  return (
    <ModuleLayout
      title="My Neighbors"
      themeColor="neighbors"
      description="Welcome to your neighborhood community! Connect with neighbors, discover shared interests, and build meaningful connections."
    >
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-[280px]">
          <Input 
            type="text" 
            placeholder="Search neighbors..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10" 
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <UserDirectory searchQuery={searchQuery} />
    </ModuleLayout>
  );
};

export default NeighborsPage;
