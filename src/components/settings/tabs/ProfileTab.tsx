import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "../types";
import { ProfileSection } from "../sections/ProfileSection";
import { OnboardingAnswersSection } from "../sections/OnboardingAnswersSection";

export const ProfileTab = ({ form }: { form: UseFormReturn<ProfileFormValues> }) => {
  return (
    <div className="space-y-8">
      <ProfileSection form={form} />
      <OnboardingAnswersSection />
    </div>
  );
};