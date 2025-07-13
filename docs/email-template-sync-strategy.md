# Email Template Synchronization Strategy

## Overview
This document outlines the strategy for keeping React Email templates in sync between the `/emails/` folder (for development/preview) and the `supabase/functions/*/` templates (for production).

## Current Architecture

### Template Locations
- **Development Templates**: `/emails/*.tsx` - Used for local development and preview
- **Production Templates**: `supabase/functions/*//_templates/*.tsx` - Used by edge functions

### Template Pairs
1. `emails/neighbor-invite.tsx` ↔ `supabase/functions/send-neighbor-invite/_templates/neighbor-invite.tsx`
2. `emails/invitation-accepted.tsx` ↔ `supabase/functions/send-invitation-accepted/_templates/invitation-accepted.tsx`
3. `emails/welcome-email.tsx` ↔ `supabase/functions/send-welcome-email/_templates/welcome-email-updated.tsx`
4. `emails/onboarding-*.tsx` ↔ `supabase/functions/send-onboarding-email/_templates/onboarding-*.tsx`
5. `emails/weekly-summary.tsx` ↔ `supabase/functions/send-weekly-summary/_templates/weekly-summary.tsx`

## Synchronization Challenges

### 1. Import Differences
- **Development**: Uses `@react-email/components` (standard import)
- **Production**: Uses `npm:@react-email/components@0.0.22` (Deno import)
- **React**: Uses `react` vs `npm:react@18.3.1`

### 2. Props Differences
- **Development**: Often uses default props for preview
- **Production**: Receives actual data from edge function context
- **URLs**: Development uses static URLs, production uses dynamic URL generation

### 3. Environment Context
- **Development**: No access to Supabase client or environment variables
- **Production**: Has access to secrets and database

## Proposed Solutions

### Option 1: Template Inheritance Pattern ⭐ (Recommended)
Create shared template logic with environment-specific wrappers.

#### Structure:
```
emails/
  _shared/
    invitation-accepted-shared.tsx    # Core template logic
  invitation-accepted.tsx             # Development wrapper
supabase/functions/send-invitation-accepted/
  _templates/
    invitation-accepted.tsx           # Production wrapper
```

#### Implementation:
```typescript
// emails/_shared/invitation-accepted-shared.tsx
export const createInvitationAcceptedTemplate = (importSource: 'dev' | 'prod') => {
  // Dynamic imports based on environment
  const React = importSource === 'dev' 
    ? require('react') 
    : require('npm:react@18.3.1');
  
  // Shared template logic here
  return ({ props }) => (/* JSX */);
};

// emails/invitation-accepted.tsx  
import { createInvitationAcceptedTemplate } from './_shared/invitation-accepted-shared';
export const InvitationAcceptedEmail = createInvitationAcceptedTemplate('dev');

// supabase/functions/send-invitation-accepted/_templates/invitation-accepted.tsx
import { createInvitationAcceptedTemplate } from '../../../emails/_shared/invitation-accepted-shared.tsx';
export const InvitationAcceptedEmail = createInvitationAcceptedTemplate('prod');
```

### Option 2: Build-Time Synchronization
Use a script to automatically sync templates and transform imports.

#### Implementation:
```javascript
// scripts/sync-email-templates.js
const fs = require('fs');
const path = require('path');

function syncTemplate(devPath, prodPath) {
  let content = fs.readFileSync(devPath, 'utf8');
  
  // Transform imports for Deno
  content = content
    .replace(/from 'react'/g, "from 'npm:react@18.3.1'")
    .replace(/from '@react-email\/components'/g, "from 'npm:@react-email/components@0.0.22'");
  
  // Ensure production directory exists
  fs.mkdirSync(path.dirname(prodPath), { recursive: true });
  
  // Write to production location
  fs.writeFileSync(prodPath, content);
}

// Run sync for all templates
syncTemplate(
  'emails/invitation-accepted.tsx',
  'supabase/functions/send-invitation-accepted/_templates/invitation-accepted.tsx'
);
```

### Option 3: Symbolic Links (Development Only)
Use symbolic links to share templates (not recommended for production).

### Option 4: Single Source of Truth in Production
Keep only production templates and create development previews that import from production locations.

## Recommended Approach: Template Inheritance Pattern

### Advantages:
- ✅ Single source of truth for template logic
- ✅ Environment-specific optimizations
- ✅ Type safety maintained
- ✅ No build scripts required
- ✅ Clear separation of concerns

### Implementation Steps:

1. **Create shared template logic**:
   ```
   emails/_shared/
     invitation-accepted-core.tsx
     neighbor-invite-core.tsx
     welcome-email-core.tsx
     onboarding-core.tsx
   ```

2. **Create environment wrappers**:
   - Development wrappers in `/emails/`
   - Production wrappers in `supabase/functions/*/`

3. **Standardize props interface**:
   - Define common interfaces in shared files
   - Handle environment-specific props in wrappers

4. **URL generation strategy**:
   - Shared URL utility functions
   - Environment-specific URL generation

### Template Structure Example:
```typescript
// emails/_shared/invitation-accepted-core.tsx
interface CoreProps {
  accepterName: string;
  neighborhoodName: string;
  isAdminNotification: boolean;
  urls: {
    directory: string;
    dashboard: string;
  };
}

export const InvitationAcceptedCore = ({ accepterName, neighborhoodName, isAdminNotification, urls }: CoreProps) => {
  // All template logic here
  return (/* JSX */);
};

// emails/invitation-accepted.tsx (Development)
import { InvitationAcceptedCore } from './_shared/invitation-accepted-core';

export const InvitationAcceptedEmail = (props) => (
  <InvitationAcceptedCore 
    {...props}
    urls={{
      directory: 'https://neighborhoodos.com/neighbors',
      dashboard: 'https://neighborhoodos.com/dashboard'
    }}
  />
);

// supabase/functions/send-invitation-accepted/_templates/invitation-accepted.tsx (Production)
import { InvitationAcceptedCore } from '../../../emails/_shared/invitation-accepted-core.tsx';

export const InvitationAcceptedEmail = ({ directoryUrl, dashboardUrl, ...props }) => (
  <InvitationAcceptedCore 
    {...props}
    urls={{
      directory: directoryUrl,
      dashboard: dashboardUrl
    }}
  />
);
```

## Migration Plan

1. **Phase 1**: Implement template inheritance for invitation-accepted email
2. **Phase 2**: Migrate remaining templates to shared pattern
3. **Phase 3**: Create development preview environment
4. **Phase 4**: Add automated testing for template sync

## Benefits

- **Consistency**: Templates are always in sync
- **Maintainability**: Changes in one place update both environments
- **Type Safety**: Shared interfaces ensure consistency
- **Performance**: No runtime overhead for synchronization
- **Developer Experience**: Clear structure and easy to understand