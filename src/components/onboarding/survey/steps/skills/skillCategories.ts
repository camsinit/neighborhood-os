
/**
 * Predefined skill categories and their respective skills
 * 
 * This structure organizes skills into categories for easier selection
 * during onboarding. Each category has a title and an array of skills.
 */
export const SKILL_CATEGORIES = {
  technology: {
    title: "Technology",
    skills: [
      "Website Help",
      "Smartphone/Tablet Help",
      "Computer Troubleshooting",
      "Internet Safety",
      "Computer/Device Repair",
      "Smart Home Setup",
      "WiFi Network Setup",
      "Video Call Help",
      "Internet Account Help",
      "Photo Organization",
      "Data Backup & Recovery"
    ],
  },
  emergency: {
    title: "Emergency & Safety",
    skills: [
      "Medical (Doctor, Nurse, EMT)",
      "First Aid/CPR Certified",
      "Emergency Response Training",
      "Search and Rescue Experience",
      "Fire Safety Training",
      "Crisis Management",
      "Disaster Preparedness"
    ],
  },
  professional: {
    title: "Professional Services",
    skills: [
      "Legal Knowledge",
      "Financial/Accounting",
      "Tax Preparation",
      "Mental Health Support",
      "Language Translation",
      "Resume/Job Search Help",
      "Business Consulting",
      "Notary Public"
    ],
  },
  maintenance: {
    title: "Home & Maintenance",
    skills: [
      "Construction/Home Repair",
      "Electrical Work",
      "Plumbing",
      "Car Maintenance/Repair",
      "Solar/Alternative Energy",
      "Gardening/Landscaping",
      "Furniture Repair",
      "Painting",
      "Yard Work"
    ],
  },
  care: {
    title: "Care & Support",
    skills: [
      "Childcare",
      "Pet Care",
      "Elder Care",
      "Cooking/Meal Preparation",
      "Grocery Shopping",
      "Transportation",
      "House Sitting",
      "Pet Sitting"
    ],
  },
  education: {
    title: "Education & Arts",
    skills: [
      "Tutoring",
      "Music Lessons",
      "Art/Craft Instruction",
      "Language Teaching",
      "Photography",
      "Athletic Coaching",
      "Mentoring",
      "Workshop Facilitation"
    ],
  },
};

/**
 * Definition for skills that require additional specificity
 * 
 * This helps the UI know when to show additional input fields for
 * more detailed information about certain skills.
 */
export const SKILLS_REQUIRING_DETAILS = {
  "Language Translation": {
    prompt: "Which languages?",
    placeholder: "Spanish, Mandarin, French",
    examples: ["Spanish", "Mandarin", "French"]
  },
  "Tutoring": {
    prompt: "Which subjects?",
    placeholder: "Math, Science, English",
    examples: ["Math", "Science", "English"]
  },
  "Music Lessons": {
    prompt: "Which instruments?",
    placeholder: "Piano, Guitar, Bass",
    examples: ["Piano", "Guitar", "Bass"] 
  },
  "Athletic Coaching": {
    prompt: "Which sports?",
    placeholder: "Soccer, Basketball, Swimming",
    examples: ["Soccer", "Basketball", "Swimming"]
  },
  "Language Teaching": {
    prompt: "Which languages?",
    placeholder: "Spanish, English, Japanese",
    examples: ["Spanish", "English", "Japanese"]
  }
};
