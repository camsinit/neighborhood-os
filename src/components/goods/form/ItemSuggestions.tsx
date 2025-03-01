
// This component displays quick suggestions based on selected category
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

// Import suggestions from constants
import { GOODS_SUGGESTIONS } from "../utils/goodsConstants";

// Component props definition
interface ItemSuggestionsProps {
  category: GoodsItemCategory;
  onSelectSuggestion: (suggestion: string) => void;
}

/**
 * ItemSuggestions component
 * 
 * Displays a grid of quick suggestion buttons based on the selected category.
 * When a suggestion is clicked, it updates the title field in the parent form.
 */
const ItemSuggestions = ({ category, onSelectSuggestion }: ItemSuggestionsProps) => {
  // Only render if we have suggestions for the selected category
  if (!GOODS_SUGGESTIONS[category]?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Quick Suggestions</Label>
      <div className="flex flex-wrap gap-2">
        {/* Map through available suggestions for the selected category */}
        {GOODS_SUGGESTIONS[category].map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-xs"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ItemSuggestions;
