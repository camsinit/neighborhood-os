
/**
 * AIPromptSuggestions Component
 * 
 * This component displays pre-made prompt suggestions that users can click on
 * to quickly start conversations with the AI assistant.
 * Enhanced with more neighborhood-relevant suggestions.
 */
import { Button } from "@/components/ui/button";

interface AIPromptSuggestionsProps {
  onPromptClick: (prompt: string) => void;
}

const AIPromptSuggestions = ({ onPromptClick }: AIPromptSuggestionsProps) => {
  // Define the pre-made prompts - more relevant to neighborhood context
  const prompts = [
    "What events are happening this week?",
    "Is anyone offering gardening help?",
    "Are there any safety updates I should know about?",
    "What skills are neighbors sharing?",
    "How can I help my neighbors today?",
    "Are there any community gatherings soon?"
  ];
  
  return (
    <div className="px-4 py-3 border-t bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIPromptSuggestions;
