
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * UserNeighborhoods component
 * 
 * Displays a list of neighborhoods the user is a member of
 */
interface Neighborhood {
  id: string;
  name: string;
  joined_at: string;
}

export const UserNeighborhoods = () => {
  // Get the current user from Supabase Auth
  const user = useUser();
  
  // State for neighborhoods, loading status, and any error
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch neighborhoods when component mounts or user changes
  useEffect(() => {
    // Only fetch if we have a user
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Function to fetch the neighborhoods
    const fetchNeighborhoods = async () => {
      try {
        // Set loading state while fetching
        setIsLoading(true);
        setError(null);
        
        console.log("[UserNeighborhoods] Fetching neighborhoods for user:", user.id);
        
        // Query to get neighborhoods the user is a member of
        const { data, error } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhood_id,
            joined_at,
            neighborhoods:neighborhood_id (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');

        // Handle any query errors
        if (error) {
          throw error;
        }

        // Transform the data to a more usable format
        const formattedNeighborhoods = data.map(item => ({
          id: item.neighborhoods.id,
          name: item.neighborhoods.name,
          joined_at: item.joined_at
        }));

        console.log("[UserNeighborhoods] Found neighborhoods:", formattedNeighborhoods);
        
        // Update state with the neighborhoods
        setNeighborhoods(formattedNeighborhoods);
      } catch (err) {
        // Log and set error for UI display
        console.error("[UserNeighborhoods] Error fetching neighborhoods:", err);
        setError("Failed to load your neighborhoods");
      } finally {
        // Always mark loading as complete
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchNeighborhoods();
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md">
        {error}
      </div>
    );
  }

  // Empty state - no neighborhoods
  if (neighborhoods.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        You are not a member of any neighborhoods yet.
      </div>
    );
  }

  // Render the list of neighborhoods
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Neighborhoods</CardTitle>
        <CardDescription>
          Neighborhoods you are a member of
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {neighborhoods.map((neighborhood) => (
            <Badge 
              key={neighborhood.id} 
              variant="secondary"
              className="text-sm py-1"
            >
              {neighborhood.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
