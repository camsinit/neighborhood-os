/**
 * CreateGroupUpdateForm Component
 * 
 * Universal form for creating new group updates with:
 * - Title field (25 char limit)
 * - Content field (unlimited)
 * - Image upload capability
 * - Consistent design across all group types
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/components/hooks/use-auto-resize-textarea';
import { Image, X, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CreateGroupUpdateForm');

// Form validation schema - Updated to include title field
const createUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(25, 'Title must be 25 characters or less'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
});

type CreateUpdateFormData = z.infer<typeof createUpdateSchema>;

interface CreateGroupUpdateFormProps {
  groupId: string;
  onSubmit: (data: { title: string; content: string; image_urls?: string[] }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function CreateGroupUpdateForm({ 
  groupId, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: CreateGroupUpdateFormProps) {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Auto-resize textarea hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 80,
    maxHeight: 200
  });

  const form = useForm<CreateUpdateFormData>({
    resolver: zodResolver(createUpdateSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Handle text input change and adjust textarea height
  const handleContentChange = (value: string) => {
    form.setValue('content', value);
    // Adjust height after the value is set
    setTimeout(() => adjustHeight(), 0);
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select images smaller than 10MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    // Create preview URLs
    const newUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    // Clean up object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (data: CreateUpdateFormData) => {
    try {
      logger.debug('Creating group update:', { groupId, content: data.content, imageCount: imageFiles.length });
      
      // For now, we'll pass the image files as data URLs
      // In a real implementation, you'd upload to storage first
      const imageDataUrls = await Promise.all(
        imageFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      
      await onSubmit({
        title: data.title,
        content: data.content,
        image_urls: imageDataUrls
      });
      
      // Reset form on success
      form.reset();
      setImageFiles([]);
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      setImageUrls([]);
      
      logger.info('Group update created successfully');
    } catch (error) {
      logger.error('Error creating group update:', error);
      toast({
        title: "Error creating update",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-sm font-medium">Title</FormLabel>
                <span className={`text-xs ${field.value.length > 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {field.value.length}/25
                </span>
              </div>
              <FormControl>
                <Input
                  placeholder="Brief title for your update..."
                  maxLength={25}
                  className="focus:ring-purple-500 focus:border-purple-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content textarea */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Content</FormLabel>
              <FormControl>
                <Textarea
                  ref={textareaRef}
                  placeholder="Share an update with the group..."
                  rows={4}
                  className="focus:ring-purple-500 focus:border-purple-500 resize-none"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    handleContentChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image previews */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Add Images
                </div>
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !form.formState.isValid}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <div className="flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Post Update
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}