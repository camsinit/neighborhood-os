
/**
 * AIPromptSuggestions Component
 * 
 * This component displays pre-made prompt suggestions that users can click on
 * to quickly start conversations with the AI assistant.
 */
import { Button } from "@/components/ui/button";

interface AIPromptSuggestionsProps {
  onPromptClick: (prompt: string) => void;
}

const AIPromptSuggestions = ({ onPromptClick }: AIPromptSuggestionsProps) => {
  // Define the pre-made prompts
  const prompts = [
    "What's happening in my neighborhood today?",
    "Anything I can do to be helpful to a neighbor today?",
    "I need help finding a skill"
  ];
  
  return (
    <div className="px-4 py-3 border-t bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
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
