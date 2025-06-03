import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UniversalDialog from '@/components/ui/universal-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// ... keep existing code (schema definitions and categories) the same ...

/**
 * Form schema for creating support requests
 */
const supportRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  requestType: z.enum(['offer', 'need']),
  category: z.string().min(1, 'Category is required'),
  skillCategory: z.string().optional(),
  careCategory: z.string().optional(),
  goodsCategory: z.string().optional(),
});

// Category options
const skillCategories = [
  'Technology', 'Home & Garden', 'Education', 'Health & Wellness', 
  'Arts & Crafts', 'Music', 'Sports & Fitness', 'Cooking', 
  'Languages', 'Professional Services', 'Transportation', 'Other'
];

const careCategories = [
  'Childcare', 'Pet Care', 'Elder Care', 'Plant Care', 
  'House Sitting', 'Other'
];

const goodsCategories = [
  'Furniture', 'Electronics', 'Clothing', 'Books', 'Tools', 
  'Kitchen Items', 'Garden Supplies', 'Sports Equipment', 
  'Toys & Games', 'Other'
];

/**
 * Props for the AddSupportRequestDialog component
 */
interface AddSupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: 'offer' | 'need';
  view?: 'skills' | 'care' | 'goods' | 'general';
}

/**
 * Simplified dialog for adding support requests (skills, care, goods)
 * Removed all scheduling complexity - now just creates the basic request
 */
const AddSupportRequestDialog: React.FC<AddSupportRequestDialogProps> = ({
  open,
  onOpenChange,
  initialRequestType = 'offer',
  view = 'general'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

  // Initialize form with proper defaults
  const form = useForm<z.infer<typeof supportRequestSchema>>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      requestType: initialRequestType,
      category: view === 'skills' ? 'skills' : view === 'care' ? 'care' : view === 'goods' ? 'goods' : 'skills',
      skillCategory: '',
      careCategory: '',
      goodsCategory: '',
    },
  });

  // Watch form values for conditional rendering
  const category = form.watch('category');
  const requestType = form.watch('requestType');

  /**
   * Handle form submission - now much simpler without scheduling
   */
  const onSubmit = async (values: z.infer<typeof supportRequestSchema>) => {
    if (!user) {
      toast.error('You must be logged in to create a request');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user's neighborhood
      const { data: membership } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        toast.error('You must be a member of a neighborhood to create requests');
        return;
      }

      // Determine which table to insert into and prepare data
      let tableName: string;
      let insertData: any = {
        title: values.title,
        description: values.description,
        request_type: values.requestType,
        user_id: user.id,
        neighborhood_id: membership.neighborhood_id,
        created_at: new Date().toISOString(),
        is_archived: false,
        is_read: false
      };

      if (values.category === 'skills') {
        tableName = 'skills_exchange';
        insertData.skill_category = values.skillCategory || 'Other';
      } else if (values.category === 'care') {
        tableName = 'care_requests';
        insertData.care_category = values.careCategory || 'Other';
        insertData.support_type = 'care';
        insertData.valid_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      } else if (values.category === 'goods') {
        tableName = 'goods_exchange';
        insertData.goods_category = values.goodsCategory || 'Other';
        insertData.category = 'goods';
        insertData.valid_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      } else {
        // Default to skills for any other category
        tableName = 'skills_exchange';
        insertData.skill_category = 'Other';
      }

      // Insert the request
      const { error } = await supabase
        .from(tableName)
        .insert(insertData);

      if (error) throw error;

      // Success!
      toast.success(`${values.category} ${values.requestType} created successfully!`);
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['simplified-skills'] });
      queryClient.invalidateQueries({ queryKey: ['care-requests'] });
      queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();

    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UniversalDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={`Add ${category === 'skills' ? 'Skill' : category === 'care' ? 'Care Request' : 'Item'} ${requestType === 'offer' ? 'Offer' : 'Request'}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Request Type */}
          <FormField
            control={form.control}
            name="requestType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="offer">Offering</SelectItem>
                    <SelectItem value="need">Looking for</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="skills">Skills</SelectItem>
                    <SelectItem value="care">Care</SelectItem>
                    <SelectItem value="goods">Goods</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subcategory based on main category */}
          {category === 'skills' && (
            <FormField
              control={form.control}
              name="skillCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {skillCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {category === 'care' && (
            <FormField
              control={form.control}
              name="careCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select care category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {careCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {category === 'goods' && (
            <FormField
              control={form.control}
              name="goodsCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goods Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goods category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goodsCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`What ${category === 'skills' ? 'skill' : category === 'care' ? 'care' : 'item'} are you ${requestType === 'offer' ? 'offering' : 'looking for'}?`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add more details..."
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : `Create ${requestType === 'offer' ? 'Offer' : 'Request'}`}
            </Button>
          </div>
        </form>
      </Form>
    </UniversalDialog>
  );
};

export default AddSupportRequestDialog;
