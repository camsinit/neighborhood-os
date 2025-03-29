
/**
 * GodModeSelector component (SIMPLIFIED VERSION)
 * 
 * This is a preserved component for backward compatibility, but its functionality
 * is now disabled as part of our simplification process.
 */
import { useState } from 'react';
import { Select } from "@/components/ui/select";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

/**
 * GodModeSelector is preserved for backward compatibility but no longer used actively
 * It now returns null by default to avoid rendering in the UI
 */
const GodModeSelector = () => {
  // We still define state variables to maintain component signature
  // but the component itself doesn't render anymore
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("");
  const { allNeighborhoods } = useNeighborhood();
  
  // Log a warning for debugging purposes
  console.log("[GodModeSelector] This component is deprecated and will be removed in a future version");
  
  // Return null instead of rendering the component
  return null;
};

export default GodModeSelector;
