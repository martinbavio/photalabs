# PhotaLabs - AI Image Editing Playground

A mini AI image editing playground with mock image generation, character management, and generation history.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex (real-time backend-as-a-service)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit tests for Convex), Playwright (E2E)
- **Icons**: Lucide React
- **Monorepo**: Turborepo + pnpm workspaces

## Getting Started

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
│   │   ├── features/             # Feature-based organization
│   │   │   ├── auth/             # Authentication feature
│   │   │   └── layout/           # Layout feature (sidebar, nav)
│   │   └── shared/               # Shared utilities and components
│   │
│   └── backend/                  # Convex backend
│       └── convex/
│           ├── schema.ts         # Database schema
│           ├── auth.ts           # Auth configuration
│           └── users.ts          # User queries
│
├── tests/
│   ├── convex/                   # Convex unit tests
│   └── e2e/                      # Playwright E2E tests
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

/* Typography */
--font-heading: "Instrument Sans";
--font-body: "Inter";

/* Border Radius */
--radius-panel: 20px;
--radius-button: 12px;
--radius-input: 12px;
```

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

## Implementation Phases

- [x] **Phase 1**: Project Setup & Authentication (Magic Links)
- [ ] **Phase 2**: Layout & Sidebar Navigation
- [ ] **Phase 3**: Image Editing Playground (Core UI)
- [ ] **Phase 4**: Character Management
- [ ] **Phase 5**: History
- [ ] **Phase 6**: Polish & Final Testing
- [ ] **Phase 7**: Real AI Image Generation (Optional)

## License

MIT
