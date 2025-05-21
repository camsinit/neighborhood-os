
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';

/**
 * InviteNeighborPopover Component Props
 * 
 * Updated to properly accept open and onOpenChange props
 */
interface InviteNeighborPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * InviteNeighborPopover Component
 * 
 * This component renders a popover for inviting new neighbors
 * by email. It accepts open/onOpenChange props for controlled usage.
 */
const InviteNeighborPopover = ({
  open,
  onOpenChange
}: InviteNeighborPopoverProps) => {
  // State for the email input
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current neighborhood context
  const { currentNeighborhood } = useNeighborhood();

  // Handle sending the invite
  const handleSendInvite = async () => {
    // Validate email first
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Show loading state
    setIsLoading(true);

    try {
      // Here you would typically call your API to send the invite
      // This is a placeholder for the actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      toast({
        title: "Invitation Sent",
        description: `We've sent an invitation to ${email}`,
      });
      
      // Reset form and close popover
      setEmail('');
      onOpenChange(false);
    } catch (error) {
      // Error handling
      toast({
        title: "Failed to Send Invite",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Invite a New Neighbor</h4>
            <p className="text-sm text-muted-foreground">
              Send an invitation to join {currentNeighborhood?.name || 'your neighborhood'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="flex space-x-2">
              <Input 
                id="email"
                placeholder="neighbor@example.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendInvite} 
                size="icon"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InviteNeighborPopover;
