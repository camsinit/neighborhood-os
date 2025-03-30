
/**
 * AIChatMessages Component
 * 
 * This component renders the message area of the AI chat interface.
 */
import React from 'react';
import AIMessage from './AIMessage';
import { Message } from './AIChat';

// Define props interface for type safety
interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

/**
 * Component that displays all messages in the chat
 * 
 * @param messages - Array of message objects to display
 * @param isLoading - Boolean indicating if a message is currently being processed
 * @param loadingMessage - Text to display while loading
 * @param messagesEndRef - Ref object for auto-scrolling to the most recent message
 */
const AIChatMessages = ({
  messages,
  isLoading,
  loadingMessage,
  messagesEndRef
}: AIChatMessagesProps) => {
  // Render the messages directly without a constraining container
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Map through and render each message */}
      {messages.map((message) => (
        <AIMessage key={message.id} message={message} />
      ))}
      
      {/* Show loading indicator when waiting for AI response */}
      {isLoading && (
        <AIMessage 
          message={{
            id: 'loading',
            content: loadingMessage,
            role: 'assistant',
            timestamp: new Date(),
          }} 
          isLoading={true}
        />
      )}
      
      {/* Invisible div that serves as a reference point for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
