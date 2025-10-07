# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NewsNexusPortal09 is a Next.js 15 web application built with the App Router, serving as the modernized front end for the NewsNexus09Db and microservices suite. It's a complete rebuild of NewsNexus08Portal (which was built with plain JavaScript), now using Next.js conventions, TypeScript, TailwindCSS v4, and Redux Toolkit with persist for state management.

The project architecture is heavily inspired by the free-nextjs-admin-dashboard-main template, providing a structured file system, reusable components, and responsive dashboard layouts.

## Development Commands

```bash
# Start development server on port 3001
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Component Refactoring Difficulty Scale

When migrating components from NewsNexus08Portal (v08) to NewsNexusPortal09 (v09), use this scale to assess implementation complexity:

**Rating: 0-10** where:
- **0-2**: Very easy - Minimal changes, fits existing patterns perfectly, 1 new file max
- **3-5**: Moderate - May need to modify 1-2 existing files, create 1-2 new files, some pattern adjustments
- **6-8**: Complex - Requires modifying 3+ files, new architectural patterns, significant refactoring
- **9-10**: Very complex - Major architectural changes, multiple new systems, extensive refactoring

### Factors That Affect Difficulty:
- Number of new files to create
- Number of existing files to modify
- Architectural pattern compatibility
- Redux store modifications needed
- New dependencies required
- Conflicts with existing systems (sidebar, header, modals, etc.)
- Styling/theme integration complexity

### Example Assessment:
**SummaryStatistics Component**: Rating 2/10
- ✅ 1 new file (`SummaryStatistics.tsx`)
- ✅ 0 existing files modified
- ✅ Redux actions already exist
- ✅ Styling template available (EcommerceMetrics)
- ✅ No modal system conflicts (uses inline loading)
- ✅ No new dependencies

## Architecture & Key Patterns

### Route Groups & Layouts

The app uses Next.js App Router with route groups for layout organization:

- **(dashboard)**: Routes wrapped with `AppHeader` + `AppSidebar`. Used for authenticated dashboard pages like `/articles/review`.
  - Layout: `src/app/(dashboard)/layout.tsx`
  - Provides sidebar navigation, header, and authenticated UI chrome
  - Uses `SidebarProvider` context for responsive sidebar state

- **(full-width)**: Routes without dashboard chrome, used for auth flows like `/login` and `/register`.
  - Layout: `src/app/(full-width)/(auth)/layout.tsx`
  - Provides split-screen auth layout with KM logo on right side
  - Nested `(auth)` route group for auth-specific pages

**Important**: Route groups like `(dashboard)` and `(full-width)` do NOT appear in URLs — they only organize layouts. This replaces the v08 pattern of using `TemplateView.js` for shared navigation.

### State Management (Redux)

Redux Toolkit is configured in `src/store/index.ts` with `redux-persist` for localStorage persistence:

- **Store setup**: Uses `persistReducer` with `redux-persist/lib/storage`
- **User slice**: `src/store/features/user/userSlice.ts` manages authentication state and application preferences
  - `loginUser`: Sets token, username, email, isAdmin after successful login
  - `logoutUserFully`: Resets all user state completely
  - Article/request filtering params stored in Redux for persistence across sessions

- **Typed hooks**: Use `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts` instead of raw Redux hooks

- **Provider setup**: `src/app/providers.tsx` wraps app with Redux Provider and PersistGate
  - All client components have access to Redux store
  - Persisted state rehydrates automatically on page load

### Authentication Flow

Login is handled in `src/components/auth/LoginForm.tsx`:
1. User submits email/password
2. POST to `${NEXT_PUBLIC_API_BASE_URL}/users/login`
3. On success, dispatch `loginUser(resJson)` to Redux
4. Router pushes to `/articles/review` (dashboard page)
5. Token and user data persisted via redux-persist

Logout should use `logoutUserFully` action to clear all state.

### SVG Icons

SVG icons in `src/icons/` are imported as React components using `@svgr/webpack`:

- Custom webpack config in `next.config.ts` transforms `.svg` imports to components
- Icons exported from `src/icons/index.tsx`
- Usage: `import { EyeIcon, EyeCloseIcon } from "@/icons"`
- **Do NOT use Turbopack** — it breaks SVG loading (causes problems with the svg icons)

### Styling

- **TailwindCSS v4** via `@tailwindcss/postcss`
- Global styles in `src/app/globals.css`
- Theme context in `src/context/ThemeContext.tsx` for light/dark mode
- Sidebar responsive behavior managed by `src/context/SidebarContext.tsx`

### Component Organization

- `src/components/auth/`: Authentication forms (LoginForm, RegistrationForm)
- `src/components/form/`: Reusable form inputs, selects, switches, labels
- `src/components/ui/`: Reusable UI primitives (buttons, alerts, badges, modals, tables, dropdowns)
- `src/components/common/`: Shared components like breadcrumbs, theme toggles, chart tabs
- `src/layout/`: Top-level layout components (AppHeader, AppSidebar, Backdrop, SidebarWidget)

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for NewsNexusAPI09 backend
- `NEXT_PUBLIC_MODE`: Set to "workstation" to prefill login form for development

## Migration from v08

Key differences from NewsNexus08Portal:

- **No `TemplateView.js`**: Replaced by layout.tsx files in route groups
- **No `[root_navigator].js` / `[navigator].js`**: File-system routing replaces dynamic navigator components
- **Redux instead of context**: State management moved from React Context to Redux Toolkit
- **App Router instead of Pages Router**: Route definitions are folders with `page.tsx`, not files in `pages/`
- **Server/client separation**: Components must be marked `"use client"` to use hooks, events, or browser APIs

## Important Notes

- **Template renaming**: `SignUpForm.tsx` → `RegistrationForm.tsx`, `SignInForm.tsx` → `LoginForm.tsx`
- **Sidebar placement**: Sidebar is positioned on the RIGHT side of the screen (customization from template)
- **Logo positioning**: KM logo appears on the right side of auth screens and header
- **Redux persistence**: User state persists across page refreshes via localStorage
- **API integration**: All API calls go through `NEXT_PUBLIC_API_BASE_URL` environment variable
