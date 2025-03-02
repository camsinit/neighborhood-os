
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, Gift, Brain, Shield, Settings, Users, UserPlus } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InviteDialog from "@/components/InviteDialog";

/**
 * Sidebar component props
 * onOpenSettings is a function that will be called when the settings button is clicked
 */
interface SidebarProps {
  onOpenSettings: () => void;
}

/**
 * Sidebar component
 * 
 * Displays the navigation sidebar with links to different sections of the app
 */
const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  // State to control the invite dialog visibility
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Fetch user profile data using React Query
  const { data: profile } = useQuery({
    queryKey: ['profile', useUser()?.id],
    queryFn: async () => {
      const user = useUser();
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!useUser()?.id, // Only run query when user is logged in
  });

  // Main navigation item (Home/Dashboard) - This is the main entry point
  const mainNavItems = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/dashboard" // Updated to use /dashboard path
    }
  ];

  // Define middle navigation items with their respective theme colors
  // Each item has a specific color that represents its category
  const middleNavItems = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/dashboard/events", // Updated to include /dashboard prefix
      color: "#0EA5E9" // Calendar uses a bright blue theme
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/dashboard/skills", // Updated to include /dashboard prefix
      color: "#9b87f5" // Skills uses a purple theme
    },
    { 
      icon: Gift, 
      label: "Goods", 
      href: "/dashboard/goods", // Updated to include /dashboard prefix
      color: "#F97316" // Goods uses an orange theme
    },
    { 
      icon: Heart, 
      label: "Care", 
      href: "/dashboard/care", // Updated to include /dashboard prefix
      color: "#22C55E" // Care uses a green theme
    },
    { 
      icon: Shield, 
      label: "Safety", 
      href: "/dashboard/safety", // Updated to include /dashboard prefix
      color: "#EA384C" // Safety uses a red theme
    },
    {
      icon: Users,
      label: "Neighbors",
      href: "/dashboard/neighbors", // Updated to include /dashboard prefix
      color: "#7E69AB" // Neighbors uses a secondary purple theme
    },
  ];

  // Function to handle opening the settings dialog
  const handleOpenSettings = () => {
    // Call the provided callback function to open settings
    if (onOpenSettings) {
      console.log("Opening settings dialog");
      onOpenSettings();
    } else {
      console.error("onOpenSettings function not provided to Sidebar component");
    }
  };

  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    console.log("Opening invite dialog");
    setIsInviteOpen(true);
  };

  return (
    <div className="w-48 border-r bg-white flex flex-col">
      {/* Logo section at the top of sidebar */}
      <div className="p-4 flex justify-center">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png" 
            alt="Terrific Terrace Logo" 
            className="h-24"
          />
        </Link>
      </div>
      
      {/* Navigation menu section */}
      <nav className="flex-1 px-2">
        {/* Home/Dashboard navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            // Check if current path matches this nav item
            const isActive = location.pathname === item.href;
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

        {/* Divider between navigation groups */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Feature navigation items */}
        <div className="space-y-1">
          {middleNavItems.map((item) => {
            // For the middle items, we need to check if we're on that specific page
            // or any child routes of that page
            const isActive = location.pathname === item.href || 
                            location.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-base font-medium",
                    isActive && "bg-gray-100" // Highlight active item
                  )}
                >
                  <item.icon 
                    className="h-5 w-5" 
                    color={item.color} // Apply the theme color to the icon
                  />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Divider before bottom actions */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Settings and Invite buttons */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={handleOpenSettings} // Now calling our handler function
            type="button" // Explicitly set button type
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={handleOpenInvite} // Now calling our handler function
            type="button" // Explicitly set button type
          >
            <UserPlus className="h-5 w-5" />
            Invite Neighbor
          </Button>
        </div>
      </nav>
      
      {/* Invite dialog component (shown when isInviteOpen is true) */}
      <InviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
      />
    </div>
  );
};

export default Sidebar;
