import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MapPin, Package, MessageSquare, Edit, Trash, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { GoodsExchangeItem } from '@/types/localTypes';
import ShareButton from "@/components/ui/share-button";
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

  return (
    <>
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{isEditing ? "Edit Item" : item.title}</span>
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
        </SheetTitle>
      </SheetHeader>

      {isEditing ? (
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
      ) : (
        <div className="animate-fade-in">
          {/* Hero Section - Image and Main Info */}
          <div className="relative">
            {/* Main Image Display */}
            {((item.images && item.images.length > 0) || item.image_url) && (
              <div className="relative mb-6">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
                
                {/* Overlay Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge 
                    variant={item.request_type === 'offer' ? 'default' : 'secondary'}
                    className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 shadow-sm"
                  >
                    {item.request_type === 'offer' ? 'Available' : 'Needed'}
                  </Badge>
                  {item.urgency && (
                    <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text} bg-opacity-90 backdrop-blur-sm shadow-sm`}>
                      {item.urgency === 'high' ? 'Urgent' : item.urgency}
                    </Badge>
                  )}
                </div>

                {/* Category Badge */}
                {item.goods_category && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm">
                      {item.goods_category}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Status Badges for items without images */}
            {!item.images?.length && !item.image_url && (
              <div className="flex gap-2 flex-wrap mb-6">
                <Badge variant={item.request_type === 'offer' ? 'default' : 'secondary'}>
                  {item.request_type === 'offer' ? 'Available' : 'Needed'}
                </Badge>
                {item.urgency && (
                  <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text}`}>
                    {item.urgency === 'high' ? 'Urgent' : item.urgency}
                  </Badge>
                )}
                {item.goods_category && (
                  <Badge variant="outline">
                    {item.goods_category}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Provider Card - Enhanced Design */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/60 rounded-2xl p-4 hover-scale transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
                    <AvatarImage src={item.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator placeholder */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {item.profiles?.display_name || 'Anonymous'}
                        {isOwner && <span className="text-sm text-gray-500 font-normal ml-2">(You)</span>}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Package className="h-3 w-3" />
                        {item.request_type === 'offer' ? 'Offering this item' : 'Looking for this item'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Contact Information - Enhanced */}
                  {!isOwner && (
                    <div className="mt-3 space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const contactInfo = document.getElementById(`contact-info-${item.id}`);
                          if (contactInfo) {
                            contactInfo.classList.toggle('hidden');
                            contactInfo.classList.toggle('animate-fade-in');
                          }
                        }}
                        className="text-xs bg-white hover:bg-gray-50 border-gray-300"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Show Contact Info
                      </Button>
                      
                      <div id={`contact-info-${item.id}`} className="hidden bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <span>📬</span> Contact for pickup:
                        </h5>
                        <div className="space-y-1">
                          {(item.profiles as any)?.phone_visible && (item.profiles as any)?.phone_number && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              <span>📞</span>
                              <span className="font-mono">{(item.profiles as any).phone_number}</span>
                            </div>
                          )}
                          {(item.profiles as any)?.email_visible && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              <span>✉️</span>
                              <span>Contact through platform</span>
                            </div>
                          )}
                          {(item.profiles as any)?.address_visible && (item.profiles as any)?.address && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              <span>📍</span>
                              <span>{(item.profiles as any).address}</span>
                            </div>
                          )}
                          {(!(item.profiles as any)?.phone_visible || !(item.profiles as any)?.phone_number) && 
                           !(item.profiles as any)?.email_visible && 
                           (!(item.profiles as any)?.address_visible || !(item.profiles as any)?.address) && (
                            <div className="text-xs text-gray-500 italic bg-yellow-50 rounded px-2 py-1 border border-yellow-200">
                              Contact information not publicly available. Consider reaching out through the neighborhood network.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            {item.description && (
              <div className="bg-white border border-gray-200/60 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                  {item.description}
                </p>
                
                {/* Timeline Information integrated */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-base mb-4 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Posted</p>
                        <p className="text-gray-600">{format(new Date(item.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Available until</p>
                        <p className="text-gray-600">{format(new Date(item.valid_until), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact CTA - Enhanced */}
            {!isOwner && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-lg">
                    Interested in this {item.request_type === 'offer' ? 'item' : 'request'}?
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Connect with {item.profiles?.display_name || 'the owner'} to arrange pickup or discuss details
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 shadow-lg hover-scale"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact {item.profiles?.display_name || 'Owner'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SheetContent>

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