import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

/**
 * Props for the CopyLinkSection component
 */
interface CopyLinkSectionProps {
  isGeneratingLink: boolean;
  onGenerateAndCopyLink: () => void;
}

/**
 * CopyLinkSection Component
 * 
 * Simple component that provides a button to generate and copy an invite link.
 * Handles the loading state during link generation.
 */
const CopyLinkSection = ({
  isGeneratingLink,
  onGenerateAndCopyLink
}: CopyLinkSectionProps) => {
  // State to track if link has been successfully copied
  const [isCopied, setIsCopied] = useState(false);

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Handle copy button click and track success
  const handleCopyClick = async () => {
    await onGenerateAndCopyLink();
    // Set copied state to true after successful copy
    setIsCopied(true);
  };

  return (
    <div className="space-y-4">
      {/* Simple copy link button */}
      <Button 
        onClick={handleCopyClick} 
        disabled={isGeneratingLink} 
        variant="outline"
        className="w-full" 
        size="lg"
      >
        {isCopied ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {isGeneratingLink ? "Generating..." : isCopied ? "Link Copied!" : "Copy Invite Link"}
      </Button>
    </div>
  );
};

export default CopyLinkSection;