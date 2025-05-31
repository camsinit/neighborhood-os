
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Upload, X } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * Profile Image Step Component
 * 
 * Allows users to select a profile photo for onboarding.
 * Profile image is now REQUIRED for onboarding completion.
 * Captures the file for later upload during form submission.
 */

interface ProfileImageStepProps {
  onImageChange?: (file: File | null) => void;
}

export const ProfileImageStep = ({ onImageChange }: ProfileImageStepProps) => {
  const user = useUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedImage(file);
    
    // Notify parent component
    onImageChange?.(file);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedImage(null);
    onImageChange?.(null);
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedImage(file);
      onImageChange?.(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Add a Profile Photo *</h3>
        <p className="text-sm text-muted-foreground">
          A profile photo is required to help neighbors recognize you and build community trust.
        </p>
      </div>

      {/* Image upload area */}
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar display */}
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || <UserCircle className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          
          {/* Remove button for selected image */}
          {selectedImage && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Upload controls */}
        <div className="w-full max-w-sm">
          {!selectedImage ? (
            <>
              {/* File input */}
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Upload button */}
              <label htmlFor="profile-image">
                <Button asChild className="w-full">
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Photo
                  </span>
                </Button>
              </label>

              {/* Drag and drop area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Or drag and drop an image here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5MB
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-green-600">
                ✓ Photo selected: {selectedImage.name}
              </p>
              <p className="text-xs text-gray-500">
                This will be uploaded when you complete the survey
              </p>
              
              {/* Change photo button */}
              <label htmlFor="profile-image">
                <Button variant="outline" asChild size="sm">
                  <span className="cursor-pointer">
                    Change Photo
                  </span>
                </Button>
              </label>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Required indicator */}
        <div className="text-center">
          <p className="text-xs text-red-500">
            * Profile photo is required to complete onboarding
          </p>
        </div>
      </div>
    </div>
  );
};
