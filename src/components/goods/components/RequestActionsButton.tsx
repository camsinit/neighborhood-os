
import { MoreVertical, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoodsExchangeItem } from "@/types/localTypes";
import { useUser } from "@supabase/auth-helpers-react";

interface RequestActionsButtonProps {
  request: GoodsExchangeItem;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onEdit?: () => void;
}

const RequestActionsButton = ({
  request,
  onDeleteItem,
  isDeletingItem = false,
  onEdit
}: RequestActionsButtonProps) => {
  const user = useUser();
  const isOwner = user?.id === request.user_id;

  if (!isOwner) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {onDeleteItem && (
          <DropdownMenuItem
            className="text-red-600"
            disabled={isDeletingItem}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(request);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RequestActionsButton;
