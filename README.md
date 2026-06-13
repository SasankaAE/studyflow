# StudyFlow

StudyFlow is a web app for managing and interacting with academic PDFs through a chat-driven workflow.

## Project Status

The project is in MVP development.

- Core product surfaces are implemented.
- Main route structure is established for public, dashboard, admin, and API areas.
- Current effort is focused on integration hardening, reliability, and release readiness.

## What Exists Today

### User-Facing Pages

- Landing page
- Login page
- Signup page
- Dashboard home
- Dashboard chat
- Dashboard papers
- Dashboard settings

### Admin Pages

- Admin upload page

### API Areas

- Authentication: login, signup, logout, callback, delete account
- Chat: server chat route
- PDFs: upload, list, and download flow
- Billing: upgrade route

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (client/server integration)

## Folder Layout

app/

- Public pages and app routing
- Dashboard routes
- Admin routes
- API routes

components/

- Shared UI building blocks and page components

hooks/

- Feature hooks (plan, chat model config, PDFs, uploads)

lib/

- Shared utilities, plan metadata, usage helpers

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

Quality checks:

```bash
npm run lint
npm run typecheck
```

## Current Priorities

- Complete end-to-end flow between auth, PDFs, chat, and billing.
- Improve API and dashboard stability under real usage.
- Prepare MVP for broader user testing.

## Next Milestones

- Finalize feature-level error handling and UX feedback.
- Validate billing and access-control edge cases.
- Define and run a release checklist for first external rollout.
