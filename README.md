# PhotaLabs - AI Image Editing Playground

A mini AI image editing playground with mock image generation, character management, and generation history.

## How to run the project

Go to https://photalabs-web.vercel.app and use it directly with your email!

## Architecture Decisions

1. **Turborepo monorepo** - Parallel task execution, caching, clear separation of apps
2. **Convex for backend** - Real-time subscriptions, built-in file storage, type-safe queries
3. **Convex Auth with magic links** - Passwordless authentication via Resend
4. **Feature-based structure** - Co-located components, hooks, and tests per feature
5. **App Router with route groups** - `(authenticated)` group for protected pages
6. **CSS variables for design tokens** - Match Pencil design system colors via Tailwind

## What Would Improve With More Time

- UI and animation refinements
- Mobile-responsive design improvements
- Better looking sign-in page
- Real AI image generation with OpenAI DALL-E, Nano Banana or similar
- Explore section with community generations
- Image upscaling for download and sharing functionality
- Character style consistency improvements
- Pagination for history page
- Search functionality for characters and history

## Approximate Time Spent

5 hours.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex (real-time backend-as-a-service)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit tests for Convex), Playwright (E2E)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Monorepo**: Turborepo + pnpm workspaces

## Features

- **Magic Link Authentication**: Passwordless login via email magic links (Resend)
- **Character Management**: Create, edit, and delete AI characters with 3-5 reference images
- **Image Generation**: Generate images with prompts and @character mentions
- **Reference Images**: Upload reference images to guide generation
- **Generation History**: View past generations, restore to editor
- **Real-time Updates**: Live data sync powered by Convex
- **Dark Theme**: Beautiful dark UI matching Pencil designs

## Getting Started for Dev

### Prerequisites

- Node.js 18+
- pnpm 9+
- A Convex account (free at [convex.dev](https://convex.dev))
- A Resend account (for magic link emails, free at [resend.com](https://resend.com))

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up Convex:

```bash
# Initialize Convex (you'll be prompted to create/select a project)
cd apps/backend
npx convex dev
```

3. Configure environment variables in the Convex dashboard:

```
AUTH_RESEND_KEY=your_resend_api_key
CONVEX_SITE_URL=http://localhost:3000
```

4. Update the web app's environment:

```bash
# apps/web/.env.local
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

5. Run the development servers:

```bash
# From root directory
pnpm dev
```

This starts both the Next.js app (http://localhost:3000) and Convex backend.

## Project Structure

```
photalabs/
├── apps/
│   ├── web/                      # Next.js 15 application
│   │   ├── app/                  # App Router pages
│   │   │   ├── layout.tsx        # Root layout with providers
│   │   │   ├── page.tsx          # Login page
│   │   │   └── (authenticated)/  # Protected routes
│   │   │       ├── create/       # Image editor
│   │   │       ├── history/      # Generation history
│   │   │       └── characters/   # Character management
│   │   ├── features/             # Feature-based organization
│   │   │   ├── auth/             # Authentication
│   │   │   ├── editor/           # Image editor
│   │   │   ├── characters/       # Character CRUD
│   │   │   ├── history/          # History viewing
│   │   │   └── layout/           # Sidebar, navigation
│   │   └── shared/               # Shared utilities and components
│   │       ├── components/       # Button, Input, Skeleton, ErrorBoundary
│   │       ├── hooks/            # useUpload, useToast
│   │       └── utils/            # cn (className utility)
│   │
│   └── backend/                  # Convex backend
│       └── convex/
│           ├── schema.ts         # Database schema
│           ├── auth.ts           # Auth configuration
│           ├── characters.ts     # Character mutations/queries
│           ├── generations.ts    # Generation mutations/queries
│           └── storage.ts        # File storage helpers
│
├── tests/
│   ├── convex/                   # Convex unit tests (33 tests)
│   └── e2e/                      # Playwright E2E tests (64+ tests)
│
├── turbo.json                    # Turborepo configuration
├── pnpm-workspace.yaml           # pnpm workspace config
└── playwright.config.ts          # Playwright configuration
```

## Design System

The app uses a dark theme with the following design tokens:

```css
/* Colors */
--bg-primary: #0B0B0E;
--bg-panel: #16161A;
--bg-input: #0F0F0F;
--border: #2A2A2E;
--accent-yellow: #e8e700;
--accent-purple: #8B5CF6;
--text-primary: #FAFAF9;
--text-muted: #6B6B70;
--success: #32D583;
--error: #EF4444;

/* Typography */
--font-heading: "Instrument Sans";
--font-body: "Inter";

/* Border Radius */
--radius-panel: 20px;
--radius-button: 12px;
--radius-input: 12px;
```

## Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Generate image (when in prompt input)
- **Escape**: Close modals and panels

## Running Tests

```bash
# Convex unit tests
pnpm --filter @photalabs/backend test

# Playwright E2E tests
pnpm test:e2e

# All tests
pnpm test
```

### E2E Test Mode

Playwright runs the web app with `NEXT_PUBLIC_E2E=1` to avoid calling the Convex auth flow.
In this mode, auth is short-circuited in the UI/middleware so tests are deterministic without a backend.