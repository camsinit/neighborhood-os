# Frontend Source Code Guide

This directory contains all frontend React application code for neighborhoodOS.

## Folder Structure Overview

```
src/
├── components/        # React components (organized by feature)
├── pages/            # Top-level page components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions and helpers
├── types/            # TypeScript type definitions
├── services/         # Business logic and API services
├── contexts/         # React Context providers
├── integrations/     # Third-party integrations (Supabase)
├── notifications/    # Notification system
├── stores/           # Zustand stores
├── styles/           # Global CSS and style utilities
├── theme/            # Theme configuration
├── lib/              # Library setup and configuration
├── data/             # Static data and fixtures
└── main.tsx          # Application entry point
```

## Component Organization

### `/components` - Feature Components

Components are organized by domain/feature area, not by technical role. This makes it easier to find related code.

**Key Principles:**
- **Feature folders** contain all components for a specific module
- **Shared UI components** go in `/components/ui`
- **Complex features** get their own subfolder (e.g., `skills/`, `events/`)
- **Simple features** may have standalone files (e.g., `Header.tsx`)

**Structure:**
```
components/
├── ui/                  # Shared UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── auth/               # Authentication components
├── calendar/           # Calendar-specific components
├── skills/             # Skills module components
├── events/             # Events module components
├── neighbors/          # Neighbor directory components
├── groups/             # Groups feature components
├── settings/           # Settings pages components
├── onboarding/         # User onboarding flow
├── layout/             # Layout components (Header, Sidebar, etc.)
└── ...
```

**See [components/README.md](./components/README.md) for detailed component organization.**

### `/pages` - Route Components

Top-level components that correspond to routes. These are typically thin wrappers that compose feature components.

**Examples:**
- `Calendar.tsx` - Calendar page
- `Skills.tsx` - Skills directory page
- `Profile.tsx` - User profile page
- `Settings.tsx` - Settings page

**Pattern:**
```typescript
// Page component pulls together feature components
export default function CalendarPage() {
  return (
    <MainLayout>
      <CalendarHeader />
      <CalendarFilters />
      <CalendarView />
    </MainLayout>
  );
}
```

## State Management

### React Query (TanStack Query)

**Primary use:** Data fetching, caching, and synchronization

**Location:** Configured in `main.tsx`, used throughout components

**Key hook:** `useNeighborhoodQuery` in `/hooks/useNeighborhoodQuery.ts`
- Automatically scopes queries to the current neighborhood
- Handles loading and error states
- Provides caching and background refetching

**Example:**
```typescript
const { data: events, isLoading } = useNeighborhoodQuery(
  ['events'],
  (neighborhoodId) => fetchEvents(neighborhoodId)
);
```

### React Context

**Primary use:** Sharing state across component tree without prop drilling

**Key contexts:**
- `NeighborhoodContext` - Current neighborhood information
- `SkillsContext` - Skills module state
- Supabase Auth context - Authentication state

**Location:** `/contexts/`

### Zustand

**Primary use:** Simple global UI state

**When to use:** For state that doesn't need to be tied to React's render cycle or doesn't come from an API.

**Location:** `/stores/`

## Custom Hooks

The `/hooks` directory contains reusable React hooks. These encapsulate common patterns and logic.

**Key hooks:**
- `useNeighborhoodQuery.ts` - Neighborhood-scoped data fetching
- Various hooks for specific features (events, skills, etc.)

**Naming convention:** Always prefix with `use` (React requirement)

## Utilities

The `/utils` directory contains pure functions and helpers that don't depend on React.

**Key utilities:**
- `routes.ts` - Route definitions and helpers (SINGLE SOURCE OF TRUTH)
- `toast.ts` - Toast notification API
- `logger.ts` - Logging utility
- `emailConfig.ts` - Email configuration

**Important:** Never hardcode routes! Always import from `routes.ts`.

## Type Definitions

The `/types` directory contains TypeScript type definitions and interfaces.

**Key files:**
- `emailTypes.ts` - Email template interfaces
- `module.ts` - Module-related types
- `calendar.ts` - Calendar/event types
- `groups.ts` - Group types
- `roles.ts` - User role types
- `localTypes.ts` - Frontend-specific types

**Pattern:** Keep types close to where they're used, but extract to `/types` when shared across multiple files.

## Services

The `/services` directory contains business logic and API interaction code.

**Purpose:** Separate business logic from UI components

**Pattern:**
- Services should be independent of React
- Services handle API calls, data transformation, complex logic
- Components call services, not Supabase directly (where possible)

**Example:**
```typescript
// services/eventService.ts
export const createEvent = async (event: EventInput) => {
  // Validation, transformation, API call
};

// Component uses service
const handleCreateEvent = async (data) => {
  await createEvent(data);
};
```

## Supabase Integration

The `/integrations/supabase` directory contains Supabase client setup and type definitions.

**Key files:**
- `client.ts` - Supabase client instance
- `types.ts` - Auto-generated database types

**Usage:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data } = await supabase
  .from('events')
  .select('*')
  .eq('neighborhood_id', neighborhoodId);
```

## Styling

### Tailwind CSS

Primary styling approach using utility classes.

**Global styles:** `/styles` and `index.css`

**Component styles:** Inline Tailwind classes

**Customization:** `tailwind.config.ts` in project root

### Radix UI + shadcn/ui

UI primitives in `/components/ui` are from shadcn/ui (built on Radix UI).

**Characteristics:**
- Accessible by default
- Unstyled primitives styled with Tailwind
- Composable components

**Don't modify these directly** - compose them or create wrappers.

## Routing Conventions

### Neighborhood-Scoped Routes

Most routes include the neighborhood ID:

**Pattern:** `/n/{neighborhoodId}/{module}`

**Examples:**
- `/n/abc-123/calendar`
- `/n/abc-123/skills`
- `/n/abc-123/neighbors`

### Route Utilities

**Always use `src/utils/routes.ts`:**

```typescript
import { BASE_ROUTES, neighborhoodPath } from '@/utils/routes';

// Build a neighborhood-aware path
const calendarPath = neighborhoodPath(BASE_ROUTES.calendar, neighborhoodId);
// → '/n/abc-123/calendar'

// Link to it
<Link to={calendarPath}>Calendar</Link>
```

**Never do this:**
```typescript
// ❌ BAD - hardcoded path
<Link to="/calendar">Calendar</Link>

// ✅ GOOD - uses routes.ts
<Link to={neighborhoodPath(BASE_ROUTES.calendar, neighborhoodId)}>
  Calendar
</Link>
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete routing rules.

## Import Aliases

The project uses path aliases for cleaner imports:

**Configured in `tsconfig.json`:**
- `@/` maps to `src/`

**Usage:**
```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button';

// Instead of: import { supabase } from '../../integrations/supabase/client'
import { supabase } from '@/integrations/supabase/client';
```

## Key Patterns & Conventions

### 1. Data Fetching Pattern

```typescript
// Use neighborhood-aware query
const { data, isLoading, error } = useNeighborhoodQuery(
  ['resource-name'], // base query key
  (neighborhoodId) => {
    // Fetch function with neighborhood context
    return supabase
      .from('table')
      .select('*')
      .eq('neighborhood_id', neighborhoodId);
  }
);
```

### 2. Mutations Pattern

```typescript
const mutation = useMutation({
  mutationFn: async (newData) => {
    const { data, error } = await supabase
      .from('table')
      .insert(newData);
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['resource-name']);
    showSuccessToast('Success!');
  },
  onError: (error) => {
    showErrorToast('Something went wrong');
    console.error(error);
  },
});
```

### 3. Toast Notifications

```typescript
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Success
showSuccessToast('Event created!');

// Error
showErrorToast('Unable to save changes');
```

**Don't use** the old `use-toast` hook - use `toast.ts` instead.

### 4. Logging

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('ComponentName');

logger.info('Something happened', { data });
logger.error('Error occurred', error);
```

Add `?debug=true` to URL to see debug logs.

### 5. Protected Routes

```typescript
// Requires auth
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>

// Requires auth + neighborhood membership
<NeighborhoodAwareProtectedRoute>
  <CalendarPage />
</NeighborhoodAwareProtectedRoute>
```

## Common Tasks

### Adding a New Page

1. Create page component in `/pages/NewPage.tsx`
2. Add route in `App.tsx` with React Router
3. Add base route to `utils/routes.ts` if needed
4. Use appropriate layout wrapper

### Creating a New Component

1. Decide if it's UI primitive (→ `/components/ui`) or feature component
2. Create in appropriate feature folder
3. Use TypeScript for props
4. Follow existing patterns for state and data fetching

### Adding a New API Call

1. Consider creating a service in `/services` for complex logic
2. Use React Query for data fetching
3. Use `useNeighborhoodQuery` for neighborhood-scoped data
4. Handle loading and error states

### Adding Types

1. If specific to one feature, keep in that feature folder
2. If shared, add to `/types`
3. Export from index for easy imports

## Development Workflow

### Starting Development

```bash
npm run dev          # Start dev server
```

### Building

```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### Linting

```bash
npm run lint         # Run ESLint
```

## Debugging Tips

1. **Add `?debug=true` to URL** to enable verbose logging
2. **Use React DevTools** to inspect component state
3. **Use TanStack Query DevTools** (enabled in dev mode) to inspect cache
4. **Check Supabase logs** for backend errors
5. **Use browser Network tab** to inspect API calls

## File Naming Conventions

- **Components:** PascalCase (`EventCard.tsx`, `UserProfile.tsx`)
- **Hooks:** camelCase with `use` prefix (`useEvents.ts`)
- **Utils:** camelCase (`formatDate.ts`, `validation.ts`)
- **Types:** camelCase (`eventTypes.ts`) or descriptive (`calendar.ts`)
- **Styles:** kebab-case (`global-styles.css`)

## Related Documentation

- [components/README.md](./components/README.md) - Component organization details
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Coding conventions and rules
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [GLOSSARY.md](../docs/GLOSSARY.md) - Domain terminology

