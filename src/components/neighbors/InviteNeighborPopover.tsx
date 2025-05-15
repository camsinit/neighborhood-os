
/**
 * InviteNeighborPopover.tsx
 * 
 * This component provides a popover UI for inviting neighbors to join the neighborhood
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createLogger } from '@/utils/logger';

// Initialize logger
const logger = createLogger('InviteNeighborPopover');

/**
 * Popover component for inviting neighbors
 * Uses direct DB operations that trigger the notification DB functions
 */
const InviteNeighborPopover: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [open, setOpen] = useState(false);
  const { currentNeighborhood } = useNeighborhood();

  // Handle inviting a new neighbor
  const handleInvite = async () => {
    // Validate inputs
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to invite a neighbor",
        variant: "destructive"
      });
      return;
    }

    if (!currentNeighborhood?.id) {
      toast({
        title: "No Neighborhood Selected",
        description: "You need to be part of a neighborhood to invite neighbors",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInviting(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to invite neighbors");
      }
      
      // Generate a unique invitation code
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      logger.info("Creating invitation", { 
        email, 
        neighborhoodId: currentNeighborhood.id,
        inviterId: user.id 
      });
      
      // Insert invitation record directly - this will handle all necessary side effects
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: email,
          inviter_id: user.id,
          neighborhood_id: currentNeighborhood.id,
          invite_code: inviteCode,
          status: 'pending'
        });
        
      if (error) {
        throw error;
      }
      
      // Success!
      toast({
        title: "Invitation Sent",
        description: `We've sent an invitation to ${email}`,
      });
      
      // Reset form and close popover
      setEmail('');
      setOpen(false);
    } catch (error: any) {
      logger.error("Failed to invite neighbor", error);
      
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default" className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Invite Neighbor
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Invite a Neighbor</h4>
            <p className="text-sm text-gray-500">
              Enter your neighbor's email to send them an invitation to join your neighborhood.
            </p>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="neighbor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <Button 
            className="w-full" 
            disabled={isInviting} 
            onClick={handleInvite}
          >
            {isInviting ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InviteNeighborPopover;
