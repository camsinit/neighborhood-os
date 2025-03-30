
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
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="mb-2">👋 How can I help you today?</p>
            <p className="text-sm">Ask me about neighborhood activities, finding resources, or connecting with neighbors</p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default AIChatMessages;
