
/**
 * AIMessage Component
 * 
 * This component renders individual messages in the chat, either from the user or the AI assistant.
 * Enhanced to support interactive elements that reference neighborhood items.
 */
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

// Define the Message type
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  // New field to store context information
  context?: {
    events?: Array<{ id: string; title: string; }>;
    skills?: Array<{ id: string; title: string; }>;
    safetyUpdates?: Array<{ id: string; title: string; }>;
  };
};

interface AIMessageProps {
  message: Message;
}

// Regular expression to detect specially formatted items in AI responses
const ITEM_REGEX = /\[([A-Z_]+):([a-zA-Z0-9-]+):(.+?)\]/g;

/**
 * Processes message content to replace references to neighborhood items with interactive elements
 */
const processMessageContent = (content: string, context?: Message['context']) => {
  // If there's no special formatting or context, return the content as is
  if (!content.includes('[') || !context) {
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  }
  
  // Split the content by the special item format and process each part
  const parts = content.split(ITEM_REGEX);
  const result = [];
  
  for (let i = 0; i < parts.length; i++) {
    // Regular text parts (always at even indices)
    if (i % 4 === 0) {
      if (parts[i]) {
        result.push(
          <span key={`text-${i}`} className="whitespace-pre-wrap break-words">
            {parts[i]}
          </span>
        );
      }
      continue;
    }
    
    // For item references (type, id, name at indices i, i+1, i+2)
    if (i % 4 === 1 && i + 2 < parts.length) {
      const itemType = parts[i];           // EVENT, SKILL, etc.
      const itemId = parts[i + 1];         // UUID
      const itemName = parts[i + 2];       // Display name
      
      // Skip the next two parts since we're processing them here
      i += 2;
      
      // Find context data for this item
      let contextItems;
      switch (itemType) {
        case 'EVENT':
          contextItems = context?.events;
          break;
        case 'SKILL':
          contextItems = context?.skills;
          break;
        case 'SAFETY':
          contextItems = context?.safetyUpdates;
          break;
      }
      
      // Add interactive element if we found matching context
      if (contextItems && contextItems.find(item => item.id === itemId)) {
        result.push(
          <ItemReference 
            key={`item-${itemType}-${itemId}`}
            type={itemType} 
            id={itemId} 
            name={itemName}
          />
        );
      } else {
        // Fallback if no context match
        result.push(
          <span key={`item-text-${i}`} className="font-medium text-blue-600">
            {itemName}
          </span>
        );
      }
    }
  }
  
  return <div>{result}</div>;
};

/**
 * Interactive reference to a neighborhood item
 */
const ItemReference = ({ type, id, name }: { type: string; id: string; name: string }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const handleNavigate = () => {
    // Handle navigation based on item type
    let path = '';
    switch (type) {
      case 'EVENT':
        path = `/calendar?event=${id}`;
        break;
      case 'SKILL':
        path = `/skills?skill=${id}`;
        break;
      case 'SAFETY':
        path = `/safety?update=${id}`;
        break;
      default:
        return;
    }
    
    // Close the popover and navigate
    setIsPopoverOpen(false);
    // For now, just log the navigation. Could use router later.
    console.log(`[AI] Would navigate to: ${path}`);
  };
  
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <button 
          className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium mx-1"
        >
          {name} <Info size={14} className="ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500">
            {type === 'EVENT' && 'Event details'}
            {type === 'SKILL' && 'Skill offering details'}
            {type === 'SAFETY' && 'Safety update details'}
          </p>
          <Button 
            size="sm" 
            onClick={handleNavigate}
            className="w-full mt-2"
          >
            View Details
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
        {/* Process the message content for interactive elements */}
        {isUserMessage 
          ? <p className="whitespace-pre-wrap break-words">{message.content}</p>
          : processMessageContent(message.content, message.context)
        }
        
        {/* Message timestamp */}
        <div className={`text-xs mt-1 ${isUserMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
