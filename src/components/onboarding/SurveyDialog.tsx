import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { getSurveySteps } from "./survey/config/surveySteps";
import { useUser } from "@supabase/auth-helpers-react";
import { SurveyFormData } from "./survey/types/surveyTypes";

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SurveyDialog = ({ open, onOpenChange }: SurveyDialogProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [],
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  const steps = getSurveySteps(formData, setFormData);

  const handleNext = async () => {
    if (step === steps.length - 1) {
      try {
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: `${formData.firstName} ${formData.lastName}`,
            phone_number: formData.phone,
            address: formData.address,
            skills: formData.skills,
          })
          .eq("id", user.id);

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