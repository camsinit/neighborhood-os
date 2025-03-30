
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
 * Height reduced to make room for other components on the page
 */
const AIChatMessages = ({
  messages,
  isLoading,
  loadingMessage,
  messagesEndRef
}: AIChatMessagesProps) => {
  // Render the chat messages area with reduced height
  return (
    <div className="flex-1 p-4 overflow-y-auto max-h-[200px] min-h-[150px]">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Ask me anything about your neighborhood!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <AIMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="animate-pulse delay-75">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="animate-pulse delay-150">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500">{loadingMessage}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default AIChatMessages;
