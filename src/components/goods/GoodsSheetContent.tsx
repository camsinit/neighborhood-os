import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MapPin, Package, MessageSquare, Edit, Trash, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { GoodsExchangeItem } from '@/types/localTypes';
import ShareButton from "@/components/ui/share-button";
import { 
  EnhancedSheetContent, 
  ProfileCard, 
  SectionHeader, 
  ContentSection 
} from "@/components/ui/enhanced-sheet-content";
import { useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import GoodsForm from './GoodsForm';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContactMethodDisplay } from './components/ContactMethodDisplay';

/**
 * GoodsSheetContent - Side panel component for displaying detailed goods item information
 * 
 * This component shows comprehensive details about a goods exchange item including:
 * - Item details (title, description, category, urgency)
 * - Provider/requester information with avatar
 * - Contact actions and sharing functionality
 * - Date information and validity period
 */
interface GoodsSheetContentProps {
  item: GoodsExchangeItem;
  onOpenChange?: (open: boolean) => void;
}

const GoodsSheetContent = ({ item, onOpenChange }: GoodsSheetContentProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const isOwner = user?.id === item.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Track whether contact info is revealed
  const [isContactRevealed, setIsContactRevealed] = useState(false);

  // Handle contact button click
  const handleContactClick = () => {
    setIsContactRevealed(!isContactRevealed);
  };

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Close the sheet first
      handleSheetClose();
      
      // Add a small delay to ensure sheet animation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await supabase
        .from('goods_exchange')
        .delete()
        .eq('id', item.id);
        
      if (error) throw error;
      toast.success("Item deleted successfully");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
      
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete item: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditing(false);
    // Refresh the data
    queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
    toast.success("Item updated successfully");
  };

  // Get urgency styling
  const getUrgencyStyle = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const urgencyStyle = getUrgencyStyle(item.urgency);

  // Prepare metadata for ProfileCard
  const itemMetadata = [
    {
      icon: Calendar,
      text: format(new Date(item.created_at), 'MMM d, yyyy'),
      prominent: false
    },
    {
      icon: Package,
      text: item.request_type === 'offer' ? 'Available' : 'Needed',
      prominent: true
    }
  ];

  // Prepare badges for the item
  const itemBadges = [
    ...(item.goods_category ? [{
      text: item.goods_category.charAt(0).toUpperCase() + item.goods_category.slice(1),
      variant: 'secondary' as const
    }] : []),
    ...(item.urgency ? [{
      text: item.urgency === 'high' ? 'Urgent' : item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1),
      variant: 'outline' as const
    }] : [])
  ];

  // Prepare actions for the ProfileCard
  const itemActions = (
    <div className="flex items-center gap-2">
      {!isEditing && (
        <ShareButton
          contentType="goods"
          contentId={item.id}
          neighborhoodId={item.neighborhood_id}
          size="sm"
          variant="ghost"
        />
      )}
      {isOwner && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-foreground"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      )}
    </div>
  );

  return (
    <>
    {isEditing ? (
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold flex justify-between items-start">
            <span>Edit Item</span>
            {itemActions}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <GoodsForm 
            onSuccess={handleEditSuccess}
            initialData={item}
            mode="edit"
          />
          {/* Delete button in edit mode */}
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Item
            </Button>
          </div>
        </div>
      </SheetContent>
    ) : (
      <EnhancedSheetContent moduleTheme="goods">
        {/* Enhanced Item Header using standardized ProfileCard */}
        <ProfileCard
          name={item.title}
          avatarUrl={item.profiles?.avatar_url || undefined}
          isCurrentUser={isOwner}
          badges={itemBadges}
          metadata={itemMetadata}
          moduleTheme="goods"
        >
          {/* Item actions in the profile area */}
          {itemActions}
        </ProfileCard>

        {/* Images Section */}
        {((item.images && item.images.length > 0) || item.image_url) && (
          <div>
            <SectionHeader
              title="Photos"
              icon={Package}
              moduleTheme="goods"
            />
            <ContentSection moduleTheme="goods">
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </ContentSection>
          </div>
        )}

        {/* Provider Information */}
        <div>
          <SectionHeader
            title={`${item.request_type === 'offer' ? 'Provider' : 'Requester'} Information`}
            icon={User}
            moduleTheme="goods"
          />
          <ContentSection moduleTheme="goods">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={item.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {item.profiles?.display_name || 'Anonymous'}
                  {isOwner && <span className="text-sm text-gray-500 font-normal ml-2">(You)</span>}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Package className="h-3 w-3" />
                  {item.request_type === 'offer' ? 'Offering this item' : 'Looking for this item'}
                </p>
                
                {/* Contact Information */}
                {!isOwner && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleContactClick}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {isContactRevealed ? 'Hide Contact' : 'Show Contact Info'}
                    </Button>
                    
                    {/* Contact info display */}
                    <div className="mt-2">
                      <ContactMethodDisplay 
                        item={item} 
                        isRevealed={isContactRevealed} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ContentSection>
        </div>

        {/* Description and Timeline */}
        {item.description && (
          <div>
            <SectionHeader
              title="Description"
              icon={MessageSquare}
              moduleTheme="goods"
            />
            <ContentSection moduleTheme="goods">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                {item.description}
              </p>
              
              {/* Timeline Information */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-base mb-3 text-gray-900">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="font-medium">Posted:</span>
                      <span className="text-gray-600 ml-1">{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="font-medium">Available until:</span>
                      <span className="text-gray-600 ml-1">{format(new Date(item.valid_until), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ContentSection>
          </div>
        )}
      </EnhancedSheetContent>
    )}

    {/* Delete confirmation dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this item. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmedDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default GoodsSheetContent;