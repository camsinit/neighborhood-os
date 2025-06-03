
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Simplified skill card component that shows contact info when user expresses interest
 * Similar to goods exchange but for skills
 */
interface SimpleSkillCardProps {
  id: string;
  title: string;
  description?: string;
  skillCategory: string;
  requestType: 'offer' | 'need';
  userName: string;
  userAvatar?: string;
  createdAt: string;
  showContactInfo?: boolean;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  onShowInterest?: () => void;
  onHideContact?: () => void;
  isOwnSkill?: boolean;
}

const SimpleSkillCard: React.FC<SimpleSkillCardProps> = ({
  id,
  title,
  description,
  skillCategory,
  requestType,
  userName,
  userAvatar,
  createdAt,
  showContactInfo = false,
  contactInfo,
  onShowInterest,
  onHideContact,
  isOwnSkill = false
}) => {
  // Format the created date for display
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  
  // Color scheme based on request type
  const cardClass = requestType === 'offer' 
    ? 'border-green-200 bg-green-50/50' 
    : 'border-blue-200 bg-blue-50/50';
    
  const badgeVariant = requestType === 'offer' ? 'default' : 'secondary';

  return (
    <Card className={`${cardClass} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userName}</span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <Badge variant={badgeVariant} className="ml-2 shrink-0">
            {requestType === 'offer' ? 'Offering' : 'Looking for'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {description}
          </p>
        )}
        
        {/* Category */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {skillCategory}
          </Badge>
        </div>
        
        {/* Contact Information - shown when user expresses interest */}
        {showContactInfo && contactInfo && (
          <div className="bg-white/80 border border-gray-200 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm">
              {contactInfo.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Email:</span>
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="text-gray-600">{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!isOwnSkill && (
            <>
              {!showContactInfo ? (
                <Button 
                  onClick={onShowInterest}
                  className="flex-1"
                  variant={requestType === 'offer' ? 'default' : 'outline'}
                >
                  {requestType === 'offer' ? 'Get Contact Info' : 'I Can Help'}
                </Button>
              ) : (
                <Button 
                  onClick={onHideContact}
                  variant="outline"
                  className="flex-1"
                >
                  Hide Contact Info
                </Button>
              )}
            </>
          )}
          
          {isOwnSkill && (
            <Badge variant="outline" className="text-xs self-start">
              Your {requestType === 'offer' ? 'Skill Offer' : 'Skill Request'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleSkillCard;
