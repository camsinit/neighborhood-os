
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { GoodsExchangeItem } from "@/types/localTypes";
import { createContactEmailLink } from '../GoodsRequestsSection';

interface RequestDetailCardProps {
  request: GoodsExchangeItem;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

/**
 * Shows the full details of a request in the popover
 */
const RequestDetailCard = ({
  request,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem
}: RequestDetailCardProps) => {
  const currentUser = useUser();
  
  return (
    <Card className="border-0 shadow-none relative">
      {currentUser && currentUser.id === request.user_id && onDeleteItem && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8"
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
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          {request.urgency && (
            <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full ml-2 inline-block`}>
              {getUrgencyLabel(request.urgency)}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p>{request.description}</p>
        
        <div className="mt-4">
          <h5 className="text-sm font-semibold mb-1">Posted by:</h5>
          {request.user_id ? (
            <Link 
              to={`/neighbors?user=${request.user_id}`}
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {request.profiles?.display_name || "Anonymous"}
            </Link>
          ) : (
            <span className="text-sm">{request.profiles?.display_name || "Anonymous"}</span>
          )}
        </div>
        
        <Button 
          variant="default" 
          size="sm"
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            window.open(createContactEmailLink(request), '_blank');
          }}
        >
          I have this!
        </Button>
      </CardContent>
    </Card>
  );
};

export default RequestDetailCard;
