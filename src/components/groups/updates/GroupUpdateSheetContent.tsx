/**
 * GroupUpdateSheetContent Component
 * 
 * Sheet content for viewing group updates with comments interface
 * Similar to SafetySheetContent but for group updates
 */

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, MessageSquare, User, Calendar } from 'lucide-react';
import { GroupUpdateComments } from './GroupUpdateComments';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { GroupUpdate } from '@/types/groupUpdates';

interface GroupUpdateSheetContentProps {
  update: GroupUpdate;
  onOpenChange: (open: boolean) => void;
}

/**
 * GroupUpdateSheetContent Component
 * 
 * Enhanced sheet content for viewing group updates with sophisticated styling
 * that matches the neighbor directory and safety update design patterns
 */
const GroupUpdateSheetContent = ({ update, onOpenChange }: GroupUpdateSheetContentProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Groups theme colors for consistency
  const groupsTheme = moduleThemeColors.neighbors;
  
  /**
   * Handle delete functionality with proper error handling
   */
  const handleDelete = async () => {
    if (!user || user.id !== update.user_id) return;
    
    setIsDeleting(true);
    try {
      // Soft delete by setting is_deleted flag
      const { error } = await supabase
        .from('group_updates')
        .update({ is_deleted: true })
        .eq('id', update.id);

      if (error) throw error;

      toast({
        title: "Update deleted",
        description: "The group update has been removed.",
      });

      // Invalidate queries and close sheet
      queryClient.invalidateQueries({ queryKey: ['group-activities'] });
      queryClient.invalidateQueries({ queryKey: ['group-updates'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting group update:', error);
      toast({
        title: "Error",
        description: "Failed to delete the group update. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Format time ago in simplified format (2hr, 5d, etc.)
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}hr`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
  };

  const isCurrentUser = user?.id === update.user_id;

  /**
   * Main view with enhanced styling matching safety updates
   */
  return (
    <SheetContent side="right" className="w-full sm:max-w-lg p-0">
      <div className="h-full flex flex-col">
        {/* Enhanced header section with gradient background */}
        <div 
          className="relative p-6"
          style={{
            background: `linear-gradient(135deg, ${groupsTheme.primary}08 0%, ${groupsTheme.primary}03 50%, white 100%)`
          }}
        >
          {/* Enhanced author section with comprehensive information */}
          <div 
            className="p-6 rounded-xl border-2 relative"
            style={{
              background: `linear-gradient(135deg, ${groupsTheme.primary}08 0%, ${groupsTheme.primary}03 50%, white 100%)`,
              borderColor: `${groupsTheme.primary}20`
            }}
          >
            {/* Title and timestamp container */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {update.title}
                </h1>
                {/* Description moved here */}
                {update.content && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {update.content}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatTimeAgo(new Date(update.created_at))}</span>
              </div>
            </div>
            
            {/* Action buttons row */}
            <div className="flex items-end justify-end gap-4 mb-3">
              {/* Action buttons for owner */}
              {user?.id === update.user_id && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 h-8 px-3"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>

            {/* Compact Author Info Layout */}
            <div className="flex items-start gap-4">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage src={update.profiles?.avatar_url || ''} />
                    <AvatarFallback 
                      className="text-sm"
                      style={{ backgroundColor: `${groupsTheme.primary}15`, color: groupsTheme.primary }}
                    >
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {/* Update indicator dot */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center"
                    style={{ backgroundColor: groupsTheme.primary }}
                  >
                    <MessageSquare className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>

              {/* Compact Info Section */}
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  {/* Name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">
                      {update.profiles?.display_name || 'Anonymous'}
                    </h3>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section with improved styling */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6 space-y-6">
            {/* Images section */}
            {update.image_urls && update.image_urls.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div 
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: groupsTheme.primary }}
                  />
                  Images
                </h3>
                <div className="grid gap-3">
                  {update.image_urls.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt={`Update image ${index + 1}`}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div 
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: groupsTheme.primary }}
                />
                Discussion
              </h3>
              <GroupUpdateComments 
                updateId={update.id}
                comments={[]} // This will be handled by the component itself
                currentUserId={user?.id || ''}
                isGroupManager={false} // TODO: Pass actual group manager status
                onComment={async (content) => {
                  // Handle comment creation - this will be managed by the GroupUpdateComments component
                }}
                onReact={async (emoji) => {
                  // Handle reactions - this will be managed by the GroupUpdateComments component
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

export default GroupUpdateSheetContent;