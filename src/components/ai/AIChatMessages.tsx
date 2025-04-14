
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
  className?: string; // Added className prop
}

/**
 * Component that displays all messages in the chat
 * 
 * @param messages - Array of message objects to display
 * @param isLoading - Boolean indicating if a message is currently being processed
 * @param loadingMessage - Text to display while loading
 * @param messagesEndRef - Ref object for auto-scrolling to the most recent message
 * @param className - Optional CSS classes to apply to the component
 */
const AIChatMessages = ({
  messages,
  isLoading,
  loadingMessage,
  messagesEndRef,
  className
}: AIChatMessagesProps) => {
  // Apply the provided className along with default styles
  return (
    <div className={className}>
      {/* Map through and render each message */}
      {messages.map(message => <AIMessage key={message.id} message={message} />)}
      
      {/* Show loading indicator when waiting for AI response */}
      {isLoading && <AIMessage message={{
        id: 'loading',
        content: loadingMessage,
        role: 'assistant',
        timestamp: new Date()
      }} isLoading={true} />}
      
      {/* Invisible div that serves as a reference point for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
