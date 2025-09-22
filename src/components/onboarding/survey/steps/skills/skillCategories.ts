
/**
 * Comprehensive skill categories for the neighborhood dashboard
 * 
 * This file defines five main categories of skills that neighbors can offer,
 * along with special skills that require additional details from users.
 */

export const SKILL_CATEGORIES = {
  technology: {
    title: "Technology",
    skills: [
      "Computer, Smartphone, Tablet Help",
      "WiFi Troubleshooting",
      "Social Media Help",
      "Photo Organization & Sharing",
      "Printer Setup & Troubleshooting",
      "Password Management Help",
      "Streaming Service Setup",
      "Kid-Safe Internet Setup"
    ],
  },
  emergency: {
    title: "Safety & Emergency",
    skills: [
      "First Aid/CPR Certified",
      "Medical Professional (Doctor, Nurse, EMT)",
      "Home Hazard Assessments",
      "Babyproofing",
      "Power Outage Help",
      "HAM Radio",
      "Personal Emergency Preparedness",
      "CERT/CORE-Trained"
    ],
  },
  professional: {
    title: "Life Skills",
    skills: [
      "Resume & Job Application Help",
      "Language Translation & Practice",
      "Basic Accounting Support",
      "College/School Application Help",
      "Interview Practice",
      "Basic Legal Support",
      "Emotional Support & Listening",
      "Conflict Resolution"
    ],
  },
  care: {
    title: "Daily Support",
    skills: [
      "Occasional Childcare",
      "Occasional Dog Walking",
      "Elder Companionship",
      "Meal Exchanges",
      "House Sitting & Pet Sitting",
      "Plant Watering"
    ],
  },
  education: {
    title: "Learning & Fun",
    skills: [
      "Homework Sessions",
      "Gardening Tips",
      "Music Jams",
      "Arts & Crafts Activities",
      "Sports",
      "Hobby Sharing & Teaching"
    ],
  },
};

/**
 * Skills that require additional details from the user
 * These skills will trigger a custom input dialog for specificity
 */
export const SPECIAL_SKILLS = {
  "Language Translation & Practice": {
    prompt: "Which languages?",
    placeholder: "Spanish, Mandarin, French"
  },
  "Music Jams": {
    prompt: "Which instruments?",
    placeholder: "Piano, Guitar, Bass"
  },
  "Sports": {
    prompt: "Which sports?",
    placeholder: "Soccer, Basketball, Swimming"
  },
  "Hobby Sharing & Teaching": {
    prompt: "Which hobby?",
    placeholder: "Photography, Woodworking, Knitting"
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
