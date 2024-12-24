import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { ProfileSection } from "./ProfileSection";

export const ProfileTab = ({ form }: { form: UseFormReturn<ProfileFormValues> }) => {
  return (
    <div className="outline-none">
      <ProfileSection form={form} />
    </div>
  );
};