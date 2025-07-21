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

## Migration Path
1. ✅ Created unified system (done)
2. Update edge functions to use parameter resolver  
3. Gradually update remaining email templates
4. Add relationship-aware features as needed

The system is backward compatible - existing templates still work while you migrate!