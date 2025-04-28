
import { Link, useLocation } from "react-router-dom";
import { Calendar, Gift, Brain, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FeatureNavigation component
 * 
 * Displays the feature navigation items with their respective theme colors
 * Order: Calendar, Skills, Items, Safety, Neighbors
 */
const FeatureNavigation = () => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  
  // Define navigation items with their respective theme colors
  // Each item has a specific color that represents its category
  const featureNavItems = [
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
      label: "Items", 
      href: "/goods", 
      color: "#F97316" // Items uses an orange theme
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
    <div className="space-y-1">
      {featureNavItems.map((item) => {
        // Check if current path matches this nav item
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
                color={item.color}
                style={{
                  transition: 'transform 0.2s ease-in-out'
                }}
              />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default FeatureNavigation;
