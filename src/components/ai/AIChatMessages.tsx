
/**
 * AIChatMessages Component
 * 
 * This component renders the message area of the AI chat interface.
 */
import React from 'react';
import AIMessage from './AIMessage';
import { Message } from './AIChat';

interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

/**
 * Component that displays all messages in the chat
 */
const AIChatMessages = ({
  messages,
  isLoading,
  loadingMessage,
  messagesEndRef
}: AIChatMessagesProps) => {
  // Render the chat messages area with a flex-grow to take available space
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* If there are messages, display them */}
      {messages.length > 0 && (
        messages.map((message) => (
          <AIMessage key={message.id} message={message} />
        ))
      )}
      
      {/* Show loading message when waiting for AI response */}
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="bg-gray-100 text-gray-800 border border-gray-200 rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
              <span className="text-sm">{loadingMessage}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Invisible div for scrolling to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
