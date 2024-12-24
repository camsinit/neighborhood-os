import { useState, useRef } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Upload } from "lucide-react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ProfileImageUpload = () => {
  const user = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1
  });
  const imgRef = useRef<HTMLImageElement>(null);

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

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  };

  const uploadAvatar = async () => {
    try {
      if (!imgRef.current || !selectedImage) return;
      
      setUploading(true);
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop as PixelCrop);
      
      const filePath = `${user?.id}-${Math.random()}.jpg`;

      // Upload cropped image to Storage
      const { error: uploadError } = await supabase.storage
        .from('mutual_aid_images')
        .upload(filePath, croppedImageBlob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('mutual_aid_images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile image updated successfully.",
      });

      setCropDialogOpen(false);
      setSelectedImage(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            <UserCircle className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('single-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Image
          </Button>
          <input
            type="file"
            id="single-upload"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {selectedImage && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Crop preview"
                  className="max-h-[400px] w-auto"
                />
              </ReactCrop>
            )}
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setCropDialogOpen(false);
                  setSelectedImage(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadAvatar}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};