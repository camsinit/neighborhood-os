import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProfileImageUpload } from "@/components/settings/ProfileImageUpload";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User, Camera, Mail, Phone, Home, Wrench } from "lucide-react";

const SKILLS_OPTIONS = [
  "Medical (Doctor, Nurse, EMT)",
  "Mental Health (Counselor, Therapist)",
  "Construction/Home Repair",
  "Electrical Work",
  "Plumbing",
  "Legal Knowledge",
  "Financial/Accounting",
  "IT/Technical Support",
  "First Aid/CPR Certified",
  "Emergency Response Training",
  "Search and Rescue Experience",
  "Fire Safety Training",
  "Childcare/Education",
  "Elder Care",
  "Pet Care/Veterinary",
  "Cooking/Meal Preparation",
  "Language Translation/Interpretation",
  "Gardening/Landscaping",
  "Car Maintenance/Repair",
  "Solar/Alternative Energy Knowledge",
];

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
      fields: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Profile Picture",
      icon: Camera,
      fields: (
        <div className="space-y-4">
          <ProfileImageUpload />
        </div>
      ),
    },
    {
      title: "Contact Information",
      icon: Mail,
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
        </div>
      ),
    },
    {
      title: "Address",
      icon: Home,
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              Your address will only be visible to Neighborhood Admins for emergency purposes.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Skills to Share",
      icon: Wrench,
      fields: (
        <div className="space-y-4">
          <div className="h-[300px] overflow-y-auto space-y-2">
            {SKILLS_OPTIONS.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={skill}
                  checked={formData.skills.includes(skill)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        skills: [...formData.skills, skill],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        skills: formData.skills.filter((s) => s !== skill),
                      });
                    }
                  }}
                />
                <Label htmlFor={skill}>{skill}</Label>
              </div>
            ))}
          </div>
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

  const CurrentIcon = steps[step].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CurrentIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {steps[step].title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">{steps[step].fields}</div>
        <div className="flex justify-center space-x-1 pt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-12 rounded-full ${
                index === step ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;