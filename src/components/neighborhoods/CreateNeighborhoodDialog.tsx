
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateNeighborhood } from '@/hooks/useCreateNeighborhood';
import { useSuperAdminCreateNeighborhood } from '@/hooks/useSuperAdminCreateNeighborhood';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';

/**
 * Form data interface for creating a new neighborhood
 */
interface CreateNeighborhoodFormData {
  name: string;
  city: string;
  state: string;
  address?: string;
  timezone: string;
}

/**
 * Props for the CreateNeighborhoodDialog component
 */
interface CreateNeighborhoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for creating a new neighborhood
 * 
 * This component provides a form for users to create new neighborhoods
 * with validation and proper error handling.
 */
export const CreateNeighborhoodDialog: React.FC<CreateNeighborhoodDialogProps> = ({
  open,
  onOpenChange,
}) => {
  // Check if user is super admin to use appropriate creation hook
  const { isSuperAdmin } = useSuperAdminAccess();
  
  // Use super admin hook if user is super admin, otherwise use regular hook
  const { createNeighborhood, isCreating } = useCreateNeighborhood();
  const { createNeighborhoodAsSuperAdmin, isCreating: isSuperAdminCreating } = useSuperAdminCreateNeighborhood();
  
  // Determine which creation function and loading state to use
  const handleCreateNeighborhood = isSuperAdmin ? createNeighborhoodAsSuperAdmin : createNeighborhood;
  const isCreatingNeighborhood = isSuperAdmin ? isSuperAdminCreating : isCreating;

  // Initialize form with react-hook-form
  const form = useForm<CreateNeighborhoodFormData>({
    defaultValues: {
      name: '',
      city: '',
      state: '',
      address: '',
      timezone: 'America/Los_Angeles', // Default timezone
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateNeighborhoodFormData) => {
    const result = await handleCreateNeighborhood(data);
    
    if (result) {
      // Close dialog and reset form on success
      form.reset();
      onOpenChange(false);
    }
  };

  /**
   * Handle dialog close - reset form when dialog closes
   */
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Neighborhood</DialogTitle>
          <DialogDescription>
            Set up a new neighborhood community. You'll become the first member and can invite others to join.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Neighborhood Name Field */}
            <FormField
              control={form.control}
              name="name"
              rules={{ 
                required: 'Neighborhood name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neighborhood Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sunset District, Oak Avenue" 
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
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., San Francisco" 
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
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., California" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field (Optional) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 123 Main Street" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timezone Field */}
            <FormField
              control={form.control}
              name="timezone"
              rules={{ required: 'Timezone is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Phoenix">Arizona Time (MST)</SelectItem>
                      <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                      <SelectItem value="Pacific/Honolulu">Hawaii Time (HST)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={isCreatingNeighborhood}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingNeighborhood}
              >
                {isCreatingNeighborhood ? 'Creating...' : 'Create Neighborhood'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
