# NeighborhoodOS - Cursor AI Documentation

## Project Overview

NeighborhoodOS is a React-based neighborhood management application built with modern web technologies. It enables local communities to organize events, share skills, exchange goods, post safety updates, and connect with neighbors through a cohesive digital platform.

## Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for build tooling and development server
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **Lucide React** for icons
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **React Query** for data fetching and caching
- **Zustand** for state management

### Backend & Database
- **Supabase** for backend services
  - Authentication and user management
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions for serverless functions
  - Storage for file uploads
- **Resend** for email services
- **React Email** for email templates

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **Lovable** for AI-assisted development
- **CodeRabbit** for pull request reviews

## Architecture Overview

### Application Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI base components
│   ├── auth/           # Authentication related components
│   ├── layout/         # Layout components (MainLayout, ModuleLayout)
│   ├── settings/       # Settings page components
│   ├── skills/         # Skills module components
│   ├── goods/          # Goods exchange components
│   ├── safety/         # Safety updates components
│   ├── calendar/       # Calendar/events components
│   ├── neighborhoods/  # Neighborhood management components
│   ├── admin/          # Admin panel components
│   └── debug/          # Debug/development tools
├── contexts/           # React contexts
│   └── neighborhood/   # Neighborhood context provider
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── supabase/      # Supabase client and types
├── pages/              # Page components
├── theme/              # Theme configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Architectural Patterns

#### 1. Module-Based Architecture
Each major feature (Calendar, Skills, Goods, Safety, Neighbors) is organized as a module with:
- Main page component in `src/pages/`
- Supporting components in `src/components/[module]/`
- Theme configuration in `src/theme/moduleTheme.ts`
- Consistent styling via `ModuleLayout` component

#### 2. Context-Based State Management
- **NeighborhoodProvider**: Manages current neighborhood state
- **SessionContextProvider**: Handles Supabase authentication
- **QueryClient**: Manages server state and caching

#### 3. Protected Routing
- `ProtectedRoute` component ensures authentication
- `SuperAdminRoute` for admin-only pages
- Automatic redirection based on user state (onboarding, neighborhood membership)

#### 4. Row Level Security (RLS)
All database operations use Supabase RLS policies to ensure users can only access data within their neighborhood and own records.

## Core Features

### 1. Authentication & Onboarding
- User registration and login via Supabase Auth
- Multi-step onboarding process
- Guest mode for neighborhood joining
- Skills onboarding with mini-survey

### 2. Neighborhood Management
- Create and join neighborhoods via invite codes
- Neighborhood switching for super admins
- Member management and roles
- Invitation system with email notifications

### 3. Skills Exchange
- Post skill offers and requests
- Category-based organization
- Time slot scheduling system
- Search and filtering capabilities

### 4. Goods Exchange
- Share items and post requests
- Image upload support
- Category and urgency filtering
- Neighborhood-specific visibility

### 5. Safety Updates
- Post safety-related information
- Type-based categorization (Emergency, Suspicious Activity, etc.)
- Commenting system
- Real-time notifications

### 6. Calendar/Events
- Create and manage community events
- RSVP system
- Recurring events support
- Timezone handling

### 7. Activity Feed
- Real-time updates on neighborhood activities
- Activity types: events, skills, goods, safety, new neighbors
- Engagement tracking

## Database Schema

### Core Tables
- `profiles` - User profile information
- `neighborhoods` - Neighborhood data
- `neighborhood_members` - User-neighborhood relationships
- `events` - Community events
- `skills_exchange` - Skills offers and requests
- `goods_exchange` - Goods sharing and requests
- `safety_updates` - Safety-related posts
- `activities` - Activity feed entries
- `notifications` - User notifications

### Key Relationships
- Users belong to neighborhoods through `neighborhood_members`
- All content is scoped to neighborhoods
- Activities are generated from content creation
- Notifications are triggered by user interactions

### Important Database Functions
- `get_user_current_neighborhood()` - Get user's current neighborhood
- `is_user_in_neighborhood()` - Check neighborhood membership
- `create_unified_system_notification()` - Create notifications
- `get_neighborhood_members_with_profiles()` - Get neighborhood members
- `check_user_role()` - Check user permissions

## Component Patterns

### 1. Module Layout Pattern
```typescript
<ModuleLayout
  title="Module Name"
  description="Module description"
  themeColor="skills"
  showSkillsOnboardingOverlay={needsOnboarding}
  onSkillsOnboardingComplete={handleComplete}
>
  {/* Module content */}
</ModuleLayout>
```

### 2. Data Fetching Pattern
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['skills', neighborhoodId],
  queryFn: () => fetchSkills(neighborhoodId),
  enabled: !!neighborhoodId
});
```

### 3. Form Handling Pattern
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {}
});
```

### 4. Error Handling Pattern
```typescript
// All components are wrapped in ErrorBoundary
// Custom error logging in utils/logger.ts
// Toast notifications for user feedback
```

## Authentication Flow

1. **Landing Page** (`/`) - Public marketing page
2. **Login** (`/login`) - Authentication form
3. **Onboarding** (`/onboarding`) - New user setup
4. **Join** (`/join/:inviteCode`) - Neighborhood joining
5. **Dashboard** (`/dashboard`) - Entry point that redirects to appropriate page
6. **Home** (`/home`) - Main dashboard after authentication

### Route Protection
- `ProtectedRoute` - Requires authentication
- `SuperAdminRoute` - Requires super admin role
- Automatic redirects based on user state

## Key Hooks

### Authentication
- `useUser()` - Get current user from Supabase
- `useSessionContext()` - Session state management

### Data Fetching
- `useCurrentNeighborhood()` - Get current neighborhood
- `useQuery()` - Server state management
- `useMutation()` - Server state mutations

### Custom Hooks
- `useOnboardingStatus()` - Check if user needs onboarding
- `useGuestOnboardingMode()` - Handle guest mode
- `useSkillsManagement()` - Skills CRUD operations

## Styling & Theming

### Theme System
- Module-specific colors defined in `moduleTheme.ts`
- CSS variables for dynamic theming in `index.css`
- Consistent gradients and color schemes
- HSL color format required for all colors

### Design System
```css
/* Example from index.css */
:root {
  --primary: 212 92% 32%;
  --secondary: 210 40% 98%;
  --accent: 210 40% 98%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
}
```

### Component Styling Rules
- **ALWAYS** use semantic tokens from design system
- **NEVER** use direct colors like `text-white`, `bg-blue-500`
- Use Tailwind CSS utility classes with semantic tokens
- Shadcn/UI components for consistency
- Custom animations with Framer Motion

## Development Guidelines

### Code Organization
1. Keep components small and focused
2. Use TypeScript for type safety
3. Follow the established pattern for state management
4. Implement proper loading and error states
5. Add thorough inline comments explaining complex logic

### Performance Considerations
- Use React Query for caching and background updates
- Implement proper loading states with skeletons
- Optimize database queries with RLS
- Use ErrorBoundary for graceful error handling
- Minimize bundle size with lazy loading

### Security Best Practices
- All data access through RLS policies
- Input validation with Zod schemas
- Secure authentication flows
- Proper error handling without exposing sensitive data
- Test with user ID: `74bf3085-8275-4eb2-a721-8c8e91b3d3d8`
- Test with neighborhood ID: `c0e4e442-74c1-4b34-8388-b19f7b1c6a5d`

## Testing & Debugging

### Debug Features
- Debug page (`/debug`) for super admins
- Console logging with configurable levels in `utils/logger.ts`
- Error boundary for graceful error handling
- Development-specific tooling

### Monitoring
- Error tracking in ErrorBoundary
- Authentication state logging
- Query state monitoring via React Query DevTools

## Environment & Configuration

### Required Environment Variables
- Supabase URL and anon key (configured in client)
- Resend API key for email services
- Development vs production configurations

### Build Configuration
- Vite for development and production builds
- TypeScript configuration with strict mode
- Tailwind CSS configuration with design tokens
- ESLint rules for code quality

## Edge Functions

Supabase Edge Functions handle:
- Email sending via Resend
- Complex database operations
- Background tasks
- External API integrations

## State Management

### Global State
- **NeighborhoodContext**: Current neighborhood, switching logic
- **SessionContext**: User authentication state
- **QueryClient**: Server state with caching

### Local State
- React `useState` for component-specific state
- `useForm` for form state management
- URL state for filters and navigation

## Error Handling Strategy

### Graceful Degradation
- If AI features fail, show helpful static content
- Clear error messages without technical details
- Alternative actions users can take
- Server-side error logging for debugging
- Automatic retries for transient errors

### Privacy Best Practices
- Only send anonymized, aggregated data to AI
- Never share personal details (names, addresses, contact info)
- Focus on public information like event titles, skill categories
- Implement data minimization principles

## Common Patterns

### 1. Neighborhood-Scoped Data
```typescript
// Always check current neighborhood before fetching data
const { currentNeighborhood } = useCurrentNeighborhood();
const { data } = useQuery({
  queryKey: ['events', currentNeighborhood?.id],
  queryFn: () => fetchEvents(currentNeighborhood?.id),
  enabled: !!currentNeighborhood?.id
});
```

### 2. Role-Based Access Control
```typescript
// Check user roles before rendering admin features
const { data: userRole } = useQuery({
  queryKey: ['userRole', user?.id, currentNeighborhood?.id],
  queryFn: () => getUserRole(user?.id, currentNeighborhood?.id),
  enabled: !!user?.id && !!currentNeighborhood?.id
});
```

### 3. Loading States
```typescript
// Always provide loading states with skeletons
if (isLoading) {
  return <SkeletonLoader />;
}
```

## Contributing Guidelines

1. Follow the existing module pattern for new features
2. Add proper TypeScript types for all data structures
3. Include loading and error states in all components
4. Update documentation when adding new features
5. Test across different user roles and states
6. Consider mobile responsiveness (mobile-first approach)
7. Follow accessibility best practices (ARIA labels, keyboard navigation)
8. Use semantic HTML elements
9. Add thorough inline comments for complex logic
10. Implement proper form validation with Zod schemas

## Module Development Pattern

When adding a new module:

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Create module components in `src/components/[module]/`
4. Add theme colors to `src/theme/moduleTheme.ts`
5. Use `ModuleLayout` for consistent styling
6. Implement CRUD operations with React Query
7. Add proper error handling and loading states
8. Include search and filtering capabilities
9. Add responsive design considerations
10. Test with multiple user roles

This documentation provides a comprehensive understanding of the NeighborhoodOS codebase architecture, patterns, and development practices for effective AI-assisted development with Cursor.