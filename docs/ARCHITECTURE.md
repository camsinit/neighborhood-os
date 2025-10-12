# neighborhoodOS Architecture

## Overview

neighborhoodOS is a full-stack web application built as a **React SPA (Single Page Application)** with a **Supabase backend**. The architecture follows a modern, serverless approach with:

- **Frontend**: React app served as static files
- **Backend**: Supabase PostgreSQL database + Edge Functions
- **Email**: Automated email system using React Email templates and Resend
- **Authentication**: Supabase Auth with JWT tokens

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React SPA (Vite + React Router)         │   │
│  │  - Components  - Hooks  - State Management      │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/WebSocket
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Cloud                        │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │  PostgreSQL  │  │  Auth Service │  │    Edge     │ │
│  │   Database   │  │   (JWT-based) │  │  Functions  │ │
│  └──────────────┘  └───────────────┘  └─────────────┘ │
│         │                                      │         │
└─────────┼──────────────────────────────────────┼─────────┘
          │                                      │
          └──────────────┬───────────────────────┘
                         ▼
                  ┌──────────────┐
                  │    Resend    │
                  │ (Email API)  │
                  └──────────────┘
```

## Core Concepts

### Neighborhoods

A **Neighborhood** is the primary organizational unit in the system. Each neighborhood represents a geographic community and has:

- **Members** (Neighbors): Users who belong to the neighborhood
- **Physical Units**: Actual addresses/buildings in the neighborhood
- **Modules**: Feature areas enabled for the neighborhood
- **Settings**: Neighborhood-specific configuration (timezone, privacy settings, etc.)

### Neighbors

A **Neighbor** is a user who is a member of one or more neighborhoods. Neighbors can:
- Have profiles with contact information and bio
- Belong to multiple neighborhoods
- Have different roles in different neighborhoods (member, admin)
- Opt in/out of email notifications per neighborhood

### Modules

**Modules** are feature areas within a neighborhood. Each module can be enabled/disabled:

- **Events** (`/calendar`): Community calendar with RSVPs
- **Skills** (`/skills`): Directory of neighbor talents and services
- **Directory** (`/neighbors`): People directory with profiles and groups
- **Updates** (`/home`): News feed and announcements
- **Goods** (`/goods`): Share and borrow items (future)
- **Safety** (`/safety`): Safety alerts and resources (future)

### Physical Units

A **Physical Unit** represents an actual address or building in a neighborhood. Multiple neighbors can be associated with the same physical unit (e.g., roommates, family members).

## Database Schema Overview

### Key Tables

**Core Tables:**
- `profiles`: User profiles (one per user, shared across neighborhoods)
- `neighborhoods`: Neighborhood information
- `neighborhood_members`: Many-to-many relationship between users and neighborhoods
- `physical_units`: Addresses/buildings within neighborhoods

**Module Tables:**
- `events`: Calendar events
- `event_rsvps`: Event attendance tracking
- `skills`: Neighbor skills and services
- `groups`: Interest groups within neighborhoods
- `group_members`: Group membership
- `updates`: Community posts and announcements

**Email Tables:**
- `email_queue`: Outgoing email queue
- `email_logs`: Email delivery tracking
- `digest_subscriptions`: Weekly digest preferences

**Relationships:**
- Users → Profiles (1:1)
- Neighborhoods ↔ Members (many-to-many via `neighborhood_members`)
- Neighborhoods → Physical Units (1:many)
- Neighborhoods → Events/Skills/Groups (1:many)
- Events → RSVPs (1:many)
- Groups → Members (many-to-many via `group_members`)

## Authentication Flow

### User Authentication (Supabase Auth)

1. **Sign Up**: User creates account via email/password
2. **Email Verification**: Supabase sends confirmation email
3. **Sign In**: Returns JWT access token + refresh token
4. **Token Management**: Tokens stored in localStorage, auto-refreshed
5. **Session Persistence**: Session maintained across page reloads

### Authorization (Row-Level Security)

Supabase RLS (Row-Level Security) policies enforce data access:

- **Profile Access**: Users can read their own profile and profiles of neighbors in shared neighborhoods
- **Neighborhood Data**: Only members can access neighborhood content
- **Admin Actions**: Certain operations require admin role in the neighborhood
- **Privacy Settings**: Respect user privacy preferences (e.g., hidden profiles)

### Protected Routes

Frontend uses `ProtectedRoute` and `NeighborhoodAwareProtectedRoute` components:

```typescript
// Requires authentication
<ProtectedRoute><ProfilePage /></ProtectedRoute>

// Requires authentication + neighborhood membership
<NeighborhoodAwareProtectedRoute>
  <NeighborhoodCalendar />
</NeighborhoodAwareProtectedRoute>
```

## Frontend Routing System

### Neighborhood-Scoped Paths

Routes follow the pattern: `/n/{neighborhoodId}/{module}`

Examples:
- `/n/abc123/calendar` - Neighborhood calendar
- `/n/abc123/skills` - Neighborhood skills directory
- `/n/abc123/neighbors` - Neighbor directory

### Route Management

All routes are centralized in `src/utils/routes.ts`:

```typescript
// Base routes (without neighborhood prefix)
BASE_ROUTES = {
  home: '/home',
  calendar: '/calendar',
  skills: '/skills',
  neighbors: '/neighbors',
  // ...
}

// Helper to build neighborhood-aware paths
neighborhoodPath('/calendar', neighborhoodId) 
// → '/n/abc123/calendar'
```

**Why this matters:**
- Never hardcode paths like `'/calendar'` in components
- Always use `BASE_ROUTES.calendar` or `neighborhoodPath()`
- Makes it easy to refactor route structure later

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed routing conventions.

## Email System Architecture

### Email Types

1. **Transactional Emails**: Triggered by user actions
   - Welcome emails (new user signup)
   - Invitations (neighbor invites another person)
   - Invitation accepted notifications
   - Onboarding series

2. **Digest Emails**: Scheduled weekly summaries
   - Weekly neighborhood digest (Sundays at 9 AM local time)
   - Activity summaries

### Email Flow

```
User Action → Database Trigger → Email Queue → Edge Function → Resend API → User's Inbox
```

**Detailed Flow:**

1. **Trigger**: User action (e.g., sending invitation) or cron job
2. **Email Queue**: Record inserted into `email_queue` table
3. **Processing**: Edge Function (`process-email-queue`) picks up pending emails
4. **Template Rendering**: React Email template rendered to HTML
5. **Send**: Resend API sends email
6. **Logging**: Result logged to `email_logs` table

### React Email Templates

Email templates are React components located in `/emails`:

- `welcome-email.tsx`: New user welcome
- `basic-invitation.tsx`: Neighborhood invitation
- `invitation-accepted.tsx`: Notification that invitation was accepted
- `weekly-summary.tsx`: Weekly digest email
- Onboarding series: Multiple step-by-step emails

**Template System:**
- Type-safe props using TypeScript interfaces (see `src/types/emailTypes.ts`)
- Unified parameter resolution (names, URLs, UTM tracking)
- Consistent styling and branding
- See [docs/unified-email-system.md](./unified-email-system.md) for details

### Edge Functions for Email

Key email-related Edge Functions in `supabase/functions/`:

- `send-welcome-email`: Sends welcome email to new users
- `send-invitation`: Sends neighborhood invitation
- `send-invitation-accepted`: Notifies inviter of acceptance
- `send-weekly-summary-final`: Generates and sends weekly digest
- `schedule-weekly-digests`: Cron job that schedules digests
- `process-email-queue`: Processes queued emails

## Newsletter/Digest System

### Weekly Digest Schedule

- **Frequency**: Once per week, every Sunday
- **Time**: 9:00 AM in the neighborhood's local timezone
- **Content**: Summary of past week's activity (events, skills, new members, updates)

### Digest Flow

1. **Cron Job**: `schedule-weekly-digests` runs every hour via Supabase cron
2. **Check Time**: For each neighborhood, check if it's Sunday 9:00 AM local time
3. **Generate Digest**: Call `send-weekly-summary-final` Edge Function
4. **Fetch Data**: Aggregate past week's events, skills, updates, new members
5. **Filter Recipients**: Get all members with digest enabled
6. **Render Template**: Generate HTML from `weekly-summary.tsx`
7. **Send Emails**: Send via Resend API
8. **Track**: Log all sends in `email_logs`

### Digest Preferences

Users can control digest settings per neighborhood:
- Enable/disable weekly digest
- Stored in `digest_subscriptions` table
- Managed via user settings (`/settings/notifications`)

## State Management

### React Query (TanStack Query)

Primary data fetching and caching layer:

```typescript
// Example: Fetching neighborhood events
const { data: events } = useQuery({
  queryKey: ['events', neighborhoodId],
  queryFn: () => fetchEvents(neighborhoodId),
})
```

**Benefits:**
- Automatic caching and background refetching
- Loading and error states built-in
- Optimistic updates for mutations
- Request deduplication

**Key Pattern**: `useNeighborhoodQuery` hook (see `src/hooks/useNeighborhoodQuery.ts`)
- Automatically injects neighborhoodId into query key
- Gates execution until neighborhoodId is available
- Standardizes neighborhood-scoped data fetching

### Zustand

Used for simple global state:
- UI state (sidebar open/closed, modals)
- User preferences
- Lightweight alternative to Redux

### React Context

Used for:
- `NeighborhoodContext`: Current neighborhood context
- `SkillsContext`: Skills-specific state
- Authentication state (via Supabase hooks)

## Data Fetching Patterns

### Standard Pattern

```typescript
// 1. Use neighborhood-aware query hook
const { data, isLoading, error } = useNeighborhoodQuery(
  ['events'], // base key
  (neighborhoodId) => supabase
    .from('events')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
);

// 2. Query key becomes: ['events', neighborhoodId]
// 3. Query only runs when neighborhoodId exists
```

### Mutations

```typescript
const mutation = useMutation({
  mutationFn: (newEvent) => createEvent(newEvent),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['events', neighborhoodId]);
    showSuccessToast('Event created!');
  },
});
```

## Deep Linking and Highlighting

### URL Parameters for Detail Views

The app supports deep links to specific items:

- `?detail={itemId}&type={itemType}` - Opens detail view for an item
- Legacy: `?highlight={itemId}` - Still supported for compatibility

**Example:**
`/n/abc123/calendar?detail=event123&type=event` opens event detail sheet

### Highlighting Elements

Components can be highlighted with data attributes:

```tsx
<div data-event-id={event.id}>Event content</div>
```

The `ItemNavigationService` handles deep link params and scrolls to highlighted elements.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## Logging and Debugging

### Logger Utility

Centralized logging via `src/utils/logger.ts`:

```typescript
const logger = createLogger('MyComponent');
logger.info('Something happened');
logger.error('Error occurred', error);
```

**Debug Mode**: Add `?debug=true` to URL to enable verbose logging in console.

### Error Handling

- `ErrorBoundary` component catches React errors
- Toast notifications for user-facing errors
- Supabase function logs for backend errors
- Email logs table for email delivery tracking

## Performance Considerations

- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: Responsive images via Vite
- **Query Caching**: React Query reduces redundant API calls
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Database Indexes**: Proper indexes on frequently queried columns

## Security

- **Authentication**: JWT-based with Supabase Auth
- **Authorization**: Row-Level Security (RLS) policies in PostgreSQL
- **API Keys**: Environment variables, never in code
- **CORS**: Configured in Supabase Edge Functions
- **Input Validation**: Zod schemas for form validation
- **XSS Prevention**: React's built-in escaping + DOMPurify where needed

## Deployment

### Frontend (Netlify)

- **Build**: `npm run build` → `/dist` folder
- **Deploy**: Push to `main` branch → Netlify auto-deploys
- **Environment**: Environment variables set in Netlify dashboard

### Backend (Supabase)

- **Database Migrations**: Applied via Supabase CLI or dashboard
- **Edge Functions**: Deployed via Supabase CLI
  ```bash
  supabase functions deploy function-name
  ```
- **Cron Jobs**: Configured in Supabase dashboard

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Coding conventions
- [GLOSSARY.md](./GLOSSARY.md) - Domain terminology
- [unified-email-system.md](./unified-email-system.md) - Email template system
- [src/README.md](../src/README.md) - Frontend structure
- [supabase/functions/README.md](../supabase/functions/README.md) - Edge Functions

