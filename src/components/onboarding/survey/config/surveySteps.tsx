import { User, Mail, Home, Wrench, Heart, Shield } from "lucide-react";
import { BasicInfoStep } from "../steps/BasicInfoStep";
import { ContactInfoStep } from "../steps/ContactInfoStep";
import { AddressStep } from "../steps/AddressStep";
import { SkillCategory } from "../steps/skills/SkillCategory";
import { SKILL_CATEGORIES } from "../steps/skills/skillCategories";
import { ProfileImageUpload } from "@/components/settings/ProfileImageUpload";
import { SurveyFormData } from "../types/surveyTypes";

export const getSurveySteps = (formData: SurveyFormData, setFormData: (data: SurveyFormData) => void) => [
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
        emailVisible={formData.emailVisible}
        phoneVisible={formData.phoneVisible}
        addressVisible={formData.addressVisible}
        onEmailChange={(value) => setFormData({ ...formData, email: value })}
        onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
        onEmailVisibleChange={(value) => setFormData({ ...formData, emailVisible: value })}
        onPhoneVisibleChange={(value) => setFormData({ ...formData, phoneVisible: value })}
        onAddressVisibleChange={(value) => setFormData({ ...formData, addressVisible: value })}
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
    title: "Emergency & Safety Skills",
    icon: Shield,
    description: "Share your emergency response and safety skills to help neighbors during critical situations. When neighbors need assistance, they can request your help and coordinate timing through the community calendar.",
    component: (
      <SkillCategory
        title={SKILL_CATEGORIES.emergency.title}
        skills={SKILL_CATEGORIES.emergency.skills}
        selectedSkills={formData.skills}
        onSkillsChange={(skills) => setFormData({ ...formData, skills })}
      />
    ),
  },
  {
    title: "Professional Services",
    icon: Wrench,
    description: "Share your professional expertise with the community. Neighbors can request your assistance for various services, and you can schedule convenient times through our calendar system.",
    component: (
      <SkillCategory
        title={SKILL_CATEGORIES.professional.title}
        skills={SKILL_CATEGORIES.professional.skills}
        selectedSkills={formData.skills}
        onSkillsChange={(skills) => setFormData({ ...formData, skills })}
      />
    ),
  },
  {
    title: "Home Maintenance Skills",
    icon: Home,
    description: "Share your home maintenance and repair skills. Your neighbors can discover these skills and coordinate with you for assistance through our community calendar.",
    component: (
      <SkillCategory
        title={SKILL_CATEGORIES.maintenance.title}
        skills={SKILL_CATEGORIES.maintenance.skills}
        selectedSkills={formData.skills}
        onSkillsChange={(skills) => setFormData({ ...formData, skills })}
      />
    ),
  },
  {
    title: "Care & Support Skills",
    icon: Heart,
    description: "Share your caregiving and support abilities to help neighbors in need. They can request your assistance and arrange timing through our community calendar system.",
    component: (
      <SkillCategory
        title={SKILL_CATEGORIES.care.title}
        skills={SKILL_CATEGORIES.care.skills}
        selectedSkills={formData.skills}
        onSkillsChange={(skills) => setFormData({ ...formData, skills })}
      />
    ),
  },
];
