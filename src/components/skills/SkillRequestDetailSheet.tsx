import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, HandHeart, User, Clock, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ShareButton from '@/components/ui/share-button';
import { SkillWithProfile, SkillCategory } from './types/skillTypes';
import { createContactEmailLink } from '@/components/goods/utils/contactUtils';

/**
 * SkillRequestDetailSheet - Side panel for viewing detailed skill request information
 * 
 * This component displays detailed information about a skill request including:
 * - Request details and description
 * - Requester profile information  
 * - Action buttons for offering help or managing own requests
 * 
 * Uses green accent colors to match the skills module theme.
 */
interface SkillRequestDetailSheetProps {
  skillRequest: SkillWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (skillRequest: SkillWithProfile) => void;
  onDelete?: (skillRequest: SkillWithProfile) => void;
}

const SkillRequestDetailSheet: React.FC<SkillRequestDetailSheetProps> = ({
  skillRequest,
  open,
  onOpenChange,
  onEdit,
  onDelete
}) => {
  const user = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  // Early return if no skill request is provided
  if (!skillRequest) return null;

  // Check if current user owns this skill request
  const isOwner = user?.id === skillRequest.user_id;

  /**
   * Handle offering help to the requester
   * Creates a mailto link with pre-filled subject and body
   */
  const handleOfferHelp = () => {
    // For now, we'll show a message since we don't have direct email access
    // In a real app, this would integrate with a messaging system
    const requesterName = skillRequest.profiles?.display_name || 'Neighbor';
    toast.success(
      `Great! You can reach out to ${requesterName} to offer help with "${skillRequest.title}". ` +
      `Contact information would be available through the neighborhood messaging system.`
    );
  };

  /**
   * Handle editing the skill request
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(skillRequest);
    }
  };

  /**
   * Handle deleting the skill request with confirmation
   */
  const handleDelete = async () => {
    if (!isOwner) return;
    
    if (!confirm('Are you sure you want to delete this skill request?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', skillRequest.id);

      if (error) throw error;

      toast.success('Skill request deleted successfully');
      onOpenChange(false);
      
      if (onDelete) {
        onDelete(skillRequest);
      }
    } catch (error) {
      console.error('Error deleting skill request:', error);
      toast.error('Failed to delete skill request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Category colors matching the existing system
  const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
    technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
    emergency: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
    professional: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
    maintenance: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
    care: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
    education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'}
  };

  const categoryStyle = categoryColors[skillRequest.skill_category as SkillCategory] || categoryColors.technology;

  // Format the creation date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Skill Request Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Request Header Section with Green Accent */}
          <div 
            className="p-6 rounded-xl border-2 bg-gradient-to-br from-green-50 to-white"
            style={{ borderColor: 'rgb(34, 197, 94, 0.2)' }}
          >
            {/* Request Title and Category */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{skillRequest.title}</h2>
                  <Badge 
                    className={`${categoryStyle.bg} ${categoryStyle.text} text-sm font-medium px-3 py-1`}
                  >
                    {skillRequest.skill_category.charAt(0).toUpperCase() + skillRequest.skill_category.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ShareButton 
                    contentType="skills" 
                    contentId={skillRequest.id} 
                    neighborhoodId={skillRequest.neighborhood_id} 
                    size="sm" 
                    variant="ghost" 
                  />
                </div>
              </div>
              
              {/* Request Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(skillRequest.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requester Profile Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
              <User className="w-5 h-5" />
              Requested by
            </h3>
            
            <div 
              className="rounded-lg border p-4 bg-green-50"
              style={{ borderColor: 'rgb(34, 197, 94, 0.1)' }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={skillRequest.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {skillRequest.profiles?.display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {skillRequest.profiles?.display_name || 'Anonymous Neighbor'}
                    {isOwner && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Request Description */}
          {skillRequest.description && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">What they need help with</h3>
              <div 
                className="p-4 rounded-lg border bg-gray-50"
                style={{ borderColor: 'rgb(34, 197, 94, 0.1)' }}
              >
                <p className="text-gray-700 leading-relaxed">{skillRequest.description}</p>
              </div>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {isOwner ? (
              /* Owner actions - Edit and Delete */
              <div className="flex gap-3">
                <Button 
                  onClick={handleEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isDeleting}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Request
                </Button>
                <Button 
                  onClick={handleDelete}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ) : (
              /* Non-owner action - Offer Help */
              <Button 
                onClick={handleOfferHelp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Offer to Help
              </Button>
            )}
          </div>

          {/* Help Text */}
          {!isOwner && (
            <div className="text-center text-sm text-gray-500 bg-green-50 p-3 rounded-lg border border-green-100">
              <p>
                Click "Offer to Help" to let this neighbor know you can assist them.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SkillRequestDetailSheet;