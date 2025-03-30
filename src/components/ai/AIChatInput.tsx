
/**
 * AIChatInput Component
 * 
 * This component renders the input area of the AI chat interface.
 */
import React, { useState } from 'react';
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIChatInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
}

/**
 * Input component for the AI chat interface
 */
const AIChatInput = ({ onSubmit, isLoading }: AIChatInputProps) => {
  const [inputValue, setInputValue] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputValue);
    setInputValue('');
  };

  return (
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
  );
};

export default AIChatInput;
