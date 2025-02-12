
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, Calendar, Heart, Gift, Brain, Shield, Settings, UserCircle } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onOpenSettings: () => void;
}

const Sidebar = ({ onOpenSettings }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/login");
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  const mainNavItems = [
    { 
      icon: Home, 
      label: "Home", 
      href: "/" 
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications"
    }
  ];

  const middleNavItems = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/calendar" 
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/skills" 
    },
    { 
      icon: Gift, 
      label: "Goods", 
      href: "/goods" 
    },
    { 
      icon: Heart, 
      label: "Care", 
      href: "/care" 
    },
    { 
      icon: Shield, 
      label: "Safety", 
      href: "/safety" 
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

        <Separator className="my-4" />

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
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base font-medium"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage 
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                    alt={profile?.display_name || user?.email}
                  />
                  <AvatarFallback>
                    <UserCircle className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || user?.user_metadata?.full_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base font-medium"
            onClick={onOpenSettings}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
