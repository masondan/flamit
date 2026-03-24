# FlamIt - Agents Guide

## Commands
- **Dev server**: `npm run dev` (Vite dev server on port 5174)
- **Build**: `npm run build` (production build)
- **Preview**: `npm run preview` (preview production build)
- **Check**: `npm run check` (Svelte type checking)
- **No tests configured**: This project has no test suite

## Architecture
- **Stack**: SvelteKit 2 + Svelte 5 + Vite 6, JavaScript (no TypeScript)
- **Adapter**: @sveltejs/adapter-static (SPA mode with fallback)
- **Structure**: Single-page gamified spinner app
  - `/src/lib/components/` - UI components (SlotReel, SpinButton, Timer, etc.)
  - `/src/lib/stores/` - Svelte stores (gameStore.js)
  - `/src/lib/data/` - Story forms, story data
  - `/src/lib/styles/` - CSS (tokens.css, global.css)
  - `/src/routes/` - Main game page + /stories submission page
  - `/static/` - Static assets (sounds, logos)
- **State**: Svelte stores + localStorage for persistence
- **Design System**: Flam family tokens (shared with PicFlam, AudioFlam etc.)

## Code Style
- **Language**: JavaScript (ES modules), Svelte components
- **Imports**: Svelte imports first, then $lib imports, then relative
- **Components**: Svelte 5 syntax with props via `export let`
- **Naming**: PascalCase for components, camelCase for functions/variables
- **CSS**: Use CSS custom properties from tokens.css (never hardcode colors/spacing)

## Key Routes
- `/` - Main FlamIt game (spinner + timer)
- `/stories` - Journalist story submission form
- `/stories?admin` - Admin view to review and approve submissions

## Manifest & PWA Configuration

FlamIt is configured as a standalone PWA app:

**Manifest** (`static/manifest.json`):
- `display: "standalone"` — removes browser chrome when installed
- `scope: "/"` — ensures proper PWA scope
- Theme & background colors: `#5422b0` (Flam family standard)
- Icons: maskable PNG (512x512) for adaptive icon support on Android + Apple touch icon

**Meta tags** (`src/app.html`):
- `theme-color` meta tag for browser UI theming
- Open Graph tags for sharing (og:image uses `/logos/logo-flamit-og.png`)
- Twitter card tags for social media sharing
- `robots: noindex, nofollow` (training/non-commercial app)

**Icon location**: `/static/logos/` (not `/static/icons/` which contains UI icons only)
- `logo-flamit-maskable.png` — PWA icon
- `logo-flamit-apple.png` — Apple touch icon
- `logo-flamit-og.png` — OG/Twitter card image
- `logo-flamit-favicon.*` — Favicon (ico + svg)
