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
  page.tsx                — Main entry point (phase state machine)
  globals.css             — Global styles + Tailwind theme
  favicon.ico
components/
  MessageCarousel.tsx     — Swipeable carousel + expanded card overlay (replaced CardStack/CardFan)
  MessageCard.tsx         — Full message display + floating photos + audio play button
  Envelope.tsx            — Opening animation
  CoverCard.tsx           — Cover screen
  FinalCard.tsx           — End screen with confetti
data/
  messages.ts             — TeamMessage[] (18 messages, optional audio field)
public/photos/            — Photo assets
public/music/             — Audio clips (e.g. houdini.mp3 for Becca)
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
- **Last worked on:** Audio play button on Becca's photo (Dua Lipa / Houdini reference)
- **Completed this session:**
  - Added `audio?: string` field to `TeamMessage` interface
  - Implemented audio play/pause button overlaid on Becca's inline photo
  - Smooth fade-in/fade-out (400ms rAF-based volume interpolation) on play, pause, and track end
  - Disabled photo-expand on audio photos — entire photo area is play/pause only
  - Bigger play button (64px circle, 24px icons) with `group-hover:scale-110` hover state
  - Audio auto-stops on unmount (navigating away from Becca's card)
  - Threaded `audio` prop through MessageCarousel → FloatingPhotos
- **In progress:** Handwritten name SVGs (researched, Calligrapher.ai recommended, not yet implemented)
- **Known issues:**
  - Agentation MCP server needs Claude Code restart to load
  - DialKit spring config objects cause TS errors — use folder of explicit sliders instead
- **Files modified this session:**
  - `data/messages.ts` (added `audio` field to interface + Becca's entry)
  - `components/MessageCard.tsx` (audio play button, fade logic, disabled expand for audio photos)
  - `components/MessageCarousel.tsx` (threaded `audio` prop to inline FloatingPhotos)
