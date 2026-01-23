# Mini AI Image Editing Playground - Implementation Plan

## Overview
Build "PhotaLabs" - a mini AI image editing playground with mock image generation, character management, and generation history. Using TDD approach with unit tests for backend (Convex) and E2E tests with Playwright for frontend.

**Design source**: `/Users/paradoja/Documents/photalabs.pen`

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex (real-time backend-as-a-service)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit tests for Convex), Playwright (E2E)
- **Icons**: Lucide React (similar to Material Symbols, better DX)

## Design System (from Pencil designs)
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
--text-placeholder: #4A4A50;
--success: #32D583;

/* Typography */
--font-heading: "Instrument Sans";
--font-body: "Inter";

/* Spacing & Radius */
--radius-panel: 20px;
--radius-button: 12px;
--radius-input: 12px;
--radius-small: 10px;
--sidebar-width: 240px;
```

## Project Structure (Turborepo Monorepo)

Based on [Convex's official monorepo template](https://github.com/get-convex/turbo-expo-nextjs-clerk-convex-monorepo) and [Turborepo best practices](https://turborepo.dev/docs/guides/frameworks/nextjs):

```
photalabs/
├── apps/
│   ├── web/                      # Next.js 15 application
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with providers
│   │   │   ├── page.tsx          # Login page (imports from features/auth)
│   │   │   └── (authenticated)/
│   │   │       ├── layout.tsx    # Sidebar layout (imports from features/layout)
│   │   │       ├── create/page.tsx
│   │   │       ├── history/page.tsx
│   │   │       └── characters/page.tsx
│   │   │
│   │   ├── features/             # Feature-based organization
│   │   │   ├── auth/             # Authentication feature
│   │   │   │   ├── components/
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── layout/           # Layout feature (shared across authenticated pages)
│   │   │   │   ├── components/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── NavItem.tsx
│   │   │   │   │   ├── UserProfile.tsx
│   │   │   │   │   └── Logo.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── editor/           # Image editor feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── InputPanel.tsx
│   │   │   │   │   ├── ResultPanel.tsx
│   │   │   │   │   ├── PromptInput.tsx
│   │   │   │   │   ├── CharacterMentionDropdown.tsx
│   │   │   │   │   ├── ReferenceImageUpload.tsx
│   │   │   │   │   ├── GenerateButton.tsx
│   │   │   │   │   ├── ImagePreview.tsx
│   │   │   │   │   ├── HistoryPanel.tsx
│   │   │   │   │   └── HistoryItem.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useGenerate.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── characters/       # Character management feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── CharacterCard.tsx
│   │   │   │   │   ├── CharacterGrid.tsx
│   │   │   │   │   ├── CharacterModal.tsx
│   │   │   │   │   └── ImageSlot.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useCharacters.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── history/          # History feature
│   │   │       ├── components/
│   │   │       │   ├── HistoryGrid.tsx
│   │   │       │   └── HistoryCard.tsx
│   │   │       ├── hooks/
│   │   │       │   └── useHistory.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── shared/               # Shared utilities and components
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Input.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useUpload.ts
│   │   │   └── utils/
│   │   │       └── cn.ts         # className utility
│   │   │
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                  # Convex backend
│       ├── convex/
│       │   ├── schema.ts
│       │   ├── auth.ts
│       │   ├── characters.ts
│       │   ├── generations.ts
│       │   ├── storage.ts
│       │   └── _generated/
│       ├── package.json
│       └── tsconfig.json
│
├── tests/
│   ├── convex/                   # Convex unit tests (by feature)
│   │   ├── auth.test.ts
│   │   ├── characters.test.ts
│   │   └── generations.test.ts
│   └── e2e/                      # Playwright E2E tests (by feature)
│       ├── auth.spec.ts
│       ├── layout.spec.ts
│       ├── editor.spec.ts
│       ├── characters.spec.ts
│       └── history.spec.ts
│
├── turbo.json                    # Turborepo configuration
├── package.json                  # Root package.json (workspaces)
├── pnpm-workspace.yaml           # pnpm workspace config
├── playwright.config.ts
└── tsconfig.json                 # Root TS config
```

### Feature-Based Organization

Each feature folder (`features/*`) contains everything related to that feature:
- **components/**: React components specific to the feature
- **hooks/**: Custom React hooks for the feature's state and logic
- **index.ts**: Public exports (barrel file)

Benefits:
- Easy to find related code (components + hooks + tests together)
- Clear ownership and boundaries between features
- Easier to delete or refactor features
- Co-located tests improve discoverability

### Client/Server Component Split

With Next.js App Router + Convex, components using `useQuery`, `useMutation`, or other Convex hooks must be **client components**.

**Convention:**
- All components in `features/*/components/` that use Convex hooks should have `"use client"` directive at the top
- Page components (`app/.../page.tsx`) can be server components that import client components
- Shared UI components in `shared/components/` can be either, depending on their use of hooks

**Example structure:**
```typescript
// app/(authenticated)/create/page.tsx (Server Component - no directive needed)
import { InputPanel, ResultPanel } from "@/features/editor";

export default function CreatePage() {
  return (
    <div className="flex">
      <InputPanel />  {/* Client component with "use client" */}
      <ResultPanel /> {/* Client component with "use client" */}
    </div>
  );
}

// features/editor/components/InputPanel.tsx
"use client";
import { useQuery, useMutation } from "convex/react";
// ... component using Convex hooks
```

### Workspace Configuration

**Root `package.json`**:
```json
{
  "name": "photalabs",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:e2e": "playwright test",
    "lint": "turbo run lint"
  }
}
```

**`turbo.json`**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - "apps/*"
```

**`apps/backend/package.json`** (for workspace exports):
```json
{
  "name": "@photalabs/backend",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./convex/_generated/api": "./convex/_generated/api.js",
    "./convex/_generated/dataModel": "./convex/_generated/dataModel.js"
  },
  "scripts": {
    "dev": "convex dev",
    "build": "convex deploy --typecheck=disable",
    "test": "vitest"
  }
}
```

**`apps/web/tsconfig.json`** (path alias for backend types):
```json
{
  "compilerOptions": {
    "paths": {
      "@photalabs/backend/*": ["../backend/*"]
    }
  }
}
```

## Database Schema (Convex)

Using [Convex Auth](https://labs.convex.dev/auth/setup) with magic links via [Resend](https://labs.convex.dev/auth/config/email):

```typescript
// apps/backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables, // Includes users, sessions, accounts, etc.
  // Note: Do NOT redefine the users table - authTables handles it.
  // User profile data is stored in the 'users' table managed by Convex Auth.

  characters: defineTable({
    userId: v.id("users"),
    name: v.string(),
    imageIds: v.array(v.id("_storage")), // 3-5 images (minimum 3 required)
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  generations: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    // Store both IDs and names for referential integrity
    // Names are denormalized so history renders even if character is deleted
    characterMentions: v.array(v.object({
      characterId: v.id("characters"),
      characterName: v.string(),
    })),
    referenceImageId: v.optional(v.id("_storage")),
    generatedImageUrl: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

**Important Notes:**
- **User ID**: Use `ctx.auth.getUserIdentity()` which returns the authenticated user. The `subject` field is the user's ID in the `users` table when using Convex Auth.
- **Character referential integrity**: We denormalize `characterName` into `characterMentions` so history still displays correctly even if a character is later deleted.

### Convex Auth Setup
```typescript
// apps/backend/convex/auth.ts
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend],
});
```

### Environment Variables (Convex Dashboard)
```
AUTH_RESEND_KEY=your_resend_api_key
SITE_URL=http://localhost:3000  # or production URL
```

## File Storage (Convex)

All user-uploaded images are stored in Convex's built-in file storage. [Documentation](https://docs.convex.dev/file-storage/upload-files)

### What Gets Stored

| Content | Storage | Schema Field |
|---------|---------|--------------|
| Character reference images (3-5 per character) | Convex storage | `characters.imageIds: v.array(v.id("_storage"))` |
| Reference images for generation | Convex storage | `generations.referenceImageId: v.optional(v.id("_storage"))` |
| Generated images | External URL (picsum.photos) | `generations.generatedImageUrl: v.string()` |

**Storage URL Lifecycle Note:** Convex storage URLs from `ctx.storage.getUrl()` are time-limited (typically valid for ~1 hour). **Never persist URLs**—only store `storageId` values. Always resolve URLs at read time using `getUrl` queries.

### Storage Functions

```typescript
// apps/backend/convex/storage.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL - call this before uploading
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Get displayable URL from storage ID
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get multiple URLs at once (for character images)
export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.storageIds.map((id) => ctx.storage.getUrl(id))
    );
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
```

### Frontend Upload Flow

```typescript
// components/characters/ImageSlot.tsx

import { useMutation } from "convex/react";
import { api } from "@photalabs/backend/convex/_generated/api";

function ImageSlot({ onUpload }) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleFileSelect = async (file: File) => {
    // 1. Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();

    // 2. Upload file directly to Convex storage
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // 3. Return storage ID to parent component
    onUpload(storageId);
  };

  // ... render file input
}
```

### Character Creation with Images

```typescript
// apps/backend/convex/characters.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Use Convex Auth helper to get the authenticated user's ID
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate: 3-5 images required
    if (args.imageIds.length < 3 || args.imageIds.length > 5) {
      throw new Error("Characters require 3-5 reference images");
    }

    return await ctx.db.insert("characters", {
      userId,  // Already typed as Id<"users">
      name: args.name,
      imageIds: args.imageIds,
      createdAt: Date.now(),
    });
  },
});
```

**User Identity Note:** Use `getAuthUserId(ctx)` from `@convex-dev/auth/server` to get the properly-typed `Id<"users">`. Do not cast `identity.subject` directly as it may be a provider-specific string.

---

## Phase 1: Project Setup & Authentication (Magic Links)

### Goals
- Initialize Turborepo monorepo with Next.js + Convex
- Set up design system (colors, fonts, spacing)
- Configure Convex Auth with magic links via Resend
- Build login page with email input (matching dark theme)
- Set up route protection

### Tests First (TDD)

**Convex Unit Tests** (`tests/convex/auth.test.ts`):
- `isAuthenticated` query returns false when not logged in
- `isAuthenticated` query returns true after authentication
- User data can be retrieved after authentication

**Playwright E2E** (`tests/e2e/auth.spec.ts`):
- Login page renders with dark theme
- Email input accepts valid email address
- "Send magic link" button triggers email sending
- Shows confirmation message "Check your email for a sign-in link"
- Protected routes (/create, /history, /characters) redirect to login
- Clicking magic link redirects to /create (simulated in tests)
- User session persists across page refresh
- Logout button clears session and redirects to login

### Implementation
1. Initialize Turborepo monorepo:
   ```bash
   npx create-turbo@latest photalabs --package-manager pnpm
   cd photalabs && rm -rf apps/docs apps/web
   ```
2. Create Next.js app:
   ```bash
   cd apps && npx create-next-app@latest web --typescript --tailwind --app
   ```
3. Create Convex backend:
   ```bash
   mkdir -p apps/backend && cd apps/backend
   npm init -y && npm install convex
   npx convex dev
   ```
4. Install Convex Auth:
   ```bash
   cd apps/backend
   npm install @convex-dev/auth @auth/core@0.37.0
   npx @convex-dev/auth
   ```
5. Configure Resend in Convex dashboard:
   ```bash
   npx convex env set AUTH_RESEND_KEY your_resend_key
   npx convex env set SITE_URL http://localhost:3000
   ```
6. Configure Tailwind with design system
7. Install Google Fonts: Instrument Sans, Inter
8. Set up schema with authTables
9. Configure auth.ts with Resend provider
10. Build ConvexAuthProvider wrapper
11. Create magic link login page
12. Add middleware for route protection

### Files to Create/Modify
- `package.json` - Root workspaces config
- `turbo.json` - Turborepo task config
- `pnpm-workspace.yaml` - pnpm workspace config
- `apps/backend/convex/schema.ts` - Schema with authTables
- `apps/backend/convex/auth.ts` - Convex Auth with Resend
- `apps/backend/convex/auth.config.ts` - Auth configuration
- `apps/web/app/providers.tsx` - ConvexAuthProvider wrapper
- `apps/web/app/layout.tsx` - Root layout
- `apps/web/app/page.tsx` - Login page (imports from features/auth)
- `apps/web/app/globals.css` - Design system CSS variables
- `apps/web/tailwind.config.ts` - Custom colors, fonts
- `apps/web/middleware.ts` - Route protection
- `apps/web/features/auth/components/LoginForm.tsx` - Magic link login form
- `apps/web/features/auth/hooks/useAuth.ts` - Auth state hook
- `apps/web/features/auth/index.ts` - Feature exports
- `apps/web/shared/components/Button.tsx` - Shared button component
- `apps/web/shared/components/Input.tsx` - Shared input component
- `apps/web/shared/utils/cn.ts` - className utility

---

## Phase 2: Layout & Sidebar Navigation

### Goals
- Build authenticated layout with sidebar
- Implement navigation (Create, My Gallery, Characters)
- User profile display in sidebar footer

### Tests First (TDD)

**Playwright E2E** (`tests/e2e/layout.spec.ts`):
- Sidebar renders with PhotaLabs logo
- Navigation items highlight when active
- Create link navigates to /create
- History link navigates to /history
- Characters link navigates to /characters
- User profile shows name and avatar initials
- Explore item shows "Coming Soon" badge (disabled)

### Implementation
1. Create authenticated route group layout
2. Build Sidebar component matching design:
   - PhotaLabs logo (yellow circle with shapes)
   - Navigation items with icons
   - User profile card at bottom
3. Implement active route highlighting

### Files to Create/Modify
- `apps/web/app/(authenticated)/layout.tsx` - Authenticated layout (imports from features/layout)
- `apps/web/features/layout/components/Sidebar.tsx` - Main sidebar component
- `apps/web/features/layout/components/NavItem.tsx` - Navigation item component
- `apps/web/features/layout/components/UserProfile.tsx` - User profile card
- `apps/web/features/layout/components/Logo.tsx` - PhotaLabs logo
- `apps/web/features/layout/index.ts` - Feature exports

---

## Phase 3: Image Editing Playground (Core UI)

### Goals
- Build main editor with Input Panel and Result Panel
- Implement prompt textarea with inline @ mentions for characters
- When user types "@", show inline dropdown with available characters
- Reference image upload area
- Generate button with loading state
- Result display with "Waiting for input" state

### Tests First (TDD)

**Convex Unit Tests** (`tests/convex/generations.test.ts`):
- `generations.create` - creates generation record with prompt
- `generations.create` - works with character reference
- `generations.create` - works with reference image
- `generations.getByUser` - returns user's generations sorted by date desc

**Playwright E2E** (`tests/e2e/editor.spec.ts`):
- Editor page shows Input and Result panels
- Prompt input has placeholder text
- Typing "@" in prompt shows character dropdown inline
- Selecting character from dropdown inserts "@CharacterName" into prompt
- Multiple characters can be mentioned in same prompt
- Reference image upload area shows drag/drop hint
- Generate button is yellow with bolt icon
- Reset button clears form
- Clicking Generate shows loading spinner in Result panel
- Generated image displays after mock delay
- Generation saved and visible in gallery

### Implementation
1. Create /create page with two-panel layout
2. Build Input Panel:
   - Title with "Form" dropdown
   - Prompt section with @ mention support:
     - Textarea with placeholder
     - Detect "@" keypress to show character dropdown
     - Position dropdown inline below cursor
     - Insert "@CharacterName" on selection
   - Reference image section (upload area)
   - Button section (Reset, Generate)
3. Build Result Panel:
   - Title with "Ready" badge
   - Preview button
   - Image preview area (placeholder when empty)
4. Implement generate mutation (returns picsum.photos URL with random seed)
5. Add loading state with yellow circle spinner
6. Parse prompt to extract character mentions before saving

### Files to Create/Modify
- `apps/web/app/(authenticated)/create/page.tsx` - Page (imports from features/editor)
- `apps/web/features/editor/components/InputPanel.tsx`
- `apps/web/features/editor/components/ResultPanel.tsx`
- `apps/web/features/editor/components/PromptInput.tsx` (with @ mention logic)
- `apps/web/features/editor/components/CharacterMentionDropdown.tsx` (inline dropdown)
- `apps/web/features/editor/components/ReferenceImageUpload.tsx`
- `apps/web/features/editor/components/GenerateButton.tsx`
- `apps/web/features/editor/components/ImagePreview.tsx`
- `apps/web/features/editor/hooks/useGenerate.ts` - Generation logic hook
- `apps/web/features/editor/index.ts` - Feature exports
- `apps/backend/convex/generations.ts`

---

## Phase 4: Character Management

### Goals
- Characters page with list of character cards
- "Create Character" button opens modal
- Create character modal with name + 5 image slots
- Character cards show name, image count, thumbnails, status
- "Use in Editor" button selects character
- Edit/delete character functionality

### Tests First (TDD)

**Convex Unit Tests** (`tests/convex/characters.test.ts`):
- `characters.create` - creates character with name and 3-5 imageIds
- `characters.create` - fails if fewer than 3 images provided
- `characters.create` - fails if more than 5 images provided
- `characters.get` - returns single character by ID with image URLs
- `characters.getByUser` - returns user's characters with image URLs
- `characters.update` - updates character name
- `characters.update` - updates character images (maintains 3-5 requirement)
- `characters.update` - fails if resulting images fewer than 3
- `characters.delete` - removes character and all associated images from storage
- `storage.generateUploadUrl` - returns valid upload URL

**Playwright E2E** (`tests/e2e/characters.spec.ts`):
- Characters page shows "Create Character" button (yellow)
- Clicking button opens Create Character modal
- Modal has character name input
- Modal has 5 image upload slots showing "0/5 uploaded"
- Tips section displays best practices
- Cancel closes modal without saving
- Save button is disabled when fewer than 3 images uploaded
- Can enter name and upload 3 images
- Save button becomes enabled with 3+ images
- Save Character creates character successfully
- New character appears in character list
- Character card shows name, image count, thumbnail grid
- Character can be mentioned via @name in editor prompt
- **Edit Character**:
  - Clicking edit button opens same modal with pre-filled data
  - Name field shows existing character name
  - Existing images are displayed in slots
  - Can change name
  - Can remove existing images
  - Can add new images (up to 5 total)
  - Save updates character successfully
  - Changes reflected in character list
- **Delete Character**:
  - Clicking delete button shows confirmation dialog
  - Confirming deletes character
  - Character removed from list
  - Character no longer available for @ mention in editor

### Implementation
1. Create /characters page with header and grid
2. Build CharacterCard component:
   - Avatar, name, image count, creation date
   - Thumbnail grid (showing uploaded images)
   - Edit/Delete actions
3. Build CharacterModal (used for both Create and Edit):
   - Modal overlay with dark theme
   - Character name input (pre-filled when editing)
   - 5 image upload slots (show existing images when editing)
   - Tips section (purple accent)
   - Cancel and Save buttons
   - Pass optional `characterId` prop to switch to edit mode
4. Implement Convex file storage for images
5. Characters available for @ mention in editor prompt

### Files to Create/Modify
- `apps/web/app/(authenticated)/characters/page.tsx` - Page (imports from features/characters)
- `apps/web/features/characters/components/CharacterCard.tsx`
- `apps/web/features/characters/components/CharacterGrid.tsx`
- `apps/web/features/characters/components/CharacterModal.tsx` (Create & Edit)
- `apps/web/features/characters/components/ImageSlot.tsx`
- `apps/web/features/characters/hooks/useCharacters.ts` - Character state hook
- `apps/web/features/characters/index.ts` - Feature exports
- `apps/web/shared/hooks/useUpload.ts` - Shared file upload hook
- `apps/backend/convex/characters.ts`
- `apps/backend/convex/storage.ts`

---

## Phase 5: History

### Goals
- History page showing all past generations
- Grid view of generated images
- Click image to restore to editor
- History panel accessible from editor header

### Tests First (TDD)

**Convex Unit Tests** (`tests/convex/generations.test.ts` - additions):
- `generations.getByUser` - returns all user generations sorted by date desc
- `generations.getById` - returns single generation by ID

**Playwright E2E** (`tests/e2e/history.spec.ts`):
- **History Page**:
  - History page shows image count (e.g., "42 images created")
  - Grid view shows image thumbnails
  - "Recent" button sorts by newest first
  - Clicking image shows generation details
  - Items show prompt preview, timestamp, character names if used
  - Clicking item navigates to editor with restored state
- **History Panel in Editor**:
  - History button visible in editor header
  - Clicking History opens slide-out panel
  - Panel shows recent generations
  - Clicking item restores prompt to input
  - Clicking item shows generated image in Result panel
  - Can close history panel

### Implementation
1. Create /history page with header:
   - Title with image count
   - Recent button
2. Build image grid component
3. Build image card component showing prompt preview
4. Add History button to editor header
5. Build HistoryPanel as slide-out panel in editor
6. Implement restore functionality (prompt + characters + image)

### Files to Create/Modify
- `apps/web/app/(authenticated)/history/page.tsx` - Page (imports from features/history)
- `apps/web/features/history/components/HistoryGrid.tsx`
- `apps/web/features/history/components/HistoryCard.tsx`
- `apps/web/features/history/hooks/useHistory.ts` - History state hook
- `apps/web/features/history/index.ts` - Feature exports
- `apps/web/features/editor/components/HistoryPanel.tsx` - Slide-out panel in editor
- `apps/web/features/editor/components/HistoryItem.tsx` - Item in history panel
- Update `apps/web/app/(authenticated)/create/page.tsx`
- Update `apps/backend/convex/generations.ts`

---

## Phase 6: Polish & Final Testing

### Goals
- Error handling and loading states
- Form validation
- Final E2E test suite pass
- README documentation

### Tasks
1. Add error boundaries and toast notifications
2. Form validation (required fields, image limits)
3. Loading skeletons for async content
4. Keyboard shortcuts (Enter to generate)
5. Run full test suite
6. Write README:
   - How to run
   - Architecture decisions
   - What would improve with more time
   - Time spent

---

## Phase 7: Real AI Image Generation (Optional)

### Goals
- Replace mock picsum.photos generation with OpenAI DALL-E
- Store generated images in Convex storage (instead of external URLs)

### Implementation

**Environment Variable (Convex Dashboard)**:
```
OPENAI_API_KEY=your_openai_api_key
```

**Update Generation Mutation**:
```typescript
// apps/backend/convex/generations.ts
import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generate = action({
  args: {
    prompt: v.string(),
    characterIds: v.array(v.id("characters")),
    referenceImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Fetch characters and build mentions with denormalized names
    const characterMentions = await Promise.all(
      args.characterIds.map(async (characterId) => {
        const character = await ctx.runQuery(api.characters.get, { id: characterId });
        if (!character) throw new Error(`Character ${characterId} not found`);
        return { characterId, characterName: character.name };
      })
    );

    // Build prompt with character context
    let fullPrompt = args.prompt;
    if (characterMentions.length > 0) {
      fullPrompt = `${args.prompt}. Characters: ${characterMentions.map(c => c.characterName).join(", ")}`;
    }

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    // Download and store in Convex storage
    const imageResponse = await fetch(imageUrl!);
    const imageBlob = await imageResponse.blob();
    const storageId = await ctx.storage.store(imageBlob);

    // Save generation record with denormalized character names
    await ctx.runMutation(api.generations.save, {
      userId,
      prompt: args.prompt,
      characterMentions,  // Includes both ID and name for referential integrity
      referenceImageId: args.referenceImageId,
      generatedImageId: storageId,
    });

    return storageId;
  },
});
```

**Schema Update for Stored Images**:
```typescript
generations: defineTable({
  userId: v.id("users"),
  prompt: v.string(),
  characterMentions: v.array(v.object({
    characterId: v.id("characters"),
    characterName: v.string(),  // Denormalized for referential integrity
  })),
  referenceImageId: v.optional(v.id("_storage")),
  generatedImageId: v.id("_storage"), // Changed from URL to storage ID
  createdAt: v.number(),
}).index("by_user", ["userId"]),
```

### Dependencies
```json
{
  "dependencies": {
    "openai": "^4.x"
  }
}
```

### Cost Considerations
- DALL-E 3 (1024x1024): ~$0.04 per image
- Consider adding rate limiting or credit system
- The "25 credits left" UI element could track this

---

## Verification Plan

### Running the Project
```bash
# Install dependencies (from root)
pnpm install

# Start all services (Convex + Next.js)
pnpm dev

# Or run individually:
pnpm --filter backend dev    # Start Convex
pnpm --filter web dev        # Start Next.js
```

### Running Tests
```bash
# Convex unit tests
pnpm --filter backend test

# Playwright E2E tests
pnpm test:e2e

# All tests via Turborepo
pnpm test
```

### Manual Testing Checklist (via Browser Sync)

Claude should perform manual testing by syncing directly with Chrome. This allows Claude to interact with the running app, take screenshots, fill forms, and verify UI behavior in real-time.

**Test Cases:**
- [ ] Request magic link via email
- [ ] Verify confirmation message appears
- [ ] Navigate between Create, History, Characters pages
- [ ] Create character with name
- [ ] Upload 3+ images to character
- [ ] Generate image with prompt only
- [ ] Generate image with @character mention in prompt
- [ ] Generate image with reference image uploaded
- [ ] View generated image in Result panel
- [ ] See generation in History page
- [ ] Open history panel in editor
- [ ] Restore generation from history
- [ ] Edit existing character
- [ ] Delete character
- [ ] Logout and verify redirect to login

### Visual Verification
After each phase, compare implementation against Pencil designs:
```bash
# Use Pencil MCP to get screenshots
mcp__pencil__get_screenshot(filePath, nodeId)
```

---

## Dependencies

**Root `package.json`**:
```json
{
  "devDependencies": {
    "turbo": "^2.x",
    "@playwright/test": "^1.x",
    "typescript": "^5.x"
  }
}
```

**`apps/web/package.json`**:
```json
{
  "name": "@photalabs/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "convex": "^1.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@types/node": "^22.x",
    "@types/react": "^19.x"
  }
}
```

Note: Web app imports Convex functions from apps/backend via tsconfig.json path aliases.

**`apps/backend/package.json`**:
```json
{
  "name": "@photalabs/backend",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./convex/_generated/api": "./convex/_generated/api.js",
    "./convex/_generated/dataModel": "./convex/_generated/dataModel.js"
  },
  "scripts": {
    "dev": "convex dev",
    "build": "convex deploy --typecheck=disable",
    "test": "vitest"
  },
  "dependencies": {
    "convex": "^1.x",
    "@convex-dev/auth": "^0.x",
    "@auth/core": "0.37.0"
  },
  "devDependencies": {
    "vitest": "^3.x",
    "convex-test": "^0.x"
  }
}
```

**Turbo Task Wiring Note:** Each app declares its own `dev`, `build`, and `test` scripts so Turborepo can orchestrate them. The root `turbo.json` references these task names, and Turbo runs the corresponding script in each workspace.

## Key Architectural Decisions
1. **Turborepo monorepo** - Parallel task execution, caching, clear separation of apps and packages
2. **Convex for backend** - Real-time subscriptions, built-in file storage, type-safe queries, simple setup
3. **Convex Auth with magic links** - Using `@convex-dev/auth` with Resend for email magic links (passwordless auth)
4. **App Router with route groups** - `(authenticated)` group for protected pages with shared sidebar layout
5. **Feature-based structure** - `apps/web` (Next.js with features/), `apps/backend` (Convex), shared code in `apps/web/shared/`
6. **pnpm workspaces** - Efficient dependency management, workspace protocol for internal packages
7. **Vitest + convex-test** - Fast unit testing for Convex functions with mock context
8. **Playwright for E2E** - Full browser testing including auth flows, file uploads, navigation
9. **CSS variables for design tokens** - Match Pencil design system colors exactly via Tailwind config

## Estimated Phases Summary
| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Setup & Auth | Turborepo init, Convex Auth magic links, login page |
| 2 | Layout | Sidebar (Create, History, Characters), authenticated layout |
| 3 | Editor | Input panel with @ mentions, result panel, generate flow |
| 4 | Characters | Character CRUD, image uploads (3-5 required), modal |
| 5 | History | History page + editor panel, search, restore |
| 6 | Polish | Error handling, validation, README |
| 7 (Optional) | AI | Replace mock with OpenAI DALL-E |
