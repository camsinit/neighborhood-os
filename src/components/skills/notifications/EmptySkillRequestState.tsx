
import React from 'react';

/**
 * Empty state component for when there are no skill requests available
 * 
 * This component shows a user-friendly message when no requests are found
 */
interface EmptySkillRequestStateProps {
  message?: string;
  subMessage?: string;
}

const EmptySkillRequestState: React.FC<EmptySkillRequestStateProps> = ({ 
  message = "No skill requests available",
  subMessage = "Check back later for new requests" 
}) => {
  return (
    <div className="py-8 px-4 text-center text-gray-500">
      <p>{message}</p>
      <p className="text-xs mt-1">{subMessage}</p>
    </div>
  );
};

export default EmptySkillRequestState;
