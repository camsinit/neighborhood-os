
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Form data interface for creating a new neighborhood
 */
interface CreateNeighborhoodForm {
  name: string;
  city: string;
  state: string;
  address?: string;
}

/**
 * Props for the CreateNeighborhoodDialog component
 */
interface CreateNeighborhoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreateNeighborhoodDialog Component
 * 
 * A dialog for creating a new neighborhood with basic information
 * including name, city, state, and optional address.
 */
export const CreateNeighborhoodDialog: React.FC<CreateNeighborhoodDialogProps> = ({
  open,
  onOpenChange
}) => {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form setup with react-hook-form
  const form = useForm<CreateNeighborhoodForm>({
    defaultValues: {
      name: '',
      city: '',
      state: '',
      address: '',
    },
  });

  /**
   * Handle form submission to create a new neighborhood
   */
  const onSubmit = async (data: CreateNeighborhoodForm) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a neighborhood');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[CreateNeighborhood] Creating neighborhood:', data);
      
      // Create the neighborhood record
      const { data: neighborhood, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .insert([
          {
            name: data.name,
            city: data.city,
            state: data.state,
            address: data.address || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default to user's timezone
          }
        ])
        .select()
        .single();

      if (neighborhoodError) {
        console.error('[CreateNeighborhood] Error creating neighborhood:', neighborhoodError);
        throw new Error(`Failed to create neighborhood: ${neighborhoodError.message}`);
      }

      console.log('[CreateNeighborhood] Neighborhood created:', neighborhood);

      // Add the creator as the first member of the neighborhood
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert([
          {
            user_id: user.id,
            neighborhood_id: neighborhood.id,
            status: 'active',
            joined_at: new Date().toISOString(),
          }
        ]);

      if (memberError) {
        console.error('[CreateNeighborhood] Error adding creator as member:', memberError);
        // Note: We could implement rollback logic here, but for now we'll just log the error
        toast.error('Neighborhood created but failed to add you as a member. Please contact support.');
        return;
      }

      console.log('[CreateNeighborhood] Creator added as member successfully');
      
      // Success feedback
      toast.success(`Neighborhood "${data.name}" created successfully!`);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh the page to update the neighborhood context
      window.location.reload();
      
    } catch (error) {
      console.error('[CreateNeighborhood] Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create neighborhood');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Neighborhood</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Neighborhood Name Field */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Neighborhood name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neighborhood Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Maple Street Community" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City Field */}
            <FormField
              control={form.control}
              name="city"
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Portland" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State Field */}
            <FormField
              control={form.control}
              name="state"
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., OR" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 123 Main St" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Neighborhood
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
