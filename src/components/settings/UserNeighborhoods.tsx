
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";

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

/**
 * This component fetches and displays the neighborhoods a user is a member of.
 * It shows:
 *   - Loading state while fetching neighborhoods
 *   - Error state if fetching fails
 *   - Empty state if user is not a member of any neighborhoods
 *   - List of neighborhoods with names as badges
 */
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
        
        // UPDATED: Use a safer approach that avoids RLS recursion
        // First check if the user created any neighborhoods directly 
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('id, name')
          .eq('created_by', user.id);

        if (createdError) {
          console.warn("[UserNeighborhoods] Error checking created neighborhoods:", createdError);
        }
        
        // If user created neighborhoods, use those
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          const formattedNeighborhoods = createdNeighborhoods.map(item => ({
            id: item.id,
            name: item.name,
            joined_at: new Date().toISOString() // Default value since we don't have joined_at for creators
          }));
          
          setNeighborhoods(formattedNeighborhoods);
          setIsLoading(false);
          return;
        }
        
        // USING RPC FUNCTION: Call our security definer function that safely checks membership
        // This avoids the RLS recursion issue
        const { data: membershipData, error: membershipError } = await supabase
          .rpc('get_user_neighborhoods', {
            user_uuid: user.id
          });
        
        if (membershipError) {
          throw membershipError;
        }
        
        if (membershipData) {
          setNeighborhoods(membershipData);
        } else {
          setNeighborhoods([]);
        }
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

  /**
   * Helper function to add a user to a neighborhood safely
   * This is used for development/testing purposes
   */
  const addUserToNeighborhood = async (userId: string, neighborhoodName: string) => {
    try {
      // First, find the neighborhood ID by name
      const { data: neighborhoods, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('name', neighborhoodName)
        .limit(1);
      
      if (neighborhoodError) throw neighborhoodError;
      if (!neighborhoods || neighborhoods.length === 0) {
        toast.error(`Neighborhood "${neighborhoodName}" not found`);
        return;
      }

      const neighborhoodId = neighborhoods[0].id;
      
      // UPDATED: Use our RPC function to safely check membership
      const { data: isMember, error: membershipCheckError } = await supabase
        .rpc('user_is_neighborhood_member', {
          user_uuid: userId,
          neighborhood_uuid: neighborhoodId
        });
      
      if (membershipCheckError) throw membershipCheckError;
      
      if (isMember) {
        toast.info(`User is already a member of "${neighborhoodName}"`);
        return;
      }
      
      // UPDATED: Use RPC function to safely add a member
      const { error: addError } = await supabase
        .rpc('add_neighborhood_member', {
          user_uuid: userId,
          neighborhood_uuid: neighborhoodId
        });
      
      if (addError) throw addError;
      
      // Show success message
      toast.success(`User added to "${neighborhoodName}" successfully!`);
      
      // If the current user is the one being added, refresh the neighborhoods list
      if (user && user.id === userId) {
        // Refresh neighborhoods using the safer approach
        setIsLoading(true);
        
        const { data: refreshedData, error: refreshError } = await supabase
          .rpc('get_user_neighborhoods', {
            user_uuid: user.id
          });

        if (refreshError) throw refreshError;
        
        if (refreshedData) {
          setNeighborhoods(refreshedData);
        }
        
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error("[UserNeighborhoods] Error adding user to neighborhood:", err);
      toast.error("Failed to add user to neighborhood");
    }
  };

  // On component mount, add the specified user to Terrific Terrace
  // This is a one-time operation for the specific user ID requested
  useEffect(() => {
    // The specific user ID we want to add to Terrific Terrace
    const targetUserId = "74bf3085-8275-4eb2-a721-8c8e91b3d3d8";
    
    // Only run this once when the component mounts
    if (user) {
      // Run the add user function for the specific user
      addUserToNeighborhood(targetUserId, "Terrific Terrace");
    }
    
    // This effect should only run once when the component is mounted and user is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
