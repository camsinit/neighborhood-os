import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle, Upload } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";

interface ImageUploadButtonProps {
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  avatarUrl?: string | null;
}

export const ImageUploadButton = ({ onImageSelect, uploading, avatarUrl }: ImageUploadButtonProps) => {
  const user = useUser();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    document.getElementById('single-upload')?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase() || <UserCircle className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Upload className="h-8 w-8 text-white" />
        </div>
      </div>
      <input
        type="file"
        id="single-upload"
        accept="image/*"
        onChange={onImageSelect}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
};