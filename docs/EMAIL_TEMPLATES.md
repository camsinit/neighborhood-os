# 📧 Email Template System

This document explains how email templates work in neighborhoodOS and how to maintain them.

## 🏗️ Architecture Overview

### Single Source of Truth
- **`/emails/`** - All email templates are authored here using standard React/TypeScript
- **`supabase/functions/*//_templates/`** - Production templates with Deno-compatible imports
- **Sync Script** - Automatically transforms and copies templates from source to production

### Why This System?

1. **Developer Experience**: Write templates with familiar React imports and tooling
2. **Production Compatibility**: Automatically transform for Supabase Edge Functions (Deno)
3. **Consistency**: Single source prevents template drift
4. **Open Source Ready**: Clear separation between development and production files

## 📁 Directory Structure

```
├── emails/                          # 📝 SOURCE OF TRUTH - Edit these files
│   ├── basic-invitation.tsx         # Neighborhood invitation email
│   ├── welcome-email.tsx           # Welcome new neighbors
│   ├── invitation-accepted.tsx     # Confirmation when someone joins
│   ├── waitlist-welcome.tsx        # Beta waitlist welcome
│   ├── weekly-summary.tsx          # Weekly neighborhood digest
│   ├── onboarding-community.tsx    # Onboarding series (7 emails)
│   ├── onboarding-events.tsx
│   ├── onboarding-skills.tsx
│   ├── onboarding-care.tsx
│   ├── onboarding-goods.tsx
│   ├── onboarding-directory.tsx
│   └── onboarding-conclusion.tsx
│
├── supabase/functions/              # 🚀 PRODUCTION - Auto-generated
│   ├── send-invitation/_templates/
│   ├── send-welcome-email/_templates/
│   └── [other-functions]/_templates/
│
└── scripts/
    └── sync-email-templates.js      # 🔄 Sync script
```

## 🚀 Quick Start

### Development Workflow

1. **Edit templates in `/emails/`** - This is your source of truth
2. **Sync templates**: `npm run sync:templates`
3. **Test locally**: Email templates are now ready for edge functions

### Available Scripts

```bash
# Sync templates once (manual)
npm run sync:templates

# Watch mode - auto-sync when files change
npm run sync:templates:watch

# Full development with template sync
npm run dev:full

# Build with template sync (automatic)
npm run build
```

## ✏️ Adding New Email Templates

### Step 1: Create Template in `/emails/`

Create your template using standard React imports:

```typescript
// emails/my-new-email.tsx
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface MyEmailProps {
  userName: string;
  message: string;
}

export const MyEmail = ({ userName, message }: MyEmailProps) => (
  <Html>
    <Head />
    <Preview>Your preview text</Preview>
    <Body>
      <Container>
        <Heading>Hello {userName}!</Heading>
        <Text>{message}</Text>
      </Container>
    </Body>
  </Html>
);

export default MyEmail;
```

### Step 2: Update Template Mappings

Edit `scripts/sync-email-templates.js` and add your template to `TEMPLATE_MAPPINGS`:

```javascript
const TEMPLATE_MAPPINGS = {
  // ... existing mappings
  'my-new-email.tsx': ['my-edge-function'], // Maps to supabase/functions/my-edge-function/
};
```

### Step 3: Sync Templates

```bash
npm run sync:templates
```

Your template is now available at `supabase/functions/my-edge-function/_templates/my-new-email.tsx` with Deno-compatible imports!

## 🔄 How the Sync Works

### Import Transformation

The sync script automatically transforms imports for Deno compatibility:

**Source (`/emails/`):**
```typescript
import * as React from 'react';
import { Body, Container } from '@react-email/components';
```

**Production (`_templates/`):**
```typescript
import * as React from 'npm:react@18.3.1';
import { Body, Container } from 'npm:@react-email/components@0.0.22';
```

### Template Mapping

Each template can be mapped to multiple edge functions:

```javascript
'welcome-email.tsx': ['send-welcome-email', 'send-onboarding-email']
```

This copies the same template to multiple function directories.

## 🛠️ Troubleshooting

### Template Not Found Error
- Ensure template exists in `/emails/`
- Check `TEMPLATE_MAPPINGS` in sync script
- Run `npm run sync:templates` to re-sync

### Import Errors in Edge Functions
- Verify Deno import transformation worked correctly
- Check that all dependencies use `npm:` prefix
- Ensure version numbers match package.json

### Sync Script Issues
- Check Node.js version (requires Node 14+)
- Verify file permissions on `/emails/` directory
- Run with `--help` flag for usage information

## 📦 Integration with CI/CD

The sync process is automatically integrated into the build pipeline:

1. **Pre-build**: Templates are synced before every build
2. **Development**: Use watch mode for auto-sync during development
3. **Production**: All templates are current when deployed

## 🤝 Contributing

When contributing email templates:

1. **Only edit files in `/emails/`** - Never edit `_templates/` directly
2. **Test your changes**: Use `npm run sync:templates:watch` during development
3. **Follow naming conventions**: Use kebab-case for template files
4. **Update mappings**: Add new templates to sync script configuration
5. **Test edge functions**: Ensure templates work in Supabase environment

## 🔍 Best Practices

### Template Development
- Use TypeScript interfaces for props
- Include Preview text for email clients
- Test templates with real data
- Keep templates focused and reusable

### Styling
- Use inline styles for email compatibility
- Test across email clients
- Follow neighborhoodOS design system
- Use semantic HTML elements

### Performance
- Optimize images and assets
- Keep template size reasonable
- Use efficient React patterns
- Test rendering performance

## 📚 Resources

- [React Email Documentation](https://react.email/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Import Documentation](https://docs.deno.com/runtime/manual/basics/modules)
- [Email Client Compatibility](https://www.campaignmonitor.com/css/)

---

**Remember**: Always edit templates in `/emails/` and sync them to production. This keeps your codebase clean and contributor-friendly! 🎉
