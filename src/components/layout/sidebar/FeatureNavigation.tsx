
import { Link, useLocation } from "react-router-dom";
import { Calendar, Gift, Brain, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moduleThemeColors } from "@/theme/moduleTheme";

/**
 * FeatureNavigation component
 * 
 * Displays the feature navigation items with their respective theme colors
 * Order: Calendar, Skills, Freebies, Updates (formerly Safety), Neighbors
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
      // Using moduleThemeColors to ensure consistent colors across the app
      color: moduleThemeColors.calendar.primary
    },
    { 
      icon: Brain, 
      label: "Skills", 
      href: "/skills", 
      // Use the correct green color from moduleThemeColors
      color: moduleThemeColors.skills.primary
    },
    { 
      icon: Gift, 
      label: "Freebies", 
      href: "/goods", 
      color: moduleThemeColors.goods.primary
    },
    { 
      icon: Info, 
      label: "Updates", 
      href: "/safety", 
      color: moduleThemeColors.safety.primary
    },
    { 
      icon: Users,
      label: "Neighbors",
      href: "/neighbors",
      color: moduleThemeColors.neighbors.primary
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
