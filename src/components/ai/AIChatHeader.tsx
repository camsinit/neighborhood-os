/**
 * AIChatHeader Component
 * 
 * This component renders the header section of the AI chat interface.
 */
import React from 'react';

/**
 * Header component for the AI chat interface
 */
const AIChatHeader = () => {
  return <div className="p-4 border-b">
      <h2 className="text-xl font-semibold">The Lovely Neighborhood Assistant</h2>
      <p className="text-sm text-gray-500">Ask me anything about what's happening around the Lovable Neighborhood</p>
    </div>;
};
export default AIChatHeader;