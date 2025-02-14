
import { Button } from "@/components/ui/button";
import { Settings, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header = ({ onOpenSettings }: HeaderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Local Link
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
