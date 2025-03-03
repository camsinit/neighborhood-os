
import { Link, useLocation } from "react-router-dom";
import { Calendar, Heart, Gift, Brain, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FeatureNavigation component
 * 
 * Displays the feature navigation items with their respective theme colors
 */
const FeatureNavigation = () => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  
  // Define middle navigation items with their respective theme colors
  // Each item has a specific color that represents its category
  const middleNavItems = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/dashboard/events", 
      color: "#0EA5E9" // Calendar uses a bright blue theme
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/dashboard/skills", 
      color: "#9b87f5" // Skills uses a purple theme
    },
    { 
      icon: Gift, 
      label: "Goods", 
      href: "/dashboard/goods", 
      color: "#F97316" // Goods uses an orange theme
    },
    { 
      icon: Heart, 
      label: "Care", 
      href: "/dashboard/care", 
      color: "#22C55E" // Care uses a green theme
    },
    { 
      icon: Shield, 
      label: "Safety", 
      href: "/dashboard/safety", 
      color: "#EA384C" // Safety uses a red theme
    },
    {
      icon: Users,
      label: "Neighbors",
      href: "/dashboard/neighbors",
      color: "#7E69AB" // Neighbors uses a secondary purple theme
    },
  ];

  return (
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
  );
};

export default FeatureNavigation;
