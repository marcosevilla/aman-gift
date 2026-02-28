# Aman Gift

A sentimental farewell experience for Aman Shahi — an interactive digital card featuring parting messages, memories, and photos from teammates. Designed to feel handwritten, warm, and polished.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Compiler:** React Compiler enabled
- **Package Manager:** npm

## Project Structure
```
app/
  layout.tsx              — Root layout (+ Agentation dev toolbar)
  page.tsx                — Main entry point (just renders MessageCarousel with intro prop)
  globals.css             — Global styles + Tailwind theme
  favicon.ico
components/
  IntroSequence.tsx       — (UNUSED — superseded by merged carousel intro)
  MessageCarousel.tsx     — Unified intro + swipeable carousel + expanded overlay + CarouselCard
  MessageCard.tsx         — Full message display + floating photos + audio play button
data/
  messages.ts             — TeamMessage[] (18 messages, optional audio field)
  themes.ts               — CARD_THEMES array (18 themes)
public/photos/            — Photo assets (JPG, max 800px, ~1.5MB total)
public/photos/originals/  — Original PNGs (backup, not served)
public/music/             — Audio clips (e.g. houdini.mp3 for Becca)
public/signatures/        — Handwritten name SVGs (19 team members)
next.config.ts            — Next.js config (React Compiler enabled)
postcss.config.mjs        — PostCSS config
```

## Commands
- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Design Direction
- Sentimental, handwritten quality
- Warm color palette (not corporate)
- Intuitive mobile-first navigation between teammate messages
- Polished micro-interactions and transitions
- FigJam source: https://www.figma.com/board/UYI3L2trLTlakiiTsxxe8d/au-revoir

## Current State
- **Last worked on:** Mobile performance audit + polish pass (animations, images, interactions)
- **Completed this session:**
  - Merged IntroSequence into MessageCarousel — same DOM elements from stack → carousel (no jumpiness)
  - CarouselCard uses local MotionValues: imperatively animated during intro, then synced from useTransform
  - Reactive z-index via `useTransform(localX)` — active card always on top during scroll
  - Physics-based bounce on carousel settle (spring with velocity passthrough, damping 17)
  - Smooth intro-to-carousel scale/position transition (spring animate instead of snap)
  - CSS transition on card box-shadow (`transition-shadow duration-500`)
  - Intro text blur-in converted from Framer Motion to CSS transitions (fixes mobile jank)
  - "Tap to expand" card text (was "Tap to begin")
  - Swipe/Drag hint below carousel (auto-dismiss after 3.4s or on first swipe, responsive text)
  - Locked vertical scroll on carousel (`touch-action: pan-x`, `h-dvh overflow-hidden`)
  - Reduced expanded card top padding on mobile (`pt-8 pb-16 sm:pt-16`)
  - Signature visible immediately on expanded view close (clear `expandedInitialIndex` on close start)
  - **Performance pass:**
    - Compressed all photos: 56.2 MB PNG → 1.56 MB JPG (97% reduction, 800px max, quality 80)
    - Added `loading="lazy"` to all 4 Image instances in MessageCard
    - Wrapped CarouselCard in `React.memo` (prevents unnecessary re-renders during drag)
    - `will-change-transform` on intro text for GPU compositing
  - Simplified `page.tsx` to single `<MessageCarousel messages={messages} initialIndex={9} intro />`
- **In progress:** Nothing open
- **Known issues:**
  - `IntroSequence.tsx` still exists but is unused (can be deleted)
  - Agentation MCP server needs Claude Code restart to load
  - DialKit spring config objects cause TS errors — use folder of explicit sliders instead
  - Pass 2 performance items pending: remove animated `filter: blur()`, optimize signature SVGs, fix expanded overlay remounting
- **Files modified this session:**
  - `components/MessageCarousel.tsx` (merged intro, memo, culling, settle spring, swipe hint, scroll lock, shadow transition, scale animation)
  - `components/MessageCard.tsx` (lazy loading on all images)
  - `data/messages.ts` (photo references .png → .jpg)
  - `app/page.tsx` (simplified to single carousel component)
  - `public/photos/*.jpg` (compressed from PNG originals)
  - `public/photos/originals/` (backup of original PNGs)
