# Development Checklists

These checklists help ensure documentation stays up-to-date and code quality remains high. Reference them when making changes to the codebase.

## When Adding a New Feature

Use this checklist when implementing a new feature or module:

### Planning Phase
- [ ] Is this feature well-defined and scoped?
- [ ] Have I reviewed existing patterns I should follow?
- [ ] Do I understand the data model and database schema?
- [ ] Have I identified which files and folders will be affected?

### Implementation Phase
- [ ] Created components in the appropriate feature folder
- [ ] Followed naming conventions (PascalCase components, camelCase files)
- [ ] Used TypeScript with proper type definitions
- [ ] Implemented proper error handling
- [ ] Used the routing utilities from `routes.ts` (no hardcoded paths)
- [ ] Used the toast utility from `toast.ts` (not the deprecated hook)
- [ ] Followed the data fetching patterns (useNeighborhoodQuery for neighborhood data)
- [ ] Added loading and error states for async operations
- [ ] Ensured mobile responsiveness
- [ ] Tested with different user roles (admin, member, guest)

### Documentation Phase
- [ ] Added JSDoc comments for complex functions
- [ ] Included inline comments explaining "why" not just "what"
- [ ] Updated ARCHITECTURE.md if it changes system design
- [ ] Added new terms to GLOSSARY.md if introducing new concepts
- [ ] Updated relevant folder README if adding to a module
- [ ] Updated CONTRIBUTING.md if introducing new patterns/conventions

### Testing Phase
- [ ] Tested the feature manually in development
- [ ] Tested edge cases and error scenarios
- [ ] Checked browser console for errors
- [ ] Verified no new linter errors
- [ ] Tested with different data states (empty, loading, error, populated)
- [ ] Tested authentication and authorization

### Pre-PR Phase
- [ ] Reviewed my own code
- [ ] Removed console.logs and debug code
- [ ] Committed with a clear, descriptive message
- [ ] No commented-out code left behind
- [ ] Environment variables documented if added
- [ ] No sensitive data (keys, tokens) in code

---

## When Refactoring Code

Use this checklist when refactoring existing code:

### Planning Phase
- [ ] Identified the scope of refactoring
- [ ] Understood why the refactor is needed
- [ ] Created a backup or committed current working state
- [ ] Identified all files that will be affected

### Refactoring Phase
- [ ] Made incremental changes (small, testable steps)
- [ ] Maintained or improved existing functionality
- [ ] Updated import statements in affected files
- [ ] Updated route references if routes changed
- [ ] Maintained backward compatibility where needed
- [ ] Improved type safety where possible

### Documentation Phase
- [ ] Updated documentation to reflect new structure
- [ ] Updated comments in changed files
- [ ] Checked if examples in docs still work
- [ ] Updated ARCHITECTURE.md if changing system design
- [ ] Updated component READMEs if folder structure changed
- [ ] Updated CONTRIBUTING.md if patterns changed

### Testing Phase
- [ ] Tested all affected features still work
- [ ] Verified no regressions in related features
- [ ] Checked for new linter errors
- [ ] Tested with different user scenarios

### Cleanup Phase
- [ ] Removed old, unused files
- [ ] Removed dead code
- [ ] Updated or removed outdated comments
- [ ] Consolidated duplicate code

---

## Before Each Pull Request

Use this checklist before opening a PR:

### Code Quality
- [ ] Code follows the conventions in CONTRIBUTING.md
- [ ] All functions and components have proper TypeScript types
- [ ] No `any` types unless absolutely necessary (with comment explaining why)
- [ ] No hardcoded values that should be constants or env variables
- [ ] No console.logs or debug code left in
- [ ] Code is readable and well-organized
- [ ] Complex logic has explanatory comments

### Testing
- [ ] Feature works as expected in development
- [ ] Tested in different browsers (if frontend change)
- [ ] Tested responsive behavior on mobile
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Checked browser console for warnings/errors

### Documentation
- [ ] Have I added/updated any domain concepts? → Update GLOSSARY.md
- [ ] Have I changed architecture or system design? → Update ARCHITECTURE.md
- [ ] Have I added new coding conventions or patterns? → Update CONTRIBUTING.md
- [ ] Have I added complex logic? → Add code comments explaining why
- [ ] Have I changed folder structure? → Update relevant README files
- [ ] Have I added new environment variables? → Update README.md and document them
- [ ] Will future developers understand this in 6 months?

### Git Hygiene
- [ ] Clear, descriptive commit messages
- [ ] No unrelated changes included
- [ ] No merge conflicts
- [ ] Branch is up to date with main/master
- [ ] Commit history is clean (consider squashing if messy)

### Security & Performance
- [ ] No sensitive data (API keys, passwords) in code or commits
- [ ] Proper authentication checks in place
- [ ] Proper authorization (RLS policies) considered
- [ ] No obvious performance issues (N+1 queries, unnecessary re-renders)
- [ ] Large lists are paginated or virtualized
- [ ] Images are optimized

### Edge Functions (if applicable)
- [ ] Tested locally with `supabase functions serve`
- [ ] Environment variables are documented
- [ ] Error handling is comprehensive
- [ ] Proper logging for debugging
- [ ] Rate limiting considered if needed
- [ ] Tested email templates render correctly

---

## When Adding/Modifying Email Templates

Use this checklist for email-related changes:

### Template Development
- [ ] Used React Email components from `@react-email/components`
- [ ] Followed unified email system conventions (see docs/unified-email-system.md)
- [ ] Used proper TypeScript interfaces for props
- [ ] Included UTM parameters in all links (via urlGenerator)
- [ ] Tested template rendering locally
- [ ] Checked mobile email client rendering
- [ ] Ensured images load properly (consider proxy)
- [ ] Brand colors and fonts are consistent

### Email Function
- [ ] Edge function properly renders template
- [ ] Error handling for failed sends
- [ ] Proper logging to email_logs table
- [ ] Respects user email preferences
- [ ] Handles missing data gracefully
- [ ] Uses appropriate email type (transactional vs digest)

### Testing
- [ ] Tested with test script (scripts/test-email-sending.js)
- [ ] Generated preview HTML (scripts/preview-newsletter.js)
- [ ] Sent test email to real address
- [ ] Checked spam score if possible
- [ ] Verified all links work
- [ ] Tested in multiple email clients (Gmail, Outlook, Apple Mail)

### Documentation
- [ ] Updated email system documentation if workflow changed
- [ ] Documented template props and usage
- [ ] Added example usage in Edge function

---

## When Modifying the Database

Use this checklist for database schema changes:

### Planning
- [ ] Understand impact on existing data
- [ ] Considered backward compatibility
- [ ] Planned migration strategy
- [ ] Identified all code that touches affected tables

### Migration
- [ ] Created migration file in supabase/migrations/
- [ ] Migration has proper timestamp prefix
- [ ] Migration is idempotent (can run multiple times safely)
- [ ] Added appropriate indexes for performance
- [ ] Updated RLS policies if needed
- [ ] Tested migration locally
- [ ] Tested rollback if possible

### Code Updates
- [ ] Updated TypeScript types (regenerate Supabase types)
- [ ] Updated all queries that touch affected tables
- [ ] Updated services and hooks
- [ ] Updated components that display this data

### Documentation
- [ ] Updated ARCHITECTURE.md with schema changes
- [ ] Added comments in migration file
- [ ] Documented any new tables/columns in relevant docs
- [ ] Updated GLOSSARY.md if new concepts introduced

---

## When Onboarding to the Project

Checklist for new developers joining the project:

### Setup
- [ ] Cloned repository
- [ ] Installed dependencies (npm install or bun install)
- [ ] Set up environment variables (.env file)
- [ ] Connected to Supabase project
- [ ] Verified dev server runs (npm run dev)

### Documentation Reading
- [ ] Read README.md
- [ ] Read CONTRIBUTING.md
- [ ] Read ARCHITECTURE.md
- [ ] Skimmed GLOSSARY.md (bookmark for reference)
- [ ] Reviewed folder structure (src/README.md)

### First Contributions
- [ ] Found a good first issue or small task
- [ ] Made a small change to get familiar with workflow
- [ ] Asked questions when stuck
- [ ] Followed the PR checklist for first PR

---

## Monthly Documentation Maintenance

Checklist for periodic documentation reviews (do monthly or quarterly):

### Review Phase
- [ ] Read through README.md - is it still accurate?
- [ ] Review ARCHITECTURE.md - any outdated sections?
- [ ] Check GLOSSARY.md - missing terms? Outdated definitions?
- [ ] Scan CONTRIBUTING.md - new patterns that should be documented?
- [ ] Review folder READMEs - match current structure?

### Update Phase
- [ ] Update outdated information
- [ ] Add missing documentation
- [ ] Remove documentation for deleted features
- [ ] Fix broken links
- [ ] Update examples to reflect current code

### Quality Phase
- [ ] Check for broken images or diagrams
- [ ] Verify code examples still work
- [ ] Ensure formatting is consistent
- [ ] Fix typos and grammar issues

---

## When Preparing for Release/Deployment

Use this checklist before deploying to production:

### Pre-Deployment
- [ ] All tests passing
- [ ] No critical bugs or issues
- [ ] Environment variables set in production
- [ ] Database migrations applied to production
- [ ] Edge Functions deployed to production
- [ ] Verified Resend API key is active
- [ ] Email templates tested in production
- [ ] Cron jobs configured correctly

### Deployment
- [ ] Create deployment branch if needed
- [ ] Tag release with version number
- [ ] Deploy frontend (Netlify auto-deploys on push)
- [ ] Deploy Edge Functions (supabase functions deploy)
- [ ] Monitor deployment logs for errors

### Post-Deployment
- [ ] Verify app loads in production
- [ ] Test critical user flows
- [ ] Check error monitoring for new issues
- [ ] Verify emails are sending correctly
- [ ] Monitor database performance
- [ ] Update CHANGELOG if maintained

### Rollback Plan
- [ ] Know how to rollback if issues arise
- [ ] Have previous version deployed and accessible
- [ ] Can revert database migrations if needed

---

## Tips for Using These Checklists

1. **Don't skip steps** - Even if you think you know, go through the checklist
2. **Copy to your PR description** - Include relevant checklist in PR body
3. **Customize as needed** - Add project-specific items as patterns emerge
4. **Review periodically** - Update checklists as processes improve
5. **Share with team** - Make sure everyone knows these exist

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Detailed coding conventions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
- [GLOSSARY.md](./GLOSSARY.md) - Domain terminology
- [README.md](../README.md) - Project overview and setup

