
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { BasicInfoFields } from "./account/BasicInfoFields";
import { PreferenceFields } from "./account/PreferenceFields";
import { useAccountTabForm } from "./hooks/useAccountTabForm";

/**
 * AccountTab component for user settings
 * 
 * Displays and manages user profile settings like display name, bio, 
 * language preference, timezone, and theme.
 * 
 * @param form - The form instance from react-hook-form
 */
export const AccountTab = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  // Use the dedicated hook for this tab
  const { form: processedForm } = useAccountTabForm(form);
  
  return (
    <div className="space-y-6">
      {/* Profile image upload component */}
      <ProfileImageUpload />
      
      {/* Basic profile information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <BasicInfoFields form={processedForm} />
      </div>

      {/* User preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>
        <PreferenceFields form={processedForm} />
      </div>
    </div>
  );
};
