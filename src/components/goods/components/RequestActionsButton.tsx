
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { GoodsExchangeItem } from "@/types/localTypes";
import { useUser } from "@supabase/auth-helpers-react";
import { createContactEmailLink } from '../GoodsRequestsSection';

/**
 * Component for rendering action buttons (delete/contact) on a goods request card
 */
interface RequestActionsButtonProps {
  request: GoodsExchangeItem;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const RequestActionsButton = ({ 
  request, 
  onDeleteItem, 
  isDeletingItem = false 
}: RequestActionsButtonProps) => {
  const currentUser = useUser();

  if (!currentUser) return null;

  // Show delete button for owner
  if (currentUser.id === request.user_id && onDeleteItem) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDeleteItem(request);
        }}
        disabled={isDeletingItem}
        aria-label="Delete request"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  // Show contact button for other users
  return (
    <Button 
      variant="outline" 
      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white border-0"
      onClick={(e) => {
        e.stopPropagation();
        window.open(createContactEmailLink(request), '_blank');
      }}
    >
      I have this!
    </Button>
  );
};

export default RequestActionsButton;
