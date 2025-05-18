
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { UserNeighborhoods } from "./UserNeighborhoods";
import { SkillsSection } from "./neighbor/SkillsSection";
import { VisibilitySettings } from "./neighbor/VisibilitySettings";

/**
 * NeighborTab component for user settings
 * 
 * Displays and manages user neighbor profile settings including
 * neighborhood memberships, skills, and contact information visibility.
 * 
 * @param form - The form instance from react-hook-form
 */
export const NeighborTab = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  return <div className="space-y-6">
      {/* Neighborhoods Section */}
      <div className="space-y-4">
        <UserNeighborhoods />
      </div>

      {/* Skills Section */}
      <SkillsSection form={form} />

      {/* Contact Visibility Settings */}
      <VisibilitySettings form={form} />
    </div>;
};
