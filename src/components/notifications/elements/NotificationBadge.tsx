
/**
 * NotificationBadge.tsx
 * 
 * A simple badge component that shows the number of unread notifications
 */
import React from "react";

interface NotificationBadgeProps {
  count: number;
}

/**
 * Badge showing notification count
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  // Only show if there are unread notifications
  if (count <= 0) return null;
  
  return (
    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default NotificationBadge;
