
/**
 * AIMessage Component
 * 
 * This component renders individual messages in the chat, either from the user or the AI assistant.
 * The styling has been enhanced to serve as the visual foundation for our site-wide aesthetic.
 */
import { format } from 'date-fns';
import { Message } from './AIChat';

interface AIMessageProps {
  message: Message;
}

/**
 * Renders a chat message with enhanced styling that will be used as the basis
 * for our site-wide visual language
 */
const AIMessage = ({ message }: AIMessageProps) => {
  // Determine if this is a user message or AI message
  const isUserMessage = message.role === 'user';
  
  // Format the timestamp
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
          isUserMessage 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}
      >
        {/* Message content with improved typography */}
        <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
          {message.content}
        </p>
        
        {/* Message timestamp with subtle styling */}
        <div className={`text-xs mt-2 ${isUserMessage ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
