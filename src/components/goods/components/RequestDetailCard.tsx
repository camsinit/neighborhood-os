
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import { createContactEmailLink } from '../GoodsRequestsSection';

interface RequestDetailCardProps {
  request: GoodsExchangeItem;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onEdit?: () => void;
}

/**
 * RequestDetailCard - Shows detailed information about a goods item in a card
 * including title, description, owner, and action buttons based on user permissions
 */
const RequestDetailCard = ({
  request,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem,
  onEdit
}: RequestDetailCardProps) => {
  // Get current user to check item ownership
  const currentUser = useUser();
  const isOwner = currentUser && currentUser.id === request.user_id;
  
  return (
    <Card className="border-0 shadow-none relative">
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
        
        <div className="flex gap-2 mt-4">
          {isOwner ? (
            <>
              {onEdit && (
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  Edit
                </Button>
              )}
              {onDeleteItem && (
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(request);
                  }}
                  disabled={isDeletingItem}
                >
                  Delete
                </Button>
              )}
            </>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(createContactEmailLink(request), '_blank');
              }}
            >
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestDetailCard;
