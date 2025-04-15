
import { Link, useLocation } from "react-router-dom";
import { Calendar, Heart, Gift, Brain, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FeatureNavigation component
 * 
 * Displays the feature navigation items with their respective theme colors
 * The order has been updated as requested and each item has a unique color
 */
const FeatureNavigation = () => {
  // Get current location to determine which nav item is active
  const location = useLocation();
  
  // Define navigation items with their respective theme colors
  // Each item has a specific color that represents its category
  // Order has been changed as requested: Calendar, Skills, Goods, Care, Safety, Neighbors
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
      label: "Items", // Updated from "Stuff" to "Items"
      href: "/goods", 
      color: "#F97316" // Items (formerly Goods) uses an orange theme
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
                color={item.color} // Apply the theme color to the icon
                style={{
                  // Add a subtle transition effect on the icon
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
