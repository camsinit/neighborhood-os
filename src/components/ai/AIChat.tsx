
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
import AIChatInput from './AIChatInput';
import AIChatHeader from './AIChatHeader';
import AIPromptSuggestions from './AIPromptSuggestions';

// Define the message type for type safety
export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  // Add context for interactive elements
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

/**
 * The main AI Chat component that orchestrates the entire chat experience
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
  const handleSubmit = async (inputValue: string) => {
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
      content: inputValue,
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
        },
      });
      
      // Handle errors
      if (error) {
        console.error('Error calling anthropic-chat function:', error);
        toast.error('Sorry, something went wrong. Please try again later.');
        return;
      }
      
      // Add AI response to chat with context
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        content: data.response || "Sorry, I couldn't generate a response",
        role: 'assistant',
        timestamp: new Date(),
        context: data.context // Include the context for interactive elements
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      toast.error('Failed to get a response from the AI assistant');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle clicking on a pre-made prompt
  const handlePromptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat header */}
      <AIChatHeader />
      
      {/* Messages area */}
      <AIChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        loadingMessage={loadingMessage} 
        messagesEndRef={messagesEndRef} 
      />
      
      {/* Prompt suggestions */}
      <AIPromptSuggestions onPromptClick={handlePromptClick} />
      
      {/* Input area */}
      <AIChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default AIChat;
