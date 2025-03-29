
/**
 * Index page component
 * 
 * This component serves as the entry point to the application when a user visits the root route.
 * It redirects users based on authentication status and neighborhood context.
 */
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Loader2 } from "lucide-react";

const Index = () => {
  // State for the settings dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  
  // Get the current authenticated user
  const user = useUser();
  
  // Get neighborhood context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  // Track initial load state to prevent flashing content
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Effect to handle routing logic based on authentication and neighborhood status
  useEffect(() => {
    // Don't do anything while still loading neighborhood data
    if (isLoadingNeighborhood) {
      return;
    }

    // Add a small delay to prevent flashing content during redirects
    const timer = setTimeout(() => {
      setInitialLoad(false);
      
      // If user is not authenticated, redirect to landing page
      if (!user) {
        console.log("[Index] User not authenticated, redirecting to landing page");
        navigate("/");
        return;
      }
      
      // If authenticated but no neighborhood, redirect to join page
      if (user && !currentNeighborhood) {
        console.log("[Index] User authenticated but no neighborhood, redirecting to join page");
        navigate("/join");
        return;
      }
      
      // If authenticated and has neighborhood, redirect to home page for a better experience
      if (user && currentNeighborhood) {
        console.log("[Index] User authenticated with neighborhood, redirecting to home page");
        navigate("/home");
        return;
      }
    }, 300); // Short delay to prevent flashing

    return () => clearTimeout(timer);
  }, [user, currentNeighborhood, isLoadingNeighborhood, navigate]);

  // Show loading indicator while determining where to route the user
  if (initialLoad || isLoadingNeighborhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your neighborhood...</p>
        </div>
      </div>
    );
  }

  // This is a fallback UI in case redirects don't happen immediately
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <MainContent />
      <SettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Index;
