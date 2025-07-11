
import React, { useState } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";

/**
 * DangerZone Component
 * 
 * Provides dangerous account actions like account deletion with proper
 * warnings and confirmation steps to prevent accidental data loss.
 * 
 * Updated to work with the fixed account deletion system that properly
 * handles only existing database tables.
 */
export const DangerZone: React.FC = () => {
  const user = useUser();
  const { deleteAccount, isDeleting } = useAccountDeletion();
  
  // State for confirmation dialogs
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  
  // Required confirmation text (user's email)
  const requiredConfirmation = user?.email || "";
  const isConfirmationValid = confirmationText === requiredConfirmation;

  /**
   * Handle the initial delete button click
   */
  const handleInitialDelete = () => {
    setShowInitialDialog(true);
  };

  /**
   * Handle proceeding from initial warning to final confirmation
   */
  const handleProceedToFinalConfirmation = () => {
    setShowInitialDialog(false);
    setShowFinalDialog(true);
    setConfirmationText(""); // Reset confirmation text
  };

  /**
   * Handle final account deletion
   */
  const handleFinalDelete = async () => {
    if (!isConfirmationValid) return;
    
    const success = await deleteAccount();
    
    // Close dialogs regardless of success/failure
    setShowFinalDialog(false);
    setConfirmationText("");
  };

  /**
   * Handle canceling any dialog
   */
  const handleCancel = () => {
    setShowInitialDialog(false);
    setShowFinalDialog(false);
    setConfirmationText("");
  };

  return (
    <div className="space-y-4">
      {/* Warning header */}
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Danger Zone</h3>
      </div>
      
      {/* Warning description */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 mb-3">
          Once you delete your account, there is no going back. This action will:
        </p>
        <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
          <li>Permanently delete your profile and all personal information</li>
          <li>Remove all your posts, events, safety updates, and skill offerings</li>
          <li>Delete your neighborhood memberships and created neighborhoods</li>
          <li>Remove all your notifications and activity history</li>
          <li>Cancel any pending skill offers or requests</li>
        </ul>
        <p className="text-sm text-red-800 mt-3 font-medium">
          This action cannot be undone, but you can sign up again with the same email if desired.
        </p>
      </div>

      {/* Delete button */}
      <Button
        variant="destructive"
        onClick={handleInitialDelete}
        disabled={isDeleting}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? "Deleting Account..." : "Delete My Account"}
      </Button>

      {/* Initial warning dialog */}
      <AlertDialog open={showInitialDialog} onOpenChange={setShowInitialDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you absolutely sure you want to delete your account? This action is 
                <span className="font-semibold text-red-600"> permanent and irreversible</span>.
              </p>
              <p>
                All of your data including your profile, posts, events, and neighborhood 
                connections will be permanently deleted from our servers.
              </p>
              <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                <strong>Note:</strong> If you're having issues with the app or want to 
                take a break, consider reaching out to support instead of deleting your account.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProceedToFinalConfirmation}
              className="bg-red-600 hover:bg-red-700"
            >
              I Understand, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final confirmation dialog */}
      <AlertDialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This is your last chance to cancel. To confirm account deletion, 
                please type your email address below:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-email" className="text-sm font-medium">
                  Type your email: <span className="text-red-600">{requiredConfirmation}</span>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className={
                    confirmationText && !isConfirmationValid 
                      ? "border-red-300 focus:border-red-500" 
                      : ""
                  }
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600">
                    Email does not match. Please type exactly: {requiredConfirmation}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              disabled={!isConfirmationValid || isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete My Account Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
