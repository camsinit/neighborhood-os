import * as React from 'react';

// Core email templates
export { WelcomeEmail } from './welcome-email';
export { default as BasicInvitation } from './basic-invitation';
export { default as InvitationAccepted } from './invitation-accepted';
export { default as WaitlistWelcome } from './waitlist-welcome';
export { default as WeeklySummary } from './weekly-summary';

// Onboarding series (7 emails sent every 3 days)
export { default as OnboardingCommunity } from './onboarding-community';
export { default as OnboardingEvents } from './onboarding-events';
export { default as OnboardingSkills } from './onboarding-skills';
export { default as OnboardingCare } from './onboarding-care';
export { default as OnboardingGoods } from './onboarding-goods';
export { default as OnboardingDirectory } from './onboarding-directory';
export { default as OnboardingConclusion } from './onboarding-conclusion';