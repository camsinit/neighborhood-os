import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import UserMenu from "./UserMenu";

interface HeaderProps {
  onOpenSettings?: () => void;
}

const Header = ({ onOpenSettings }: HeaderProps) => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/0b971e7e-959c-4a3c-aba7-984caf24216c.png" 
              alt="Neighborhood Logo" 
              className="h-24 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <UserMenu onOpenSettings={onOpenSettings} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;