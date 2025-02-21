
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import NotificationsPopover from "../notifications/NotificationsPopover";

const Header = () => {
  const user = useUser();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold">Local Link</Link>
        
        <div className="ml-auto flex items-center gap-4">
          <NotificationsPopover />
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
