# neighborhoodOS Glossary

This document defines key terms and concepts used throughout the neighborhoodOS codebase and documentation.

## Core Concepts

### Neighborhood
A **Neighborhood** is the primary organizational unit in neighborhoodOS. It represents a geographic community (e.g., "Maple Street Neighborhood", "Downtown Lofts").

**Key Properties:**
- Has a unique ID (UUID)
- Has a name and optional description
- Has geographic boundaries or address
- Has a timezone (for scheduling emails and events)
- Contains members (Neighbors)
- Contains physical units (addresses/buildings)
- Has enabled modules (Events, Skills, etc.)

**Why it matters:** All content in the app is scoped to a neighborhood. Users can be members of multiple neighborhoods.

### Neighbor
A **Neighbor** is a user who is a member of at least one neighborhood. The term emphasizes the community-oriented nature of the platform.

**Key Properties:**
- One profile per user (in `profiles` table)
- Can belong to multiple neighborhoods
- Has different roles in different neighborhoods (member, admin)
- Can have different notification preferences per neighborhood
- Associated with a physical unit (optional)

**In code:** Often referenced as `profile` or `user`, but conceptually represents a neighbor in the community.

### Profile
A user's **Profile** contains their personal information and is shared across all neighborhoods they belong to.

**Contains:**
- Display name, bio, profile photo
- Contact information (email, phone)
- Authentication details (managed by Supabase Auth)
- Privacy settings

**Important:** Profiles are global, but visibility is controlled by neighborhood membership and privacy settings.

## Modules

### Module
A **Module** is a feature area within a neighborhood that can be enabled or disabled. Think of modules as the different "sections" or "tools" available to a neighborhood.

**Available Modules:**
- Events (Calendar)
- Skills (Talent Directory)
- Directory (People & Groups)
- Updates (News Feed)
- Goods (Share & Borrow) - Coming soon
- Safety (Alerts & Resources) - Coming soon

**Why it matters:** Neighborhoods can customize which features they want to use by enabling/disabling modules.

### Events Module
The **Events** module provides a shared community calendar where neighbors can create, discover, and RSVP to local events.

**Features:**
- Create one-time or recurring events
- RSVP tracking
- Event posts and comments
- Event detail sheets

**Route:** `/calendar` or `/n/{neighborhoodId}/calendar`

### Skills Module
The **Skills** module is a directory of neighbor talents, services, and expertise. Neighbors can offer skills (teaching, helping) or request skills from others.

**Features:**
- Browse available skills
- Offer your own skills
- Request help with specific skills
- Schedule skill exchanges

**Route:** `/skills` or `/n/{neighborhoodId}/skills`

### Directory Module
The **Directory** module helps neighbors discover and connect with each other. It includes both individual profiles and interest-based groups.

**Features:**
- Browse neighbor profiles
- Create and join groups
- Physical unit directory

**Route:** `/neighbors` or `/n/{neighborhoodId}/neighbors`

### Updates Module
The **Updates** module is a community news feed where neighbors can share announcements, questions, and general neighborhood information.

**Route:** `/home` or `/n/{neighborhoodId}/home`

## Physical Units

### Physical Unit
A **Physical Unit** represents a real-world address or building within a neighborhood (e.g., "123 Maple Street", "Building A, Unit 4B").

**Why it exists:**
- Multiple neighbors can live at the same address
- Helps with geographic organization
- Used for neighborhood boundaries and verification

**Relationship:** A neighbor can be associated with one physical unit per neighborhood.

## Email & Communication

### Digest
A **Digest** (also called "Weekly Summary" or "Newsletter") is an automated email sent to neighbors summarizing recent neighborhood activity.

**Sent:**
- Once per week (Sundays)
- At 9:00 AM in the neighborhood's local timezone
- Only to neighbors who have opted in

**Contains:**
- Upcoming events
- New skills added
- New members
- Recent updates/posts

**In code:** Handled by `send-weekly-summary-final` Edge Function and `weekly-summary.tsx` template.

### Email Queue
The **Email Queue** is a database table that stores pending emails to be sent. This decouples email generation from email delivery.

**Flow:**
1. Action happens (e.g., invitation sent)
2. Record added to `email_queue` table
3. Edge Function processes queue
4. Email sent via Resend API
5. Result logged to `email_logs`

### Transactional Email
A **Transactional Email** is triggered by a specific user action (as opposed to scheduled digests).

**Examples:**
- Welcome email (after signup)
- Invitation email (when invited to neighborhood)
- Invitation accepted notification
- Onboarding series

## User Roles & States

### Neighborhood Member
A user who has accepted an invitation and has access to a neighborhood. Members can view and participate in all enabled modules.

### Neighborhood Admin
A special member role with additional permissions:
- Manage neighborhood settings
- Invite new members
- Moderate content
- Access admin dashboard

**In code:** Checked via `is_admin` field in `neighborhood_members` table.

### Waitlist User
A user who has signed up for the waitlist but hasn't been invited to any neighborhood yet.

**State:** Has an auth account but no neighborhood memberships.

## Technical Terms

### Edge Function
**Edge Functions** are serverless functions that run on Supabase's infrastructure (powered by Deno). They handle backend logic like sending emails, processing webhooks, and scheduled tasks.

**Location:** `supabase/functions/`

**Why "Edge"?** They run close to users geographically for low latency.

### RLS (Row-Level Security)
**RLS** is a PostgreSQL feature that enforces access control at the database row level. Each table has policies that determine which rows a user can access.

**Example Policy:** "Users can only see events in neighborhoods they're members of"

**Why it matters:** Security is enforced at the database level, not just in application code.

### React Query
**React Query** (officially TanStack Query) is a data fetching library used for:
- Fetching data from Supabase
- Caching responses
- Managing loading/error states
- Automatic refetching

**In code:** Uses `useQuery` and `useMutation` hooks.

### Deep Link
A **Deep Link** is a URL that opens the app to a specific item or view, not just a page.

**Example:** `/n/abc123/calendar?detail=event456&type=event` opens the app to a specific event's detail view.

### Neighborhood-Scoped Path
A URL pattern that includes the neighborhood ID: `/n/{neighborhoodId}/{module}`

**Why it matters:** Allows users to bookmark specific neighborhoods and keeps context clear.

**Example:** `/n/abc123/calendar` vs just `/calendar`

### UTM Parameters
**UTM Parameters** are URL tracking parameters added to links in emails to measure engagement.

**Example:** `?utm_source=email&utm_medium=digest&utm_campaign=weekly_summary`

**Why it matters:** Helps understand which emails are driving traffic.

## Data Patterns

### Query Key
In React Query, a **Query Key** uniquely identifies a cached query.

**Pattern:** `['resource', contextId]`

**Example:** `['events', neighborhoodId]` caches events for a specific neighborhood.

### Optimistic Update
An **Optimistic Update** is when the UI updates immediately (optimistically) before the server confirms the change.

**Example:** When you RSVP to an event, your name appears in the attendee list right away, before the API call completes.

**Why it matters:** Makes the app feel faster and more responsive.

### Mutation
A **Mutation** is any operation that creates, updates, or deletes data (as opposed to just reading it).

**In React Query:** Uses `useMutation` hook.

**Examples:**
- Creating an event
- Updating your profile
- Deleting a skill

## UI Concepts

### Sheet
A **Sheet** is a slide-in panel that appears from the side of the screen (usually right side) to show details about an item.

**Examples:**
- Event detail sheet
- Neighbor profile sheet
- Group detail sheet

**In code:** Uses Radix UI Dialog primitives with custom styling.

### Toast
A **Toast** is a temporary notification that appears (usually at bottom of screen) to provide feedback.

**Examples:**
- "Event created successfully!"
- "Error: Unable to send invitation"

**In code:** Uses Sonner library via `src/utils/toast.ts`.

### Dialog
A **Dialog** (or Modal) is an overlay that requires user interaction before proceeding.

**Examples:**
- Create event dialog
- Confirmation dialogs
- Settings dialog

### Popover
A **Popover** is a floating card anchored to an element, used for contextual information or actions.

**Examples:**
- Attendee list popover
- User profile preview popover

## Development Terms

### Seed Data
**Seed Data** is sample data inserted into the database for testing and development.

### Migration
A **Migration** is a versioned SQL script that modifies the database schema.

**Location:** `supabase/migrations/`

**Applied:** In order by timestamp prefix.

### Service Role Key
A **Service Role Key** is a Supabase API key with full database access, bypassing RLS. Used only in Edge Functions and backend scripts.

**Security:** Never expose in frontend code!

### Anon Key
The **Anon Key** (Anonymous Key) is a Supabase API key with limited permissions, respecting RLS policies. Safe to use in frontend code.

## Common Abbreviations

- **RLS**: Row-Level Security
- **RSVP**: Répondez s'il vous plaît (Please respond) - event attendance confirmation
- **UUID**: Universally Unique Identifier
- **UTM**: Urchin Tracking Module (URL parameters for analytics)
- **SPA**: Single Page Application
- **JWT**: JSON Web Token (used for authentication)
- **API**: Application Programming Interface
- **URL**: Uniform Resource Locator
- **UI**: User Interface
- **nOS**: neighborhoodOS (nickname for the platform)

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - How these concepts fit together in the system
- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to work with these concepts in code
- [unified-email-system.md](./unified-email-system.md) - Email-specific terminology

