
import { useState, useRef, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Crop, PixelCrop } from 'react-image-crop';
import { ImageUploadButton } from "./ImageUploadButton";
import { ImageCropDialog } from "./ImageCropDialog";
import { getCroppedImg } from "@/utils/cropUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

export const ProfileImageUpload = () => {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [finalCrop, setFinalCrop] = useState<PixelCrop | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    processImageFile(file);
  };
  
  // Process image file for preview and cropping
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    try {
      if (!imgRef.current || !selectedImage || !user || !finalCrop) return;
      
      setUploading(true);
      const croppedImageBlob = await getCroppedImg(imgRef.current, finalCrop);
      
      const filePath = `${user.id}-${Math.random()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      
      // Invalidate and refetch all queries that might contain the user's avatar
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      await queryClient.invalidateQueries({ queryKey: ['support-requests'] });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setCropDialogOpen(false);
      setSelectedImage(null);
      setFinalCrop(null);
    }
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setFinalCrop(crop);
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the main drop area
    // and not just moving between its children
    if (e.currentTarget === dropAreaRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      // Check if the cursor is outside the drop area
      if (
        x < rect.left ||
        x >= rect.right ||
        y < rect.top ||
        y >= rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Get the files from the drop event
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Check if the first file is an image
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please drop an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Process the dropped image
    processImageFile(file);
  };

  return (
    <>
      <div 
        ref={dropAreaRef}
        className={`p-6 rounded-md transition-colors ${
          isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-70 rounded-md z-10">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-blue-500" />
              <p className="mt-2 text-sm font-medium text-blue-700">
                Drop your profile image here
              </p>
            </div>
          </div>
        )}
        
        <div className="relative">
          <ImageUploadButton
            onImageSelect={handleImageSelect}
            uploading={uploading}
            avatarUrl={avatarUrl}
          />
          <p className="text-xs text-center text-gray-500 mt-2">
            You can also drag and drop an image here
          </p>
        </div>
      </div>
      
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          setCropDialogOpen(open);
          if (!open) {
            setSelectedImage(null);
            setFinalCrop(null);
          }
        }}
        selectedImage={selectedImage}
        crop={crop}
        onCropChange={setCrop}
        onCropComplete={handleCropComplete}
        imgRef={imgRef}
        onSave={uploadAvatar}
        uploading={uploading}
      />
    </>
  );
};
