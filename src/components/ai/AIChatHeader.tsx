
/**
 * AIChatHeader Component
 * 
 * This component renders the header section of the AI chat interface.
 * Modified to remove bottom margin/padding for a more compact layout.
 */
import React from 'react';

/**
 * Header component for the AI chat interface
 * Removed bottom padding/border to create a more seamless connection with the chat
 */
const AIChatHeader = () => {
  return (
    <div className="px-4 pt-4 pb-2"> {/* Reduced padding, removed border-b */}
      <h2 className="text-xl font-semibold">The Lovely Neighborhood Assistant</h2>
      <p className="text-sm text-gray-500">Ask me anything about what's happening around the Lovable Neighborhood</p>
    </div>
  );
};
export default AIChatHeader;
