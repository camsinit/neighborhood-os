
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import { useActivities } from "@/utils/queries/useActivities";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Main homepage/dashboard of the neighborhood app
 * 
 * This component now includes error handling for cases where data can't be
 * loaded due to permission issues or database configuration problems.
 */
const HomePage = () => {
  // Get neighborhood context to check if we have a current neighborhood
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  
  // Check if we can fetch activities - this will tell us if the RLS policies are working
  const { isLoading, error } = useActivities();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Quick Actions Section with Notifications */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <NotificationDrawer />
            </div>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Activity Section with proper error handling */}
          <section className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neighborhood Activity</h2>
            
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Database Access Issue</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-sm mb-2">
                    We're having trouble accessing neighborhood data. This is likely due to the 
                    recent database policy changes.
                  </p>
                  <p className="text-xs mb-4 text-muted-foreground">
                    Error details: {error instanceof Error ? error.message : "Unknown database error"}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refreshNeighborhoodData()}
                  >
                    Refresh Data
                  </Button>
                </AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="py-12 border rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="h-6 w-6 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading activity feed...</p>
                </div>
              </div>
            ) : !currentNeighborhood ? (
              <Alert variant="default" className="mb-6">
                <AlertTitle>No Neighborhood Selected</AlertTitle>
                <AlertDescription>
                  <p className="text-sm mb-2">
                    You need to join or create a neighborhood to see activity.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = "/join"}
                  >
                    Join a Neighborhood
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="p-8 border rounded-lg text-center bg-gray-50">
                <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground mb-4">
                  Your neighborhood feed is empty. As neighbors share updates and events, 
                  they'll appear here.
                </p>
                <Button variant="outline">Invite Neighbors</Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
