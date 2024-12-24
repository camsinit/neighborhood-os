import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle, Upload } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

interface ImageUploadButtonProps {
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  avatarUrl?: string | null;
}

export const ImageUploadButton = ({ onImageSelect, uploading, avatarUrl }: ImageUploadButtonProps) => {
  const user = useUser();

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
        <AvatarFallback>
          <UserCircle className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      {!avatarUrl && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('single-upload')?.click()}
            className="focus:ring-0 focus:ring-offset-0"
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
      )}
    </div>
  );
};