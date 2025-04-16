
import { Button } from "@/components/ui/button";
import { UserGrid } from "./UserGrid";
import { useNeighborUsers } from "../hooks/useNeighborUsers";
import { UserError } from "./UserError";
import { LoadingState } from "./LoadingState";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { toast } from "sonner";

/**
 * NoNeighborhoodState Component
 * 
 * This component informs users they need an invitation to join a neighborhood.
 * It provides options to join an existing neighborhood or create a test neighborhood.
 */
export const NoNeighborhoodState = () => {
  // Get user and navigation functionality
  const navigate = useNavigate();
  const user = useUser();
  const { refreshNeighborhoodData } = useNeighborhood();
  
  // State for tracking join operation
  const [isJoining, setIsJoining] = useState(false);
  
  // Fetch all available profiles as a fallback
  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useNeighborUsers();
  
  // Function to add the current user to Terrific Terrace neighborhood
  const joinTerrificTerrace = async () => {
    if (!user) return;
    
    try {
      setIsJoining(true);
      
      // First, find the Terrific Terrace neighborhood ID
      const { data: neighborhoods, error: findError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('name', 'Terrific Terrace')
        .limit(1);
      
      if (findError) throw findError;
      
      if (!neighborhoods || neighborhoods.length === 0) {
        toast.error("Test neighborhood not found. Please contact support.");
        return;
      }
      
      const neighborhoodId = neighborhoods[0].id;
      
      // Now add the user as a member
      const { error: joinError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: neighborhoodId,
          status: 'active'
        });
      
      if (joinError) throw joinError;
      
      // Success! Refresh neighborhood data and navigate home
      toast.success("Successfully joined Terrific Terrace!");
      await refreshNeighborhoodData();
      navigate("/home");
      
    } catch (err) {
      console.error("Error joining test neighborhood:", err);
      toast.error("Failed to join test neighborhood. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <UserError error={error} onRetry={refetch} />;
  }

  return (
    <div className="p-6">
      {/* Information card about invitation-only access */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-lg text-center mb-2">Invitation Required</h3>
        <p className="text-gray-700 mb-4 text-center">
          To connect with your neighbors, you need to join a neighborhood community. 
          Please check your email for an invitation or ask a neighbor for an invite link.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            variant="default" 
            className=""
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
          
          {/* Add button to join test neighborhood */}
          <Button
            variant="outline"
            className=""
            onClick={joinTerrificTerrace}
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Test Neighborhood"}
          </Button>
        </div>
      </Card>
      
      {/* Show available profiles as a fallback */}
      {users && users.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Available Profiles ({users.length})</h3>
          <div className="text-sm text-gray-500 mb-4">
            Here are some users already on the platform. You need an invitation to connect with them in a neighborhood.
          </div>
          <UserGrid users={users} onUserSelect={() => {}} />
        </div>
      )}
    </div>
  );
};
