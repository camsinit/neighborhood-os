import React, { useState } from 'react';
import { Button } from './button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface for the ShareButton component props
 */
interface ShareButtonProps {
  contentType: 'events' | 'safety' | 'skills' | 'goods' | 'groups';
  contentId: string;
  neighborhoodId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * ShareButton - A reusable component for sharing neighborhood items
 * 
 * This component:
 * - Creates a shareable link for any neighborhood item
 * - Copies the link to clipboard
 * - Shows success feedback to user
 * - Handles all the database operations for share tracking
 * 
 * Usage: Add to any card component where sharing is needed
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  contentType,
  contentId,
  neighborhoodId,
  className = '',
  size = 'sm',
  variant = 'ghost'
}) => {
  // Get current user for share tracking
  const user = useUser();
  
  // State for loading/disabled state during share generation
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Handle the share button click
   * Creates a share record and copies link to clipboard
   */
  const handleShare = async (e: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering parent click handlers
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!user) {
      toast.error('You must be logged in to share items');
      return;
    }

    setIsSharing(true);

    try {
      // Generate unique share code using the database function
      const { data: shareCodeData, error: shareCodeError } = await supabase
        .rpc('generate_share_code');

      if (shareCodeError) {
        throw new Error('Failed to generate share code');
      }

      const shareCode = shareCodeData;

      // Create the share record in the database
      const { error: insertError } = await supabase
        .from('shared_items')
        .insert({
          content_type: contentType,
          content_id: contentId,
          neighborhood_id: neighborhoodId,
          share_code: shareCode,
          shared_by: user.id
        });

      if (insertError) {
        throw insertError;
      }

      // Create the shareable URL using the fixed domain
      const shareUrl = `https://neighborhoodos.com/share/${shareCode}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show success message
      toast.success('Share link copied to clipboard!', {
        description: 'Anyone with this link can view this item'
      });

    } catch (error: any) {
      console.error('Error creating share link:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('clipboard')) {
        toast.error('Failed to copy link, but share was created');
      } else {
        toast.error('Failed to create share link. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      size={size}
      variant={variant}
      className={`h-10 w-10 p-0 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors ${className}`}
      title="Share this item"
      aria-label="Share this item"
    >
      <Upload className="h-4 w-4" />
    </Button>
  );
};

export default ShareButton;