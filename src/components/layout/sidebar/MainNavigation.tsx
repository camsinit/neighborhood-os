
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * MainNavigation component
 * 
 * Displays the primary navigation item (Home/Dashboard)
 */
const MainNavigation = () => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  
  // Define a single navigation item for home
  const mainNavItems = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/home" // Always use /home (not /dashboard)
    }
  ];

  return (
    <div className="space-y-1">
      {mainNavItems.map((item) => {
        // Check if current path matches this nav item or is dashboard (which redirects to home)
        const isActive = 
          location.pathname === item.href || 
          (item.href === "/home" && location.pathname === "/dashboard");
          
        return (
          <Link key={item.href} to={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-base font-medium",
                isActive && "bg-gray-100" // Highlight active item
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default MainNavigation;
