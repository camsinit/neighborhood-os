/**
 * GroupUpdateCard Component
 * 
 * Displays individual group updates with content, reactions, and comments.
 * Supports threaded discussions and emoji reactions.
 */

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupUpdateWithComments } from '@/types/groupUpdates';
import { MessageCircle, Smile, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { GroupUpdateComments } from './GroupUpdateComments';
import { GroupUpdateReactions } from './GroupUpdateReactions';

interface GroupUpdateCardProps {
  update: GroupUpdateWithComments;
  currentUserId: string;
  isGroupManager: boolean;
  onReact: (updateId: string, emoji: string) => Promise<void>;
  onComment: (updateId: string, content: string) => Promise<void>;
  onEdit?: (updateId: string, content: string) => Promise<void>;
  onDelete?: (updateId: string) => Promise<void>;
}

export function GroupUpdateCard({
  update,
  currentUserId,
  isGroupManager,
  onReact,
  onComment,
  onEdit,
  onDelete
}: GroupUpdateCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if current user is the author or can manage the update
  const canEdit = currentUserId === update.user_id || isGroupManager;
  const canDelete = currentUserId === update.user_id || isGroupManager;

  // Get author display info
  const authorName = update.profiles?.display_name || 'Unknown User';
  const authorAvatar = update.profiles?.avatar_url;
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Format the creation time
  const timeAgo = formatDistanceToNow(new Date(update.created_at), { addSuffix: true });

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      setIsEditing(true);
    }
  };

  // Handle delete action  
  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this update?')) {
      onDelete(update.id);
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{authorName}</span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              {update.edited_by && (
                <span className="text-xs text-muted-foreground italic">Edited</span>
              )}
            </div>
          </div>

          {/* Actions menu for edit/delete */}
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Update content */}
        <div className="text-sm whitespace-pre-wrap">{update.content}</div>

        {/* Images if any */}
        {update.image_urls && update.image_urls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {update.image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Update image ${index + 1}`}
                className="w-full rounded-md max-h-64 object-cover"
              />
            ))}
          </div>
        )}

        {/* Reactions summary */}
        <GroupUpdateReactions
          reactions={update.reactions}
          reactionSummary={update.reactionSummary}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact(update.id, emoji)}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-2"
          >
            <Smile className="h-4 w-4" />
            React
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {update.commentCount > 0 ? `${update.commentCount} Comments` : 'Comment'}
          </Button>
        </div>

        {/* Emoji picker (when reacting) */}
        {showReactions && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            {['👍', '❤️', '😄', '😮', '😢', '😡'].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="text-lg p-1 h-auto"
                onClick={() => {
                  onReact(update.id, emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Comments section */}
        {showComments && (
          <GroupUpdateComments
            updateId={update.id}
            comments={update.comments}
            currentUserId={currentUserId}
            isGroupManager={isGroupManager}
            onComment={onComment}
            onReact={onReact}
          />
        )}
      </CardContent>
    </Card>
  );
}