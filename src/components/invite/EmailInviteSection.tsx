import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send } from "lucide-react";

/**
 * Props for the EmailInviteSection component
 */
interface EmailInviteSectionProps {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  isSendingEmail: boolean;
  onSendEmailInvite: () => void;
  // Admin toggle props (optional - only passed when user is admin)
  isAdmin?: boolean;
  inviteAsAdmin?: boolean;
  setInviteAsAdmin?: (value: boolean) => void;
}

/**
 * EmailInviteSection Component
 * 
 * Handles the email invitation form with validation and sending functionality.
 * Provides a clean interface for users to send personalized email invitations.
 */
const EmailInviteSection = ({
  email,
  setEmail,
  emailError,
  setEmailError,
  isSendingEmail,
  onSendEmailInvite,
  isAdmin,
  inviteAsAdmin,
  setInviteAsAdmin
}: EmailInviteSectionProps) => {
  return (
    <div className="space-y-4">
      
      {/* Email input form with validation */}
      <div className="space-y-3">
        <div className="space-y-2">
          {/* Email address label with admin toggle right next to it */}
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            {/* Admin toggle appears right next to the label */}
            {isAdmin && setInviteAsAdmin && (
              <div className="inline-flex items-center gap-2">
                <Checkbox
                  id="invite-as-admin"
                  checked={inviteAsAdmin}
                  onCheckedChange={(checked) => setInviteAsAdmin(Boolean(checked))}
                />
                <Label htmlFor="invite-as-admin" className="text-sm text-muted-foreground">
                  Invite as Admin
                </Label>
              </div>
            )}
          </div>
          <Input
            id="email"
            type="email"
            placeholder="neighbor@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear error when user starts typing
              if (emailError) setEmailError('');
            }}
            className={emailError ? "border-red-300 focus:border-red-500" : ""}
          />
          {/* Display validation error if present */}
          {emailError && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
        </div>

        {/* Send invitation button */}
        <Button 
          onClick={onSendEmailInvite} 
          disabled={isSendingEmail || !email.trim()} 
          className="w-full"
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSendingEmail ? "Sending..." : "Send Invitation"}
        </Button>
      </div>
    </div>
  );
};

export default EmailInviteSection;