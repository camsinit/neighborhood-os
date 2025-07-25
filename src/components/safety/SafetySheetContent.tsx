import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, Edit, Trash2, Shield, MapPin, Calendar, User, Mail, Phone } from 'lucide-react';
import SafetyUpdateForm from './SafetyUpdateForm';
import SafetyComments from './SafetyComments';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { moduleThemeColors } from '@/theme/moduleTheme';

interface SafetySheetContentProps {
  update: any;
  onOpenChange: (open: boolean) => void;
}

/**
 * SafetySheetContent Component
 * 
 * Enhanced sheet content for viewing safety updates with sophisticated styling
 * that matches the neighbor directory design patterns
 */
const SafetySheetContent = ({ update, onOpenChange }: SafetySheetContentProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Safety theme colors for consistency
  const safetyTheme = moduleThemeColors.safety;
  
  /**
   * Handle delete functionality with proper error handling
   */
  const handleDelete = async () => {
    if (!user || user.id !== update.user_id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('safety_updates')
        .delete()
        .eq('id', update.id);

      if (error) throw error;

      toast({
        title: "Update deleted",
        description: "The safety update has been removed.",
      });

      // Invalidate queries and close sheet
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting safety update:', error);
      toast({
        title: "Error",
        description: "Failed to delete the safety update. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Format time ago in simplified format (2hr, 5d, etc.)
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}hr`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
  };

  /**
   * Get safety type configuration for consistent theming
   */
  const getSafetyTypeConfig = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'alert':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Alert'
        };
      case 'maintenance':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Clock,
          label: 'Maintenance'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Shield,
          label: 'Observation'
        };
    }
  };

  const typeConfig = getSafetyTypeConfig(update.type);
  const TypeIcon = typeConfig.icon;
  const isCurrentUser = user?.id === update.user_id;

  /**
   * Render edit mode form
   */
  if (isEditMode) {
    return (
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Safety Update</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="flex-1 p-6">
            <SafetyUpdateForm 
              updateId={update.id}
              existingData={{
                title: update.title,
                description: update.description,
                type: update.type,
                imageUrl: update.image_url
              }}
              onSuccess={() => {
                setIsEditMode(false);
                queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
                toast({
                  title: "Update saved",
                  description: "Your safety update has been updated successfully."
                });
              }}
            />
          </div>
        </div>
      </SheetContent>
    );
  }

  /**
   * Main view mode with enhanced styling matching neighbor directory
   */
  return (
    <SheetContent side="right" className="w-full sm:max-w-lg p-0">
      <div className="h-full flex flex-col">
        {/* Enhanced header section with gradient background - matches neighbor directory pattern */}
        <div 
          className="relative p-6 border-b"
          style={{
            background: `linear-gradient(135deg, ${safetyTheme.primary}08 0%, ${safetyTheme.primary}03 50%, white 100%)`
          }}
        >
          {/* Enhanced author section with comprehensive neighbor information */}
          <div 
            className="p-6 rounded-xl border-2"
            style={{
              background: `linear-gradient(135deg, ${safetyTheme.primary}08 0%, ${safetyTheme.primary}03 50%, white 100%)`,
              borderColor: `${safetyTheme.primary}20`
            }}
          >
            {/* Title and Action buttons row */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-bold text-gray-900 leading-tight flex-1">
                {update.title}
              </h1>
              
              {/* Action buttons for owner */}
              {user?.id === update.user_id && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    className="text-gray-600 hover:text-gray-800 h-8 px-3"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 h-8 px-3"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>

            {/* Badge underneath title */}
            <div className="mb-4">
              <Badge 
                variant="outline" 
                className="bg-red-100 text-red-800 border-red-200 font-medium border"
              >
                <TypeIcon className="w-3 h-3 mr-1.5" />
                {typeConfig.label}
              </Badge>
            </div>

            {/* Compact Author Info Layout */}
            <div className="flex items-start gap-4">
              {/* Smaller Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage src={update.profiles?.avatar_url || ''} />
                    <AvatarFallback 
                      className="text-sm"
                      style={{ backgroundColor: `${safetyTheme.primary}15`, color: safetyTheme.primary }}
                    >
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {/* Safety indicator dot - smaller */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center"
                    style={{ backgroundColor: safetyTheme.primary }}
                  >
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>

              {/* Compact Info Section */}
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  {/* Name, You badge, and Timestamp in one row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">
                        {update.profiles?.display_name || 'Anonymous'}
                      </h3>
                      {isCurrentUser && (
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${safetyTheme.primary}15`, 
                            color: safetyTheme.primary 
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    
                    {/* Timestamp - top right */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatTimeAgo(new Date(update.created_at))}</span>
                    </div>
                  </div>
                  
                  {/* Location metadata - simplified */}
                  {update.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600 truncate">{update.location}</span>
                    </div>
                  )}

                  {/* Contact Information - Show if neighbor has made it visible */}
                  {(update.profiles?.email_visible || update.profiles?.phone_visible || update.profiles?.address_visible) && (
                    <div className="space-y-2">
                      {/* Email if visible */}
                      {update.profiles?.email_visible && update.profiles?.email && (
                        <div 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ 
                            backgroundColor: `${safetyTheme.primary}05`, 
                            color: safetyTheme.primary 
                          }}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{update.profiles.email}</span>
                        </div>
                      )}
                      
                      {/* Phone if visible */}
                      {update.profiles?.phone_visible && update.profiles?.phone_number && (
                        <div 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ 
                            backgroundColor: `${safetyTheme.primary}05`, 
                            color: safetyTheme.primary 
                          }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{update.profiles.phone_number}</span>
                        </div>
                      )}

                      {/* Address if visible */}
                      {update.profiles?.address_visible && update.profiles?.address && (
                        <div 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ 
                            backgroundColor: `${safetyTheme.primary}05`, 
                            color: safetyTheme.primary 
                          }}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{update.profiles.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Years lived here - prominent safety badge */}
                  {update.profiles?.years_lived_here && (
                    <div 
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit"
                      style={{ 
                        backgroundColor: safetyTheme.primary, 
                        color: 'white' 
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      {update.profiles.years_lived_here} {update.profiles.years_lived_here === 1 ? 'year' : 'years'} in neighborhood
                    </div>
                  )}

                  {/* Description section integrated into author card */}
                  {update.description && (
                    <div className="mt-4 space-y-2">
                      
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                        {update.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section with improved styling */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6 space-y-6">

            {/* Image section */}
            {update.image_url && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div 
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: safetyTheme.primary }}
                  />
                  Photo
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={update.image_url}
                    alt="Safety update"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              </div>
            )}

            

            {/* Comments section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div 
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: safetyTheme.primary }}
                />
                Discussion
              </h3>
              <SafetyComments safetyUpdateId={update.id} />
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
};

export default SafetySheetContent;
