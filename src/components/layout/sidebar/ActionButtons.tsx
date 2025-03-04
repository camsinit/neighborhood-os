
import { Settings, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ActionButtons component props
 */
interface ActionButtonsProps {
  onOpenSettings: () => void;
  onOpenInvite: () => void;
  // Removed unused props related to neighborhood diagnostics
}

/**
 * ActionButtons component
 * 
 * Displays the settings and invite action buttons
 */
const ActionButtons = ({ 
  onOpenSettings, 
  onOpenInvite,
}: ActionButtonsProps) => {
  // Get the toast notification function
  const { toast } = useToast();
  
  // Get navigation for logout redirect
  const navigate = useNavigate();
  
  // Function to handle opening the settings dialog
  const handleOpenSettings = () => {
    // Call the provided callback function to open settings directly
    // This will skip the dropdown menu and open the dialog immediately
    console.log("[ActionButtons] Opening settings dialog - triggering callback directly");
    try {
      onOpenSettings();
      console.log("[ActionButtons] Settings callback executed successfully");
    } catch (error) {
      console.error("[ActionButtons] Error executing settings callback:", error);
    }
  };

  // Function to handle opening the invite dialog
  const handleOpenInvite = () => {
    // Call the provided callback function to open invite dialog
    onOpenInvite();
  };
  
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
      {/* Settings button - now opens the settings dialog directly without dropdown */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={handleOpenSettings}
        type="button"
      >
        <Settings className="h-5 w-5" />
        Settings
      </Button>
      
      {/* Invite button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-base font-medium"
        onClick={handleOpenInvite}
        type="button"
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
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </div>
  );
};

export default ActionButtons;
