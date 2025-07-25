
import { Zap } from "lucide-react";
// Import toast directly from sonner for success messages
import { toast as sonnerToast } from 'sonner';

/**
 * Header component props
 * onOpenSettings is a function that will be called when the settings option is clicked
 */
interface HeaderProps {
  onOpenSettings: () => void;
}

/**
 * Header component
 * 
 * Displays the top navigation bar with:
 * - Quick Actions title
 * - Notifications button
 * 
 * UPDATED: Removed neighborhood name display and profile dropdown
 */
const Header = ({
  onOpenSettings
}: HeaderProps) => {

  return (
    <>
      {/* Removed the 'border-b' class from the header to remove the bottom border stroke */}
      <header className="h-16 px-4 flex items-center justify-between">
      {/* Left side - Quick Actions title */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Quick Actions
          </h2>
        </div>
        
        {/* Right side - notifications now embedded in main content */}
        <div className="flex items-center gap-2">
          {/* Notifications moved to main content area */}
        </div>
      </header>
    </>
  );
};

export default Header;
