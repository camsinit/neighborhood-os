
import { Settings, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

/**
 * ActionButtons component props
 */
interface ActionButtonsProps {
  onOpenSettings: () => void; // Function to open settings dialog
  onOpenInvite: () => void;   // Function to open invite dialog
}

/**
 * ActionButtons component
 * 
 * Displays the settings and invite action buttons in the sidebar
 */
const ActionButtons = ({ 
  onOpenSettings, 
  onOpenInvite,
}: ActionButtonsProps) => {
  // Get the toast notification function
  const { toast } = useToast();
  
  // Get navigation for logout redirect
  const navigate = useNavigate();
  
  // Function to handle user logout
  const handleLogout = async () => {
    try {
      // Display a logout notification
      toast({
        title: "Logging out",
        description: "You are being signed out...",
      });
      
      // Sign out the user using Supabase auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect to login page
      navigate("/login");
      
      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Show error toast
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem signing out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-1">
      {/* 
        Settings button - directly calls the provided callback function
        This is a direct event handler with no conditions or state checks
      */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={onOpenSettings}
        type="button"
        aria-label="Open settings dialog"
      >
        <Settings className="h-5 w-5" />
        Settings
      </Button>
      
      {/* Invite button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={onOpenInvite}
        type="button"
        aria-label="Invite a neighbor"
      >
        <UserPlus className="h-5 w-5" />
        Invite Neighbor
      </Button>
      
      {/* Logout button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium text-red-500"
        onClick={handleLogout}
        type="button"
        aria-label="Log out of your account"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </div>
  );
};

export default ActionButtons;
