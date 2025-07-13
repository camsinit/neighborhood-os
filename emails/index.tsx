import * as React from 'react';
import { WelcomeEmail } from './welcome-email';

// Export all email templates for React Email preview
export { WelcomeEmail };
export { default as WaitlistWelcome } from '../supabase/functions/save-waitlist-survey/_templates/waitlist-welcome';
export { default as OnboardingWelcome } from '../supabase/functions/send-onboarding-email/_templates/onboarding-welcome';
export { default as OnboardingCommunity } from '../supabase/functions/send-onboarding-email/_templates/onboarding-community';
export { default as OnboardingSkills } from '../supabase/functions/send-onboarding-email/_templates/onboarding-skills';
export { default as OnboardingEvents } from '../supabase/functions/send-onboarding-email/_templates/onboarding-events';
export { default as OnboardingCare } from '../supabase/functions/send-onboarding-email/_templates/onboarding-care';
export { default as OnboardingGoods } from '../supabase/functions/send-onboarding-email/_templates/onboarding-goods';
export { default as OnboardingConclusion } from '../supabase/functions/send-onboarding-email/_templates/onboarding-conclusion';