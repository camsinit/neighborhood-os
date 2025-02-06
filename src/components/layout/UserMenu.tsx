import { Settings, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  onOpenSettings: (() => void) | undefined;
}

const UserMenu = ({ onOpenSettings }: UserMenuProps) => {
  const navigate = useNavigate();
  
  // Hardcoded user profile for single-player mode
  const profile = {
    email: 'cam@contxt.wiki',
    display_name: 'Cam',
    avatar_url: null
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 ring-offset-background transition-colors hover:bg-gray-100">
          <AvatarImage 
            src={profile.avatar_url || undefined}
            alt={profile.display_name || profile.email}
          />
          <AvatarFallback>
            {profile.email.charAt(0).toUpperCase() || <UserCircle className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.display_name || 'Cam'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onOpenSettings && (
          <DropdownMenuItem onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;