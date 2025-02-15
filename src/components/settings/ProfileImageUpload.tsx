
import { useState, useRef, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Crop, PixelCrop } from 'react-image-crop';
import { ImageUploadButton } from "./ImageUploadButton";
import { ImageCropDialog } from "./ImageCropDialog";
import { getCroppedImg } from "@/utils/cropUtils";
import { useQueryClient } from "@tanstack/react-query";

export const ProfileImageUpload = () => {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [finalCrop, setFinalCrop] = useState<PixelCrop | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const imgRef = useRef<HTMLImageElement>(null);

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

  return (
    <>
      <ImageUploadButton
        onImageSelect={handleImageSelect}
        uploading={uploading}
        avatarUrl={avatarUrl}
      />
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
