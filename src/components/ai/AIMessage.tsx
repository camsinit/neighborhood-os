
/**
 * AIMessage Component
 * 
 * This component renders individual messages in the chat, either from the user or the AI assistant.
 */
import { format } from 'date-fns';

// Define the Message type
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

interface AIMessageProps {
  message: Message;
}

const AIMessage = ({ message }: AIMessageProps) => {
  const isUserMessage = message.role === 'user';
  
  // Format the timestamp
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUserMessage 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        
        {/* Message timestamp */}
        <div className={`text-xs mt-1 ${isUserMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
