
import { useState } from "react";
import { ProfileImageUpload } from "@/components/settings/ProfileImageUpload";

/**
 * Profile Image Step Component
 * 
 * Allows users to upload a profile photo using the existing ProfileImageUpload component.
 * This step is important for building community trust.
 */
export const ProfileImageStep = () => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <ProfileImageUpload />
        
        <p className="text-sm text-muted-foreground mt-4">
          Adding a profile photo helps neighbors recognize you and builds community trust.
        </p>
      </div>
    </div>
  );
};
