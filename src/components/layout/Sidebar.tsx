
import { Link, useLocation } from "react-router-dom";
import { Calendar, Heart, Gift, Brain, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
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
    <div className="w-64 border-r bg-white">
      <div className="p-6">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png" 
            alt="Terrific Terrace Logo" 
            className="h-8"
          />
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
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
      </nav>
    </div>
  );
};

export default Sidebar;
