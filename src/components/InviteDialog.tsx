
/**
 * Dialog component for inviting new users to a neighborhood
 */
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNeighborhood } from '@/contexts/neighborhood';
import { supabase } from '@/integrations/supabase/client';

/**
 * InviteDialog component for inviting new members to the neighborhood
 * 
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to call when the dialog open state changes
 */
const InviteDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  // Get current user
  const user = useUser();
  
  // Get neighborhood context
  const { currentNeighborhood } = useNeighborhood();
  
  // State for email input
  const [email, setEmail] = useState('');
  
  // State for loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle sending the invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!currentNeighborhood) {
      toast.error('No neighborhood selected');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to send invites');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a random invite code
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      // Insert the invitation into the database
      const { error } = await supabase
        .from('invitations')
        .insert({
          email,
          inviter_id: user.id,
          neighborhood_id: currentNeighborhood.id,
          invite_code: inviteCode
        });
      
      if (error) throw error;
      
      // Show success message
      toast.success(`Invitation sent to ${email}`);
      
      // Reset form and close dialog
      setEmail('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Invite a Neighbor</h2>
          
          <form onSubmit={handleSendInvite}>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="neighbor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  Your invitation will allow this person to join {currentNeighborhood?.name || 'your neighborhood'}.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button 
                type="button" 
                onClick={() => onOpenChange(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default InviteDialog;
