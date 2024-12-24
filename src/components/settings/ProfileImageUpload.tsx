import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Upload } from "lucide-react";

export const ProfileImageUpload = () => {
  const user = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      // Upload image to Storage
      const { error: uploadError } = await supabase.storage
        .from('mutual_aid_images')
        .upload(filePath, file);

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

    } catch (error) {
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
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <input
          type="file"
          id="single-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  );
};