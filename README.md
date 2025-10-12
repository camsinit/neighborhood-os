# neighborhoodOS

**A community management platform that helps neighbors connect, collaborate, and build stronger local communities.**

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/camsinit/neighborhood-os?utm_source=oss&utm_medium=github&utm_campaign=camsinit%2Fneighborhood-os&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## What is neighborhoodOS?

neighborhoodOS is a web application that brings neighborhoods together by providing tools for:
- **Community Calendar** - Share and discover local events
- **Skills Directory** - Find neighbors who can help with tasks or teach new skills
- **Neighbor Directory** - Connect with people in your neighborhood
- **Groups & Updates** - Create interest groups and share community news
- **Weekly Digest** - Automated email summaries of neighborhood activity

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI primitives with shadcn/ui, Tailwind CSS
- **State Management**: TanStack Query (React Query), Zustand, React Context
- **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
- **Email**: React Email templates with Resend
- **Routing**: React Router v6
- **Build**: Vite with SWC

## Quick Start

### Prerequisites
- Node.js 18+ (recommend using nvm)
- npm or bun package manager
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/camsinit/neighborhood-os.git
cd neighborhood-os

# Install dependencies
npm install
# or
bun install

# Set up environment variables
# Create a .env file with:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

### Running the Development Server

```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
/
├── src/                      # Frontend React application
│   ├── components/          # React components organized by feature
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Top-level page components
│   ├── utils/               # Utility functions and helpers
│   ├── types/               # TypeScript type definitions
│   ├── services/            # Business logic and API services
│   └── contexts/            # React Context providers
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   └── migrations/          # Database migrations
├── emails/                  # React Email templates
├── scripts/                 # Utility scripts for testing and automation
├── docs/                    # Documentation
└── public/                  # Static assets
```

## Key Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Coding conventions and architecture decisions
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design
- **[docs/GLOSSARY.md](./docs/GLOSSARY.md)** - Domain terminology and concepts
- **[src/README.md](./src/README.md)** - Frontend code organization
- **[supabase/functions/README.md](./supabase/functions/README.md)** - Backend Edge Functions
- **[docs/CHECKLISTS.md](./docs/CHECKLISTS.md)** - Development checklists

## Environment Variables

Required environment variables (create a `.env` file):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: For local Supabase development
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Development Workflow

1. **Start with the docs**: Read [CONTRIBUTING.md](./CONTRIBUTING.md) for coding conventions
2. **Understand the architecture**: Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. **Learn the terminology**: Check [docs/GLOSSARY.md](./docs/GLOSSARY.md)
4. **Make your changes**: Follow the patterns in existing code
5. **Test locally**: Use scripts in `/scripts` for testing emails and functions
6. **Check the checklists**: Review [docs/CHECKLISTS.md](./docs/CHECKLISTS.md) before PRs

## Testing

```bash
# Test email sending (see scripts/README-email-testing.md)
node scripts/test-user-email.js [userId] [neighborhoodId]

# Preview newsletter
node scripts/preview-newsletter.js

# Other utility scripts available in /scripts
```

## Deployment

The application is deployed via Netlify (frontend) and Supabase (backend).

```bash
npm run build        # Creates optimized production build in /dist
```

## Contributing

We're in deep build mode right now, but we'll be pursuing making nOS fully open-source by Fall 2025.

For contributors, please read:
1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Coding standards and conventions
2. [docs/CHECKLISTS.md](./docs/CHECKLISTS.md) - Pre-PR checklist

## License

See [LICENSE](./LICENSE) file for details.

## Support

Until then,
Cam

---

**Note**: This is an active development project. Documentation and APIs may change frequently.
