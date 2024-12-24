import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle, Upload } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

interface ImageUploadButtonProps {
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const ImageUploadButton = ({ onImageSelect, uploading }: ImageUploadButtonProps) => {
  const user = useUser();

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
          <Upload className="mr-2 h-4 w-4" />
          Select Image
        </Button>
        <input
          type="file"
          id="single-upload"
          accept="image/*"
          onChange={onImageSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  );
};