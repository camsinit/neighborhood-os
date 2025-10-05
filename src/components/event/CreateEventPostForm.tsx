/**
 * CreateEventPostForm Component
 *
 * Form for creating new event posts with:
 * - Title field
 * - Content field
 * - Image upload (click or drag-and-drop)
 * - Image compression before upload
 */

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Image, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/logger';
import { compressImages } from '@/utils/imageCompression';
import { handleImageUpload } from '@/utils/imageHandling';
import { supabase } from '@/integrations/supabase/client';

const logger = createLogger('CreateEventPostForm');

// Form validation schema
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreateEventPostFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateEventPostForm({ eventId, onSuccess, onCancel }: CreateEventPostFormProps) {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Handle image file selection
  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    // Validate file types
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Compress images
    try {
      toast({
        title: "Compressing images...",
        description: "Please wait while we optimize your images",
      });

      const compressedFiles = await compressImages(validFiles, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeMB: 2,
      });

      // Create preview URLs
      const newUrls = compressedFiles.map(file => URL.createObjectURL(file));

      setImageFiles(prev => [...prev, ...compressedFiles]);
      setImagePreviewUrls(prev => [...prev, ...newUrls]);

      toast({
        title: "Images added",
        description: `${compressedFiles.length} image(s) ready to upload`,
      });
    } catch (error) {
      logger.error('Error compressing images:', error);
      toast({
        title: "Error compressing images",
        description: "Please try again with different images",
        variant: "destructive",
      });
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleImageSelect(files);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (data: CreatePostFormData) => {
    setIsSubmitting(true);

    try {
      logger.debug('Creating event post:', { eventId, title: data.title, imageCount: imageFiles.length });

      // Upload images to storage
      const imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        toast({
          title: "Uploading images...",
          description: "Please wait while we upload your images",
        });

        for (const file of imageFiles) {
          const url = await handleImageUpload(file, 'images', `event-posts/${eventId}`);
          imageUrls.push(url);
        }
      }

      // Create the post in the database
      const { error } = await supabase
        .from('event_posts')
        .insert({
          event_id: eventId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: data.title,
          content: data.content,
          image_urls: imageUrls,
        });

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared with event attendees",
      });

      // Reset form
      form.reset();
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviewUrls([]);

      if (onSuccess) onSuccess();

      logger.info('Event post created successfully');
    } catch (error) {
      logger.error('Error creating event post:', error);
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              <div className="flex items-center justify-between mb-1">
                <FormLabel className="text-sm font-medium">Title</FormLabel>
                <span className={`text-xs ${field.value.length > 90 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {field.value.length}/100
                </span>
              </div>
              <FormControl>
                <Input
                  placeholder="Brief title for your post..."
                  maxLength={100}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content textarea with drag-and-drop */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Content</FormLabel>
              <FormControl>
                <div
                  className={`relative ${isDragging ? 'ring-2 ring-blue-500 rounded-md' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Textarea
                    ref={textareaRef}
                    placeholder="Share an update or question with event attendees..."
                    rows={4}
                    className="resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center rounded-md pointer-events-none">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm font-medium text-blue-700">Drop images here</p>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => removeImage(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files)}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <Image className="h-4 w-4 mr-2" />
              Add Images
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !form.formState.isValid}
              style={{
                backgroundColor: 'hsl(var(--calendar-color))',
                color: 'white',
              }}
              className="hover:opacity-90"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
