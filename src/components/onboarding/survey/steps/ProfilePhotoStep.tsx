
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, UserCircle, X } from 'lucide-react';

interface ProfilePhotoStepProps {
  onPhotoChange: (file: File | null) => void;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
}

/**
 * ProfilePhotoStep component
 * 
 * This component allows users to upload a profile photo during onboarding.
 * It shows a preview of the selected photo and provides options to select,
 * remove, or skip adding a photo.
 */
export const ProfilePhotoStep = ({ 
  onPhotoChange, 
  photoUrl, 
  setPhotoUrl 
}: ProfilePhotoStepProps) => {
  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image under 5MB.");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file.");
      return;
    }
    
    // Set the file and create a preview URL
    onPhotoChange(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
  };
  
  // Handle removing the selected photo
  const handleRemovePhoto = () => {
    onPhotoChange(null);
    setPhotoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Open the file selector
  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };
  
  // Prepare the initials for the avatar fallback
  const getInitials = () => "?";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Avatar with preview or placeholder */}
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="text-4xl bg-primary/10">
              <UserCircle className="h-16 w-16 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          {/* Remove button (only shown when photo is selected) */}
          {photoUrl && (
            <button
              className="absolute top-0 right-0 bg-destructive rounded-full p-1"
              onClick={handleRemovePhoto}
              type="button"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
        
        {/* Upload button */}
        <Button 
          type="button" 
          variant="outline"
          onClick={handleSelectPhoto}
          className="flex gap-2"
        >
          <Camera className="h-4 w-4" />
          {photoUrl ? "Change Photo" : "Upload Photo"}
        </Button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload profile photo"
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Adding a photo helps neighbors recognize you and builds community trust.
        </p>
        <p className="text-xs text-muted-foreground text-center">
          You can skip this step and add a photo later in your profile settings.
        </p>
      </div>
    </div>
  );
};
