# NewsNexusPortal09

## Overview

NewsNexus Portal is the web interface for the NewsNexus09Db and microservices suite of applications.

- started from `npx create-next-app@latest`
  - No Turbopack -> this causes problems with the svg icons (src/icons)

## Project Structure

```
src/
  app/
    (dashboard)/
      (articles)/
      (admin-db)/
      (admin-general)/
      (reports-analysis)/
      (user-pages)/
    (full-width)/
      (auth)/
      (error-pages)/
    layout.tsx
    globals.css
  components/
  store/
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
