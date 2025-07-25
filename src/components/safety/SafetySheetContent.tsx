
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, Edit, Trash2, Shield, MapPin, Calendar } from 'lucide-react';
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
              update={update}
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
   * Main view mode with enhanced styling
   */
  return (
    <SheetContent side="right" className="w-full sm:max-w-lg p-0">
      <div className="h-full flex flex-col">
        {/* Enhanced header section with gradient background */}
        <div 
          className="relative p-6 border-b"
          style={{
            background: `linear-gradient(135deg, ${safetyTheme.primary}08 0%, ${safetyTheme.primary}03 50%, white 100%)`
          }}
        >
          {/* Top actions bar */}
          <div className="flex items-center justify-between mb-4">
            <Badge 
              variant="outline" 
              className={`${typeConfig.color} font-medium border`}
            >
              <TypeIcon className="w-3 h-3 mr-1.5" />
              {typeConfig.label}
            </Badge>
            
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

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {update.title}
          </h1>

          {/* Enhanced author section with themed styling */}
          <div 
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{
              backgroundColor: `${safetyTheme.primary}05`,
              borderColor: `${safetyTheme.primary}20`
            }}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage 
                  src={update.profiles?.avatar_url || ''} 
                  alt={update.profiles?.display_name || 'User'} 
                />
                <AvatarFallback 
                  className="text-sm font-semibold"
                  style={{ backgroundColor: `${safetyTheme.primary}15`, color: safetyTheme.primary }}
                >
                  {(update.profiles?.display_name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Safety indicator dot */}
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: safetyTheme.primary }}
              >
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {update.profiles?.display_name || 'Anonymous'}
                </h3>
                <span 
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${safetyTheme.primary}15`, 
                    color: safetyTheme.primary 
                  }}
                >
                  Safety Reporter
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDistanceToNow(new Date(update.created_at))} ago</span>
                </div>
                {update.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{update.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content section with improved styling */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description section */}
            {update.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div 
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: safetyTheme.primary }}
                  />
                  Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {update.description}
                  </p>
                </div>
              </div>
            )}

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

            <Separator className="my-6" />

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
