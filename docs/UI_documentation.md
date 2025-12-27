# UI Documentation — Clauseflow

## Overview
This document captures the UI work completed so far, including structure, UX intent, issues encountered, and fixes. It is a high-level log so future iterations can recreate or extend the interface without re-reading code.

---

## UI Scope Implemented
- **App shell**: Full-width layout with a left sidebar, shared header, and main content area.
- **Core pages**: Dashboard, Chat, Research, Contracts, Templates, Settings.
- **Landing placeholder**: Minimal “landing in progress” card pointing to the app.
- **Design system**: Updated Tailwind theme variables to a more muted, minimal palette and surface system.
- **Motion**: Framer Motion used across all pages with fast (100ms) transitions.

---

## Layout & Navigation
- **App shell**: Standardized header + sidebar used across all app routes.
- **Sidebar**: Collapsible, icon-only state in collapsed mode.
- **Routing**: App routes organized under `app/(app)/` and wired to use the shared shell.
- **API proxy routes**: Added Next.js API routes to proxy to the FastAPI backend (`/api/chat`, `/api/research`, `/api/generate`).

---

## Major UI Improvements & Tweaks
- **Full-width layout**: Removed max-width constraints so the app fills the viewport.
- **Mobile-first behavior**: Added a compact mobile header and condensed navigation for small screens.
- **Search input**: Made responsive (full-width on mobile).
- **Sidebar refinements**: Rebuilt header, spacing, icon tiles, and status area to remove clutter.
- **Chat overhaul**: Redesigned to feel like a modern ChatGPT-style interface with:
  - Thread header
  - Message alignment by role
  - Timestamps
  - Typing indicator
  - Input row with prompt guidance
  - Right-rail checklist + research callout
- **Motion speed**: All transitions set to ~100ms, stagger minimized.
- **Page simplification**: Reduced to a primary dashboard + contract chat + settings; trimmed nav to match.
- **Upload-first flow**: Upload happens in a modal only; analysis, recommendations, editing, and export live on the dashboard.
- **Recommendations carousel**: Side-scrollable cards with actions (Apply / Ignore / Ask AI / User Rec).
- **Auto-rewrite**: Contract rewrites after all recommendations are decided (cost-conscious).
- **Embedded preview**: Right-side persistent PDF preview with LaTeX-generated layout and signature blocks.
- **Dashboard layout**: Left column = controls/recommendations/editor; right column = preview only.

---

## Bugs Encountered & Fixes
- **Missing icon import**: `FileText` not defined in the dashboard stats.
  - Fix: Added the missing import from `lucide-react`.
- **Client/server mismatch**: Dashboard page used `motion` inside a server component.
  - Fix: Marked dashboard page as a client component.
- **ESLint v9 config missing**: `npm run lint` failed due to no `eslint.config.*`.
  - Fix: Added `eslint.config.mjs` with Next.js flat config and ignores.
- **ESLint warnings**: Anonymous default export warnings from config files.
  - Fix: Disabled `import/no-anonymous-default-export` for config files.
- **Sidebar collapse resets on navigation**:
  - Initial fix (localStorage) still caused a flash because state was read in an effect.
  - Final fix: Initialized state synchronously from `localStorage` in `useState`.
- **Collapsed sidebar overlap**:
  - Fix: Removed absolute toggle positioning and restructured header layout.
  - Applied `hidden`/`block` toggles for labels to avoid partial rendering.
  - Centered nav in collapsed mode to eliminate alignment artifacts.
- **Sidebar state reset on navigation**:
  - Fix: Persisted state in localStorage and suppressed hydration mismatch warnings.
  - Iterated to remove SSR/client mismatches while preserving state.
- **Hydration mismatch warnings**:
  - Fix: Suppressed hydration warning on the main shell container and normalized state initialization.

---

## Visual Direction
- **Minimal / calm aesthetic**: Low-contrast surfaces, subtle borders, clean spacing.
- **Typography**: Space Grotesk for headings, Inter for body.
- **Accent restraint**: Primary color reserved for key actions; otherwise muted tones.
- **Soft background**: Radial gradients for atmosphere without heavy noise.
- **Fast UI**: No slow transitions; everything feels immediate.

---

## Current UI Structure (High-Level)
- **Dashboard**: Stats, drafts, research pipeline, templates, and activity.
- **Chat**: Conversation feed + right rail checklist + research highlight.
- **Research**: 10 required areas with progress + status cards.
- **Contracts**: Active list + compliance/status cards.
- **Templates**: Card grid of reusable structures.
- **Settings**: Defaults + integrations list.

## Current UI Structure (As of latest redesign)
- **Dashboard (primary)**: Upload/describe entry, recommendations carousel, inline editor, export actions, embedded PDF preview.
- **Contract Chat**: Guided contract drafting and Q&A.
- **Settings**: Workspace defaults and integrations placeholder.

---

## December 2025 — Dashboard Redesign & Layout Fixes

### Full-Page Layout Fix
- **Issue**: Dashboard wasn't scaling to fill the full viewport height; left column had empty space at bottom.
- **Root cause**: Improper height inheritance through the component hierarchy.
- **Fixes applied**:
  - `globals.css`: Added `height: 100%` and `overflow: hidden` to `html` and `body`.
  - `AppShell.tsx`: Changed outer container from `min-h-screen` to `h-screen`; added `lg:grid-rows-[1fr]` for proper grid row sizing; main element now uses `min-h-0 flex-1`.
  - `dashboard/page.tsx`: Grid changed from `min-h-[calc(100vh-128px)]` to `h-full flex-1`; left column uses `overflow-y-auto` for scrolling.

### Analysis & Export Card Redesign
Complete overhaul of the recommendations/editor card for better UX and visual hierarchy:

**Header**
- Icon (Sparkles) + title "Analysis & Export" + subtitle showing recommendation count.
- Colored status badge: "Ready" (primary tint) or "Pending" (muted).

**AI Recommendations Carousel**
- Cleaner navigation with ChevronLeft/ChevronRight icon buttons.
- Compact recommendation cards with inline action buttons (Apply / Ignore / ?).
- Hidden scrollbar using custom `scrollbar-none` utility.
- Smooth Framer Motion entrance animations.
- "Ask AI" inline input with answer display.
- Subtle note input that expands on focus.

**Your Changes & Requirements Section**
- Promoted to primary input area with `flex-1` to fill available space.
- Icon badge + clear label + helper description.
- Larger textarea with better placeholder example.
- Grows dynamically to use remaining card height.

**Contract Source — Focus Mode**
- Collapsible section that **takes over the entire card** when expanded.
- **Collapsed state**: Shows toggle button with file icon, label, character count badge, and "Click to expand" hint.
- **Expanded state**: Hides all other sections; shows only:
  - Header with "Contract Source" title + character count.
  - Full-height monospace textarea filling available space.
  - "Collapse" button to return to normal view.
  - Export actions remain visible at bottom.
- Smooth opacity transition via Framer Motion.

**Export Actions Footer**
- Clean bar with Download icon + label.
- `.pdf` and `.docx` buttons with hover/tap animations.
- Disabled state when no contract text present.

### New Utilities Added
- `scrollbar-none`: Hides scrollbar across browsers (used in recommendation carousel).

### New State
- `contractTextExpanded`: Boolean controlling Contract Source focus mode.

### New Icons Imported
- `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Download`, `FileText`, `MessageSquare`

---

## Prompt Template for Future UI Rebuild
Here’s a short, human-style prompt you can reuse with Codex to rebuild the UI:

“Build a full-width, minimal Clauseflow UI with a shared app shell, collapsible sidebar (persisted across routes), and fast 100ms Framer Motion transitions. Use a calm surface-based palette and clean typography. The dashboard is the primary page: upload-only modal, recommendations as a horizontal carousel of short cards with Apply/Ignore/Ask AI/User Rec actions, inline editor, and a large right-side embedded PDF preview with signature blocks (LaTeX-rendered). Contract chat is the only other main page plus settings. Keep everything crisp, minimal, and fast.”*** End Patch}
