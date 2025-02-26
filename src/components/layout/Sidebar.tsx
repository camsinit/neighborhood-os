
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, Gift, Brain, Shield, Settings, Users, UserPlus } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InviteDialog from "@/components/InviteDialog";

// Add comments to explain what each color represents
const Sidebar = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const location = useLocation();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
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
    enabled: !!useUser()?.id,
  });

  // Main navigation item (Home) doesn't need a theme color
  const mainNavItems = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/" 
    }
  ];

  // Define middle navigation items with their respective theme colors
  const middleNavItems = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/calendar",
      color: "#0EA5E9" // Calendar uses a bright blue theme
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/skills",
      color: "#9b87f5" // Skills uses a purple theme
    },
    { 
      icon: Gift, 
      label: "Goods", 
      href: "/goods",
      color: "#F97316" // Goods uses an orange theme
    },
    { 
      icon: Heart, 
      label: "Care", 
      href: "/care",
      color: "#22C55E" // Care uses a green theme
    },
    { 
      icon: Shield, 
      label: "Safety", 
      href: "/safety",
      color: "#EA384C" // Safety uses a red theme
    },
    {
      icon: Users,
      label: "Neighbors",
      href: "/neighbors",
      color: "#7E69AB" // Neighbors uses a secondary purple theme
    },
  ];

  return (
    <div className="w-48 border-r bg-white flex flex-col">
      <div className="p-4 flex justify-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png" 
            alt="Terrific Terrace Logo" 
            className="h-24"
          />
        </Link>
      </div>
      <nav className="flex-1 px-2">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-base font-medium",
                    isActive && "bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div className="space-y-1">
          {middleNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-base font-medium",
                    isActive && "bg-gray-100"
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

        <div className="my-4 h-px bg-gray-200" />

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={onOpenSettings}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={() => setIsInviteOpen(true)}
          >
            <UserPlus className="h-5 w-5" />
            Invite Neighbor
          </Button>
        </div>
      </nav>
      <InviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
      />
    </div>
  );
};

export default Sidebar;
