import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileImageUpload } from "@/components/settings/ProfileImageUpload";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Home, Wrench } from "lucide-react";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { BasicInfoStep } from "./survey/steps/BasicInfoStep";
import { ContactInfoStep } from "./survey/steps/ContactInfoStep";
import { AddressStep } from "./survey/steps/AddressStep";
import { SkillCategory } from "./survey/steps/skills/SkillCategory";
import { SKILL_CATEGORIES } from "./survey/steps/skills/skillCategories";

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SurveyDialog = ({ open, onOpenChange }: SurveyDialogProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [] as string[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    {
      title: "Basic Information",
      icon: User,
      description: "Let's start with your name so your neighbors can get to know you.",
      component: (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={(value) =>
            setFormData({ ...formData, firstName: value })
          }
          onLastNameChange={(value) =>
            setFormData({ ...formData, lastName: value })
          }
        />
      ),
    },
    {
      title: "Profile Picture",
      icon: User,
      description: "Add a friendly photo to help build trust in the community.",
      component: <ProfileImageUpload />,
    },
    {
      title: "Contact Information",
      icon: Mail,
      description: "Your contact details help us keep you informed about community events and updates.",
      component: (
        <ContactInfoStep
          email={formData.email}
          phone={formData.phone}
          onEmailChange={(value) => setFormData({ ...formData, email: value })}
          onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
        />
      ),
    },
    {
      title: "Address",
      icon: Home,
      description: "Your address helps us connect you with nearby neighbors and local events.",
      component: (
        <AddressStep
          address={formData.address}
          onAddressChange={(value) => setFormData({ ...formData, address: value })}
        />
      ),
    },
    {
      title: "Emergency & Professional Skills",
      icon: Wrench,
      description: "Share your emergency response and professional skills to help neighbors in need.",
      component: (
        <div className="space-y-6">
          <SkillCategory
            title={SKILL_CATEGORIES.emergency.title}
            skills={SKILL_CATEGORIES.emergency.skills}
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => setFormData({ ...formData, skills })}
          />
          <SkillCategory
            title={SKILL_CATEGORIES.professional.title}
            skills={SKILL_CATEGORIES.professional.skills}
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => setFormData({ ...formData, skills })}
          />
        </div>
      ),
    },
    {
      title: "Maintenance & Care Skills",
      icon: Wrench,
      description: "Share your practical skills that can help maintain our community.",
      component: (
        <div className="space-y-6">
          <SkillCategory
            title={SKILL_CATEGORIES.maintenance.title}
            skills={SKILL_CATEGORIES.maintenance.skills}
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => setFormData({ ...formData, skills })}
          />
          <SkillCategory
            title={SKILL_CATEGORIES.care.title}
            skills={SKILL_CATEGORIES.care.skills}
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => setFormData({ ...formData, skills })}
          />
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: `${formData.firstName} ${formData.lastName}`,
            phone_number: formData.phone,
            address: formData.address,
            skills: formData.skills,
          })
          .eq("id", (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });

        onOpenChange(false);
        navigate("/");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <SurveyStepHeader
            icon={steps[step].icon}
            title={steps[step].title}
          />
          <p className="text-center text-sm text-muted-foreground mb-6">
            {steps[step].description}
          </p>
          <div className="py-4">{steps[step].component}</div>
          <SurveyProgress currentStep={step} totalSteps={steps.length} />
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDialog;