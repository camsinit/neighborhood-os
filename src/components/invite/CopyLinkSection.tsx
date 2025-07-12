import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Link } from "lucide-react";

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
      {/* Copy link header with icon and description */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-50 rounded-lg">
          <Link className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Copy Invite Link</h3>
          <p className="text-sm text-gray-600">
            Generate a link to share however you'd like
          </p>
        </div>
      </div>
      
      {/* Copy link button */}
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