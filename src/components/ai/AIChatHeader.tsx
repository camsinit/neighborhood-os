
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
  return (
    <div className="p-4 border-b">
      <h2 className="text-xl font-semibold">Neighborhood Assistant</h2>
      <p className="text-sm text-gray-500">Ask questions about your neighborhood</p>
    </div>
  );
};

export default AIChatHeader;
