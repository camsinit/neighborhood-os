/**
 * GroupUpdateReactions Component
 * 
 * Displays emoji reactions for group updates and comments.
 * Shows reaction counts and allows users to add/remove reactions.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupUpdateReaction } from '@/types/groupUpdates';

interface GroupUpdateReactionsProps {
  reactions: GroupUpdateReaction[];
  reactionSummary: { [emoji: string]: number };
  currentUserId: string;
  onReact: (emoji: string) => void;
}

export function GroupUpdateReactions({
  reactions,
  reactionSummary,
  currentUserId,
  onReact
}: GroupUpdateReactionsProps) {
  // Get user's current reactions
  const userReactions = reactions
    .filter(r => r.user_id === currentUserId)
    .map(r => r.emoji);

  // If no reactions, don't render anything
  if (Object.keys(reactionSummary).length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(reactionSummary).map(([emoji, count]) => {
        const hasUserReacted = userReactions.includes(emoji);
        
        return (
          <Button
            key={emoji}
            variant={hasUserReacted ? "default" : "outline"}
            size="sm"
            className="h-7 px-2 text-sm"
            onClick={() => onReact(emoji)}
          >
            <span className="mr-1">{emoji}</span>
            <span className="text-xs">{count}</span>
          </Button>
        );
      })}
    </div>
  );
}