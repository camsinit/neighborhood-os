import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  imageUrl: string | null | undefined;
  onImageUpload: (url: string) => void;
  category: string | undefined;
}

const ImageUpload = ({ imageUrl, onImageUpload, category }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mutual_aid_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mutual_aid_images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (category !== 'goods') return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="image">Image</Label>
      <div className="flex items-center gap-4">
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file);
            }
          }}
          className="flex-1"
          disabled={isUploading}
        />
        {imageUrl && (
          <div className="relative w-16 h-16">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;