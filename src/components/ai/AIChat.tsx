
/**
 * AIChat Component
 * 
 * This is the main container component for the AI chat interface on the homepage.
 * It manages the chat state, handles message submission, and displays the chat history.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import AIMessage from './AIMessage';
import AIPromptSuggestions from './AIPromptSuggestions';

// Define the message type for type safety
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

// Define the loading states for clever messages
const loadingMessages = [
  "Gathering neighborhood insights...",
  "Connecting the community dots...",
  "Finding helpful information...",
  "Consulting the neighborhood wisdom...",
  "Processing your request...",
];

const AIChat = () => {
  // State for messages, input, and loading status
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setInputValue('');
    
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
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        content: data.response || "Sorry, I couldn't generate a response",
        role: 'assistant',
        timestamp: new Date(),
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
    setInputValue(prompt);
    // Focus the input after setting the value
    const inputElement = document.getElementById('ai-chat-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Neighborhood Assistant</h2>
        <p className="text-sm text-gray-500">Ask questions about your neighborhood</p>
      </div>
      
      {/* Messages area */}
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
      
      {/* Prompt suggestions */}
      <AIPromptSuggestions onPromptClick={handlePromptClick} />
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex items-center">
        <input
          id="ai-chat-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-l-md border border-r-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="rounded-l-none"
          disabled={isLoading || inputValue.trim() === ''}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default AIChat;
