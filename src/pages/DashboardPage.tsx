
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Home } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * DashboardPage Component
 * 
 * This component serves as the main dashboard for the neighborhood app.
 * It handles different states:
 * - Loading: When neighborhood data is being fetched
 * - No Neighborhood: When the user doesn't belong to any neighborhood
 * - Error: When there's an issue fetching neighborhood data
 * - Dashboard: The actual dashboard content when everything is loaded
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    refreshNeighborhoodData 
  } = useNeighborhood();

  // Local state to track refresh attempts
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  
  // Log component state for debugging
  useEffect(() => {
    console.log("[DashboardPage] State updated:", {
      hasNeighborhood: !!currentNeighborhood,
      isLoading,
      error: error?.message || null,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user]);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasAttemptedRefresh(true);
    refreshNeighborhoodData();
    
    // Reset refresh state after delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <LoadingSpinner className="w-12 h-12 mb-4" />
        <h1 className="text-xl font-bold mb-2">Loading Your Neighborhood</h1>
        <p className="text-gray-600 max-w-md text-center mb-8">
          We're connecting you with your neighborhood information.
          This should only take a moment.
        </p>
        
        {/* Add refresh button in case loading takes too long */}
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    );
  }

  // If error occurred, show error message with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2" /> Error Loading Neighborhood
            </CardTitle>
            <CardDescription>
              There was a problem loading your neighborhood information.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="text-sm overflow-auto max-h-24">
                {error.message}
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-gray-600 mb-4">
              This might be due to a temporary connection issue or a problem with your neighborhood membership.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleRefresh} 
              className="w-full"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Trying Again..." : "Try Again"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no neighborhood is assigned
  if (!currentNeighborhood) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
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
          
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <p className="text-sm text-amber-800">
                Neighborhoods are invitation-only communities. You need an invitation from 
                an existing member to join.
              </p>
            </div>
            
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
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleRefresh} 
              className="w-full"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main dashboard content when neighborhood is loaded successfully
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to {currentNeighborhood.name}
            </h1>
            <p className="mt-1 text-gray-600">
              Connect with your neighbors and community
            </p>
          </div>
          <Button 
            onClick={() => navigate('/neighbors')}
            className="mt-4 sm:mt-0"
          >
            View Neighbors
          </Button>
        </div>
        
        {/* Dashboard content will go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for future dashboard cards/widgets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Upcoming events in your neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No upcoming events</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/calendar')}>
                View Calendar
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Safety Updates</CardTitle>
              <CardDescription>
                Recent safety information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent safety updates</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/safety')}>
                View Safety Updates
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Goods Exchange</CardTitle>
              <CardDescription>
                Items being shared in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent exchanges</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/goods')}>
                View Exchanges
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
