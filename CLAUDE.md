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
  messages.ts             — TeamMessage[] (19 messages, optional audio field)
  themes.ts               — CARD_THEMES array (19 themes)
public/photos/            — Photo assets (JPG, max 800px, ~1.5MB total)
public/photos/originals/  — Original PNGs (backup, not served)
public/music/             — Audio clips (e.g. houdini.mp3 for Becca)
public/signatures/        — Handwritten name SVGs (20 team members)
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
- **Last worked on:** 5-stage intro animation choreography + Wenjun's card
- **Completed this session:**
  - 5-stage intro sequence: text blur-in → text split apart → card stack blur-in → tap to expand → deal-from-top spread
  - "Dear Aman," and "Thank you for everything!" split into opposite directions (above/below card deck)
  - Parent-level blur/opacity for stack entrance (single composite layer, not per-card)
  - Deal-from-top reversed stagger (top card peels first)
  - Z-index base increased from 100 to 1000 (fixes off-center card layering)
  - Position-based z-index during fan-out (`1000 - Math.abs(x)`)
  - Spread values: desktop 130px, mobile cap 90px
  - Holistic intro timing slowdown (600ms initial beat, 1800ms pauses, 1.6s stack fade)
  - Text blur-out timed to card settle (no extra delay)
  - Added Wenjun's card (19th message, theme 18 "Soft Sky", signature mapped)
  - Added theme 18: Soft Sky (`bg: #E0EEF5, text: #1E3344`)
  - Committed and force-pushed to master
- **In progress:** Nothing open
- **Known issues:**
  - `IntroSequence.tsx` still exists but is unused (can be deleted)
  - Vercel production branch is `main` but code is on `master` — change in Vercel dashboard
  - Pass 2 performance items pending: remove animated `filter: blur()`, optimize signature SVGs, fix expanded overlay remounting
- **Files modified this session:**
  - `components/MessageCarousel.tsx` (5-stage intro, text split, parent blur, deal-from-top, z-index, spread, timing, Wenjun signature)
  - `data/messages.ts` (added Wenjun's entry)
  - `data/themes.ts` (added theme 18 Soft Sky)
  - `public/signatures/wenjun.svg` (added)
