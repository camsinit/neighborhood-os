import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onSendEmailInvite
}: EmailInviteSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Email invite header with icon and description */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Send Email Invitation</h3>
          <p className="text-sm text-gray-600">
            Send a personalized invite directly to their inbox
          </p>
        </div>
      </div>
      
      {/* Email input form with validation */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
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