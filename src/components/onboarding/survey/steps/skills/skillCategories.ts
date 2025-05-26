
/**
 * Comprehensive skill categories for the neighborhood dashboard
 * 
 * This file defines six main categories of skills that neighbors can offer,
 * along with special skills that require additional details from users.
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
 * Skills that require additional details from the user
 * These skills will trigger a custom input dialog for specificity
 */
export const SPECIAL_SKILLS = {
  "Language Translation": {
    prompt: "Which languages?",
    placeholder: "Spanish, Mandarin, French"
  },
  "Tutoring": {
    prompt: "Which subjects?",
    placeholder: "Math, Science, English"
  },
  "Music Lessons": {
    prompt: "Which instruments?",
    placeholder: "Piano, Guitar, Bass"
  },
  "Athletic Coaching": {
    prompt: "Which sports?",
    placeholder: "Soccer, Basketball, Swimming"
  },
  "Language Teaching": {
    prompt: "Which languages?",
    placeholder: "Spanish, English, Japanese"
  }
};

/**
 * Timing preference options for skill availability
 */
export const TIMING_PREFERENCES = {
  days: [
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "both", label: "Both" }
  ],
  times: [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" }
  ]
};
