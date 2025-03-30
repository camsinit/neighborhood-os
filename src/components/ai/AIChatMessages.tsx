
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
  // Render the chat messages area
  return (
    <div className="flex-1 p-4 overflow-y-auto max-h-[400px] min-h-[300px]">
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
    </div>
  );
};

export default AIChatMessages;
