import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

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
  return (
    <div className="space-y-4">
      {/* Simple copy link button */}
      <Button 
        onClick={onGenerateAndCopyLink} 
        disabled={isGeneratingLink} 
        variant="outline"
        className="w-full" 
        size="lg"
      >
        <Copy className="mr-2 h-4 w-4" />
        {isGeneratingLink ? "Generating..." : "Copy Invite Link"}
      </Button>
    </div>
  );
};

export default CopyLinkSection;