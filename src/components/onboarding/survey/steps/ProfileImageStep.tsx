import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Upload, X, Crop } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { ImageCropDialog } from "./profile/ImageCropDialog";

/**
 * Profile Image Step Component
 * 
 * Allows users to select a profile photo for onboarding.
 * Profile image is now REQUIRED for onboarding completion.
 * Captures the file for later upload during form submission.
 */

interface ProfileImageStepProps {
  // Called when the user picks/crops a new image so the parent can store it
  onImageChange?: (file: File | null) => void;
  // If we already have an image URL (e.g., from OAuth), use it as a fallback
  initialImageUrl?: string;
  // NEW: pass the currently selected/cropped file from the parent so when the
  // user navigates Back/Next and returns, we can rehydrate the preview.
  existingFile?: File | null;
}
export const ProfileImageStep = ({
  onImageChange,
  initialImageUrl,
  existingFile
}: ProfileImageStepProps) => {
  const user = useUser();
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);

  // Handle file selection - opens crop dialog
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

    // Clear existing image states before setting new image
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCroppedImage(null);

    // Store original image and open crop dialog
    setOriginalImage(file);
    setShowCropDialog(true);

    // Clear the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  // Handle crop completion
  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedImage(croppedBlob);

    // Create preview URL from cropped image
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);

    // Convert blob to file for parent component
    const croppedFile = new File([croppedBlob], originalImage?.name || 'cropped-image.jpg', {
      type: 'image/jpeg'
    });

    // Notify parent component
    onImageChange?.(croppedFile);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalImage(null);
    setCroppedImage(null);
    onImageChange?.(null);
  };

  // Handle re-cropping existing image
  const handleRecrop = () => {
    if (originalImage) {
      setShowCropDialog(true);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setOriginalImage(file);
      setShowCropDialog(true);
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // When the step mounts (or when props change), rebuild the preview from
  // any existing file stored in the parent, or fall back to initialImageUrl
  // (e.g., from OAuth). This ensures the image persists when navigating Back.
  useEffect(() => {
    let createdUrl: string | null = null;

    if (!previewUrl && existingFile) {
      createdUrl = URL.createObjectURL(existingFile);
      setPreviewUrl(createdUrl);
      // Mark as "has an image" so we show the Crop/Change controls
      setCroppedImage(existingFile);
    } else if (!previewUrl && !existingFile && initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    }

    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [existingFile, initialImageUrl]);

  return <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Add a Profile Photo </h3>
        <p className="text-sm text-muted-foreground px-[42px]">Please use a photo with your face in it so your neighbors can put a face to the name.</p>
      </div>

      {/* Image upload area */}
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar display */}
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || initialImageUrl || user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || <UserCircle className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          
          {/* Remove button for selected image */}
          {croppedImage && <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
              <X className="h-3 w-3" />
            </button>}
        </div>

        {/* Upload controls */}
        <div className="w-full max-w-sm">
          {!croppedImage ? <>
              {/* File input */}
              <input type="file" id="profile-image" accept="image/*" onChange={handleFileSelect} className="hidden" />
              
              {/* Drag and drop area - now clickable */}
              <label htmlFor="profile-image">
                <div onDrop={handleDrop} onDragOver={handleDragOver} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click here or drag and drop an image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB
                  </p>
                </div>
              </label>
            </> : <div className="text-center space-y-3">


              
              <div className="flex gap-2 justify-center">
                {/* Re-crop button */}
                <Button variant="outline" size="sm" onClick={handleRecrop}>
                  <Crop className="mr-2 h-4 w-4" />
                  Crop
                </Button>
                
                {/* Change photo button */}
                <label htmlFor="profile-image-change">
                  <Button variant="outline" asChild size="sm">
                    <span className="cursor-pointer">
                      Change Photo
                    </span>
                  </Button>
                </label>
              </div>
              
              <input type="file" id="profile-image-change" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>}
        </div>

        {/* Required indicator */}
        <div className="text-center">
          <p className="text-xs text-red-500">Profile photo is required to complete onboarding</p>
        </div>
      </div>

      {/* Image Crop Dialog */}
      {originalImage && <ImageCropDialog open={showCropDialog} onOpenChange={setShowCropDialog} imageFile={originalImage} onCropComplete={handleCropComplete} />}
    </div>;
};