import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createItemNavigationService } from '@/services/navigation/ItemNavigationService';

interface EventAttendee {
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
  isHost?: boolean;
}

interface EventAttendeesPopoverProps {
  /**
   * List of event attendees to display in the popover
   */
  attendees: EventAttendee[];
  /**
   * The trigger element that opens the popover when clicked
   */
  children: React.ReactNode;
  /**
   * Current user ID to show "(You)" indicator
   */
  currentUserId?: string;
}

/**
 * Popover component that displays all event attendees
 *
 * Features:
 * - Shows attendee avatar and name
 * - Indicates host with "(Host)" label
 * - Indicates current user with "(You)" label
 * - Clicking on an attendee navigates to their neighbor profile
 * - Scrollable list for events with many attendees
 */
export const EventAttendeesPopover: React.FC<EventAttendeesPopoverProps> = ({
  attendees,
  children,
  currentUserId,
}) => {
  const navigate = useNavigate();

  // Create navigation service
  const navigationService = createItemNavigationService(navigate);

  /**
   * Handle clicking on an attendee - navigate to their neighbor profile
   */
  const handleAttendeeClick = async (attendee: EventAttendee) => {
    await navigationService.navigateToItem('neighbors', attendee.user_id, { showToast: false });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">
            Attendees ({attendees.length})
          </h3>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {attendees.map((attendee) => {
              const isCurrentUser = currentUserId === attendee.user_id;
              const isHost = attendee.isHost || false;

              return (
                <div
                  key={attendee.user_id}
                  onClick={() => handleAttendeeClick(attendee)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Attendee avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={attendee.profiles?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {attendee.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Attendee info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attendee.profiles?.display_name || 'Anonymous'}
                      {isHost && <span className="text-xs text-blue-600 ml-1 font-medium">(Host)</span>}
                      {!isHost && isCurrentUser && <span className="text-xs text-gray-500 ml-1">(You)</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
