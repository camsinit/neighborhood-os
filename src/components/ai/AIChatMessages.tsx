
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
const AIChatMessages = ({ messages, isLoading, loadingMessage, messagesEndRef }: AIChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <AIMessage 
          key={message.id} 
          message={message} 
        />
      ))}
      {isLoading && (
        <div className="flex items-center text-gray-500">
          <div className="animate-pulse mr-2">⟳</div>
          <p>{loadingMessage}</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
