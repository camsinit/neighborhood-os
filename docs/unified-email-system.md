# Unified Email Parameter System

## Overview
This system ensures all email templates use consistent parameters, proper name resolution, and unified URL generation with UTM tracking.

## Key Benefits

### For Developers (Like a Dummy Explanation 🎯)
1. **No More Email Bugs**: One user shows up as "john@email.com" in one email and "John Smith" in another? Fixed!
2. **Easy New Templates**: Copy the interface pattern, get automatic UTM tracking, proper names, and consistent URLs
3. **Relationship-Aware**: System knows when Sarah invites John vs when Admin gets notified about John joining
4. **Single Source of Truth**: Change how names work? Update one file, not 15 templates

### For Users (Better Experience)
1. **Consistent Names**: Always see "Your neighbor Sarah" not "sarah@email.com"
2. **Proper Context**: "John accepted YOUR invitation" vs "New member John joined"
3. **Working Links**: All email links have tracking and go to the right place
4. **Professional Look**: Consistent branding across all emails

## How to Use

### For New Email Templates:
```typescript
// 1. Import the right base type
import type { ActorRecipientEmailProps } from '../src/types/emailTypes'

// 2. Extend it with your specific needs
interface MyEmailProps extends ActorRecipientEmailProps {
  mySpecificField?: string;
}

// 3. Use the standardized prop names
export const MyEmail = ({
  recipientName,      // ✅ Always resolved properly
  actorName,          // ✅ "Your neighbor Sarah" 
  neighborhoodName,   // ✅ Consistent
  homeUrl,           // ✅ Has UTM tracking
  fromName           // ✅ Consistent branding
}: MyEmailProps) => (...)
```

### For Edge Functions:
```typescript
// 1. Use the parameter resolver
const emailParams = await resolveActorRecipientParameters('invitation', {
  relationship: 'actor-recipient',
  actor: { id: inviterId, email: 'sarah@...', displayName: 'Sarah' },
  recipient: { id: recipientId, email: 'john@...', displayName: null },
  content: { id: neighborhoodId, type: 'invitation', title: 'Maple Street' },
  neighborhood: { id: neighborhoodId, name: 'Maple Street', memberCount: 12 }
});

// 2. Template automatically gets: "Your neighbor Sarah invited you..."
```

## Template Types

- **BaseEmailProps**: For system broadcasts, weekly summaries
- **ActorRecipientEmailProps**: For notifications where someone did something to someone else
- **AdminNotificationEmailProps**: For neighborhood admin alerts

## Files Created
- `/src/types/emailTypes.ts` - All interfaces and types
- `/src/utils/emailConfig.ts` - Email addresses, UTM campaigns, subject templates
- `/src/utils/emailParameterResolver.ts` - Core logic for resolving parameters
- Updated templates: `welcome-email.tsx`, `basic-invitation.tsx`

## Migration Status ✅ COMPLETED

### Templates Updated:
- ✅ `emails/welcome-email.tsx` - Uses BaseEmailProps with enhanced customization
- ✅ `emails/basic-invitation.tsx` - Uses ActorRecipientEmailProps with relationship awareness  
- ✅ `emails/invitation-accepted.tsx` - Uses ActorRecipientEmailProps with admin/inviter context
- ✅ `emails/onboarding-goods.tsx` - Uses SystemBroadcastEmailProps with enhanced features

### Edge Functions Updated:  
- ✅ `supabase/functions/send-welcome-email/index.ts` - Full parameter resolver integration
- ✅ `supabase/functions/send-invitation/index.ts` - Relationship-aware messaging with database resolution

### Key Relationship Dynamics Implemented:
- **Actor → Recipient**: "Your neighbor Sarah invited you to join..."
- **Admin Notifications**: "New member John joined your neighborhood" 
- **Name Resolution**: display_name → firstName → email extraction with proper fallbacks
- **Consistent URLs**: All links have UTM tracking and proper campaign attribution
- **Database Integration**: Automatic resolution of profiles and neighborhood context

The system is now fully operational and handles all the relationship dynamics mentioned in your original request!