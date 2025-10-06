# NewsNexusPortal09

## Overview

NewsNexus Portal is the web interface for the NewsNexus09Db and microservices suite of applications.

- started from `npx create-next-app@latest`
  - No Turbopack -> this causes problems with the svg icons (src/icons)
- Uses App Router
- Uses TailwindCSS
- Uses Redux for state management
- Uses TypeScript

## Project Structure

```
.
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── images
│   │   ├── buttons
│   │   ├── deleteCircleX.svg
│   │   ├── kmLogo_square1500.png
│   │   ├── logoAndNameRound.png
│   │   ├── logoWhiteBackground.png
│   │   ├── menu
│   │   └── new.png
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── (dashboard)
│   │   ├── (full-width)
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components
│   │   ├── auth
│   │   ├── common
│   │   ├── form
│   │   ├── header
│   │   └── ui
│   ├── context
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   ├── icons
│   │   └── contains all .svg icons
│   ├── layout
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── Backdrop.tsx
│   │   └── SidebarWidget.tsx
│   ├── store
│   │   ├── features
│   │   ├── hooks.ts
│   │   └── index.ts
│   └── svg.d.ts
└── tsconfig.json
```

## Key differences from version 08

- **Layout vs `TemplateView.js`**: In v08 (Pages Router) we used a `TemplateView.js` component to render the top/side navigation across pages. In v09 (App Router), this responsibility moves to `layout.tsx`.
  - Use `src/app/(dashboard)/layout.tsx` to wrap all dashboard routes with the sidebar/header chrome (this replaces `TemplateView.js`).
  - Optionally use `src/app/(full-width)/layout.tsx` for auth and other pages that should not include the dashboard chrome.
- **Route groups don’t affect URLs**: `(dashboard)` and `(full-width)` are organizational; they scope layouts and don’t appear in the path.
- **Per‑segment routing**: Routes are defined by folders with a `page.tsx`. Shared UI (including what lived in `components/common/`) belongs under `src/components/`.
- **No `[root_navigator].js` / `[navigator].js`**: Navigation is file‑system based; those dynamic navigator files are no longer needed.

## Template Changes

This version of the News Nexus Portal will heavily leverage the [free-nextjs-admin-dashboard-main](https://tailadmin.com/download) project. The following is a list of modification we I am making from the template.

- SignUpForm.tsx changed to RegistrationForm.tsx
- SignInForm.tsx changed to LoginForm.tsx

## Imports

### Required for Template

- `npm install tailwind-merge`
- `npm i -D @svgr/webpack`
