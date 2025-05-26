
/**
 * Hook for managing notification density preference
 * 
 * This hook handles storing and retrieving the user's preferred
 * notification density setting in localStorage
 */
import { useState, useEffect } from "react";
import { NotificationDensity } from "@/components/notifications/controls/NotificationDensityControl";

const DENSITY_STORAGE_KEY = "notification-density-preference";

/**
 * Custom hook for managing notification display density
 */
export const useNotificationDensity = () => {
  const [density, setDensity] = useState<NotificationDensity>("comfortable");

  // Load saved preference on mount
  useEffect(() => {
    const savedDensity = localStorage.getItem(DENSITY_STORAGE_KEY) as NotificationDensity;
    if (savedDensity && (savedDensity === "compact" || savedDensity === "comfortable")) {
      setDensity(savedDensity);
    }
  }, []);

  // Save preference when it changes
  const updateDensity = (newDensity: NotificationDensity) => {
    setDensity(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  };

  return {
    density,
    setDensity: updateDensity,
    isCompact: density === "compact"
  };
};
