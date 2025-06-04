
/**
 * QuickActions component
 * 
 * Displays quick action buttons for common neighborhood activities
 * UPDATED: Added logging to debug neighborhood switching issues
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Package, Shield, Heart, Plus, MessageSquare } from "lucide-react";
import AddEventDialog from "./AddEventDialog";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import { UnifiedInviteDialog } from "./invite/UnifiedInviteDialog";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

const QuickActions = () => {
  // State for controlling which dialog is open
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Get current neighborhood for debugging
  const currentNeighborhood = useCurrentNeighborhood();
  
  // Log current neighborhood for debugging
  console.log("[QuickActions] Current neighborhood:", {
    id: currentNeighborhood?.id,
    name: currentNeighborhood?.name
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Create Event button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
          onClick={() => setShowEventDialog(true)}
        >
          <Calendar className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium">Create Event</span>
        </Button>

        {/* Invite Neighbors button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
          onClick={() => setShowInviteDialog(true)}
        >
          <Users className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium">Invite Neighbors</span>
        </Button>

        {/* Share Goods button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200"
          onClick={() => window.location.href = '/goods'}
        >
          <Package className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium">Share Goods</span>
        </Button>

        {/* Safety Update button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-red-50 hover:border-red-200"
          onClick={() => setShowSafetyDialog(true)}
        >
          <Shield className="h-6 w-6 text-red-600" />
          <span className="text-sm font-medium">Safety Update</span>
        </Button>

        {/* Request Support button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200"
          onClick={() => setShowSupportDialog(true)}
        >
          <Heart className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-medium">Request Support</span>
        </Button>

        {/* Share Skills button */}
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-teal-50 hover:border-teal-200"
          onClick={() => window.location.href = '/skills'}
        >
          <MessageSquare className="h-6 w-6 text-teal-600" />
          <span className="text-sm font-medium">Share Skills</span>
        </Button>
      </div>

      {/* Dialogs */}
      <AddEventDialog 
        open={showEventDialog} 
        onOpenChange={setShowEventDialog} 
      />
      
      <AddSafetyUpdateDialog 
        open={showSafetyDialog} 
        onOpenChange={setShowSafetyDialog} 
      />
      
      <AddSupportRequestDialog 
        open={showSupportDialog} 
        onOpenChange={setShowSupportDialog} 
      />
      
      <UnifiedInviteDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />
    </>
  );
};

export default QuickActions;
