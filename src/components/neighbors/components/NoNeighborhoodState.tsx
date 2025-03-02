
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserGrid } from "./UserGrid";
import { useNeighborUsers } from "../hooks/useNeighborUsers";
import { UserError } from "./UserError";
import { LoadingState } from "./LoadingState";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * NoNeighborhoodState Component
 * 
 * This improved version guides users to create a neighborhood when they don't have one,
 * rather than just showing available profiles.
 */
export const NoNeighborhoodState = () => {
  // State for the create neighborhood dialog
  const [dialogOpen, setDialogOpen] = useState(true);
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const user = useUser();
  
  // Fetch all available profiles as a fallback
  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useNeighborUsers();
  
  // Function to handle neighborhood creation
  const handleCreateNeighborhood = async () => {
    // Validate input
    if (!neighborhoodName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a neighborhood name",
        variant: "destructive"
      });
      return;
    }
    
    // Start the creation process
    setIsCreating(true);
    
    try {
      // Create neighborhood record
      const { data: neighborhood, error: createError } = await supabase
        .from('neighborhoods')
        .insert([{
          name: neighborhoodName,
          created_by: user?.id
        }])
        .select('id')
        .single();
        
      if (createError) throw createError;
      
      // Add the user as a member of this neighborhood
      if (neighborhood) {
        const { error: memberError } = await supabase
          .from('neighborhood_members')
          .insert([{
            user_id: user?.id,
            neighborhood_id: neighborhood.id,
            status: 'active'
          }]);
          
        if (memberError) throw memberError;
      }
      
      // Show success message
      toast({
        title: "Success!",
        description: `Your neighborhood "${neighborhoodName}" has been created.`
      });
      
      // Refresh the page to load the new neighborhood
      window.location.reload();
      
    } catch (err) {
      console.error("[NoNeighborhoodState] Error creating neighborhood:", err);
      toast({
        title: "Error",
        description: "Failed to create neighborhood. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
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
      {/* Create Neighborhood Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your Neighborhood</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Neighborhood Name</Label>
              <Input
                id="name"
                placeholder="e.g., Willow Creek Community"
                value={neighborhoodName}
                onChange={(e) => setNeighborhoodName(e.target.value)}
              />
            </div>
            
            <p className="text-sm text-gray-500">
              You need to be part of a neighborhood to connect with neighbors. 
              Create your own neighborhood to get started.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => navigate("/")} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreateNeighborhood} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Neighborhood"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Background content - visible if dialog is dismissed */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg text-yellow-800">No Neighborhood Available</h3>
        <p className="text-yellow-700 mb-2">
          You are not currently part of any neighborhood. Create one to connect with your neighbors.
        </p>
        <Button 
          variant="default" 
          className="mt-2"
          onClick={() => setDialogOpen(true)}
        >
          Create a Neighborhood
        </Button>
      </div>
      
      {/* Show available profiles as a fallback */}
      {users && users.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Available Profiles ({users.length})</h3>
          <div className="text-sm text-gray-500 mb-4">
            Here are some users already on the platform. Join or create a neighborhood to connect with them.
          </div>
          <UserGrid users={users} onUserSelect={() => {}} />
        </div>
      )}
    </div>
  );
};
