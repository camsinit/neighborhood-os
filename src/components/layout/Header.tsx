
import { Settings, Home, Plus, Zap } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { useNeighborhood } from "@/contexts/neighborhood";
import { useCreateNeighborhoodAccess } from "@/hooks/useCreateNeighborhoodAccess";
import { CreateNeighborhoodDialog } from "@/components/neighborhoods/CreateNeighborhoodDialog";
// Import toast directly from sonner for success messages
import { toast as sonnerToast } from 'sonner';

/**
 * Header component props
 * onOpenSettings is a function that will be called when the settings option is clicked
 */
interface HeaderProps {
  onOpenSettings: () => void;
}

/**
 * Header component
 * 
 * Displays the top navigation bar with:
 * - Quick Actions title
 * - Notifications button
 * 
 * UPDATED: Removed neighborhood name display and profile dropdown
 */
const Header = ({
  onOpenSettings
}: HeaderProps) => {
  // Get the Supabase client for authentication actions
  const supabaseClient = useSupabaseClient();
  // Get the current user
  const user = useUser();
  // Get the navigation function from react-router
  const navigate = useNavigate();
  // Get the toast function for showing notifications
  const { toast } = useToast();
  
  // Get neighborhood context data for create neighborhood functionality
  const { currentNeighborhood } = useNeighborhood();
  const { hasAccess: canCreateNeighborhood } = useCreateNeighborhoodAccess();
  
  // State for create neighborhood dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      {/* Removed the 'border-b' class from the header to remove the bottom border stroke */}
        {/*
          Header element removed based on user request via Visual Edit.
          We leave the component and dialog intact for compatibility.
        */}

      {/* Create Neighborhood Dialog */}
      <CreateNeighborhoodDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default Header;
