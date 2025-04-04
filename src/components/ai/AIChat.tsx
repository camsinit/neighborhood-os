/**
 * AIChat Component
 * 
 * This is the main container component for the AI chat interface on the homepage.
 * It manages the chat state, handles message submission, and displays the chat history.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import AIChatMessages from './AIChatMessages';
import AIChatHeader from './AIChatHeader';
import { AIInputWithSuggestions } from '../ui/ai-input-with-suggestions';
import { Text, CheckCheck } from "lucide-react";

// Define the message type for type safety
export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  // Context field is kept but not actively used for now
  context?: {
    events?: Array<{ id: string; title: string; }>;
    skills?: Array<{ id: string; title: string; }>;
    safetyUpdates?: Array<{ id: string; title: string; }>;
  };
};

// Define the loading states for clever messages
const loadingMessages = [
  "Gathering neighborhood insights...",
  "Connecting the community dots...",
  "Finding helpful information...",
  "Consulting the neighborhood wisdom...",
  "Processing your request...",
];

// Define the neighborhood-specific action items for the input component
const NEIGHBORHOOD_ACTIONS = [
  {
    text: "Events Question",
    icon: Text,
    colors: {
      icon: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-100",
    },
  },
  {
    text: "Skills & Help",
    icon: CheckCheck,
    colors: {
      icon: "text-green-600",
      border: "border-green-500",
      bg: "bg-green-100",
    },
  },
];

/**
 * The main AI Chat component that orchestrates the entire chat experience
 * The outer wrapper div has been removed to flatten the structure
 */
const AIChat = () => {
  // State for messages, loading status
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Get the current user and neighborhood
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();
  
  // Reference for auto-scrolling the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Generate random loading message
  const getRandomLoadingMessage = () => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
  };

  // Handle message submission
  const handleSubmit = async (inputValue: string, actionType?: string) => {
    // Don't send empty messages
    if (inputValue.trim() === '') return;
    
    // Check if user and neighborhood are available
    if (!user || !currentNeighborhood) {
      toast.error("You must be logged in and part of a neighborhood to use the AI assistant");
      return;
    }
    
    // Create a new user message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      content: actionType 
        ? `[${actionType}] ${inputValue}`
        : inputValue,
      role: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state with a random message
    setIsLoading(true);
    setLoadingMessage(getRandomLoadingMessage());
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: inputValue,
          userId: user.id,
          neighborhoodId: currentNeighborhood.id,
          actionType: actionType, // Pass the action type to the edge function
        },
      });
      
      // Handle errors
      if (error) {
        console.error('Error calling anthropic-chat function:', error);
        toast.error('Sorry, something went wrong. Please try again later.');
        return;
      }
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        content: data.response || "Sorry, I couldn't generate a response",
        role: 'assistant',
        timestamp: new Date(),
        // Include empty context to keep TypeScript happy but won't render interactive elements
        context: {}
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      toast.error('Failed to get a response from the AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  // Render the chat interface without the outer wrapping div
  return (
    <>
      {/* Chat header */}
      <AIChatHeader />
      
      {/* Messages area - with direct styling now that the wrapper is gone */}
      <AIChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        loadingMessage={loadingMessage} 
        messagesEndRef={messagesEndRef}
        // Added bg-white class since the wrapper div that had it is now gone
        className="flex-1 overflow-y-auto pt-0 px-4 pb-2 bg-white" 
      />
      
      {/* Input area with suggestions */}
      <div className="border-t border-gray-100 bg-white rounded-b-lg">
        <AIInputWithSuggestions
          actions={NEIGHBORHOOD_ACTIONS}
          placeholder="Ask about your neighborhood..."
          onSubmit={handleSubmit}
          isLoading={isLoading}
          compactMode={true}
        />
      </div>
    </>
  );
};

export default AIChat;
