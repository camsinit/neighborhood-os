import NotificationsPopover from "@/components/notifications/NotificationsPopover";

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
              onError={(e) => {
                console.error('Error loading logo image');
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <NotificationsPopover />
            {onOpenSettings && (
              <button 
                onClick={onOpenSettings}
                className="text-gray-600 hover:text-gray-900"
              >
                Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;