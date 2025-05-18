
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { UserNeighborhoods } from "./UserNeighborhoods";
import { VisibilitySettings } from "./neighbor/VisibilitySettings";

/**
 * NeighborTab component for user settings
 * 
 * Displays and manages user neighbor profile settings including
 * neighborhood memberships and contact information visibility.
 * Skills section has been removed based on user request.
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

      {/* Contact Visibility Settings */}
      <VisibilitySettings form={form} />
    </div>;
};
