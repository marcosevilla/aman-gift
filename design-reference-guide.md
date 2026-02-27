# Farewell Gift Web App — Design & Animation Reference Guide

A comprehensive reference for building a sentimental, polished digital farewell card experience for Aman. The app displays parting messages (with optional photos) from teammates, navigated on mobile with warm, handwritten-quality aesthetics.

---

## Table of Contents

1. [Interaction Patterns for Message Navigation](#1-interaction-patterns-for-message-navigation)
2. [Animation & Motion Design Principles](#2-animation--motion-design-principles)
3. [Visual Design References — Handwritten/Sentimental Feel](#3-visual-design-references--handwrittensentimental-feel)
4. [Technical Implementation (Next.js + Tailwind + Framer Motion)](#4-technical-implementation-nextjs--tailwind--framer-motion)
5. [Inspirational Examples](#5-inspirational-examples)
6. [Recommended Design Direction](#6-recommended-design-direction)

---

## 1. Interaction Patterns for Message Navigation

### Pattern A: Swipeable Card Stack (Recommended)

Cards stacked on top of each other with a slight offset/rotation, swiped away to reveal the next one — like flipping through a stack of handwritten notes left on a desk.

**Reference apps:**
- **Tinder / Hinge** — the canonical swipe-to-dismiss card stack. Smooth physics-based drag with rotation proportional to drag distance.
- **Apple Wallet** — stacked cards with parallax depth. Tapping expands, swiping navigates.
- **Kudoboard** — grid of cards that expand into a full-screen reading view (less relevant for mobile-first).
- **Bumble** — card stack with spring-back on incomplete swipe, satisfying snap-away on commit.

**Why this works for a farewell gift:**
- Each message feels like a discrete, precious object — a physical note
- The reveal of the next card creates anticipation
- The tactile drag gesture feels personal and intentional, not passive scrolling
- Slight rotation on drag adds playfulness without being frivolous
- The "stack" metaphor implies there are more surprises waiting

**Key implementation details:**
- Drag threshold: ~100px horizontal or 40% of card width before committing the dismiss
- Rotation: `rotate(drag.x * 0.1deg)` — subtle, max ~15deg
- Below the active card, show 1-2 "peeking" cards with slight scale reduction (0.95, 0.9) and y-offset (+8px, +16px) to imply depth
- Spring-back on cancel: `type: "spring", stiffness: 300, damping: 25`
- Exit animation: card flies off-screen in the drag direction with continued rotation
- Entry animation for next card: scale from 0.95 to 1.0, y from +8px to 0, opacity 0.8 to 1.0

**Pros:** Tactile, delightful, each message feels special, natural mobile gesture
**Cons:** No random access (linear navigation), harder to revisit a specific card, requires gesture handling

---

### Pattern B: Horizontal Carousel with Snap Points

Cards arranged horizontally, swiped left/right with CSS scroll-snap. Peek of adjacent cards visible at edges.

**Reference apps:**
- **Instagram Stories** — tap left/right edge or swipe to advance. Progress bar at top.
- **Apple News** — horizontal card carousel with snap points and parallax content inside each card.
- **Paperless Post** — envelope-opening animation into a carousel of greetings.

**Why it could work:**
- Familiar from Stories UI, near-zero learning curve
- Progress indicator gives a sense of "how many messages are there"
- Can show a peek of the next card, building anticipation
- Easy to implement with `scroll-snap-type: x mandatory`

**Key implementation details:**
- `scroll-snap-type: x mandatory` on container
- `scroll-snap-align: center` on each card
- Card width: `calc(100vw - 48px)` with 24px peek on each side
- Add `scroll-padding: 24px` for proper snap alignment
- Parallax inside cards: image moves at 0.5x scroll speed

**Pros:** Familiar, accessible, easy random access, progress visible
**Cons:** Less emotionally impactful than a stack, feels more "feed-like" than "gift-like"

---

### Pattern C: Vertical Scroll with Staggered Reveals

A long vertical scroll where each message card fades/slides in as you reach it — like unrolling a letter.

**Reference apps:**
- **Apple's product pages** (iPhone launches) — scroll-triggered animations, content reveals tied to scroll position
- **Tribute.co** — vertical scroll of video messages with fade-in animations
- **Medium** — clean vertical reading with subtle entrance animations

**Why it could work:**
- The simplest to implement correctly
- Natural reading direction (top to bottom)
- Each card's entrance can be theatrical — fade in, slide up, scale up
- Scroll progress can be mapped to a visual metaphor (e.g., an envelope opening wider)

**Pros:** Simple, accessible, no gesture conflicts, works for any number of messages
**Cons:** Less "gift" feeling, more "webpage" feeling. Passive consumption rather than active discovery.

---

### Pattern D: Hybrid — Envelope Open → Card Stack

**Recommended approach: combine the best of multiple patterns.**

1. **Landing:** An envelope or wrapped gift with Aman's name in handwritten font. Tap/swipe up to "open."
2. **Opening animation:** Envelope flap lifts, or wrapping paper tears away, revealing the first card.
3. **Card navigation:** Swipeable card stack (Pattern A) for moving between messages.
4. **Progress:** Subtle dot indicators or a "3 of 12" counter.
5. **End state:** Final card is a group photo or collective message, with an option to replay from the beginning.

This approach creates a narrative arc: anticipation (envelope) → surprise (opening) → discovery (swiping through) → warmth (final group message).

---

### Navigation UX Details

| Element | Recommendation |
|---------|---------------|
| **Progress indicator** | Soft dots (not harsh circles). Active dot slightly larger. Use opacity, not color, to differentiate. |
| **Card counter** | "3 of 12" in a small, light-weight font. Position: top-center or bottom-center. |
| **Replay / back** | Small "←" arrow or "Start over" link after the last card. Don't clutter the main experience. |
| **Tap zones** | If using tap-to-advance (Stories-style): left 30% = back, right 70% = forward. |
| **Haptics** | On iOS/Safari: `navigator.vibrate(10)` on card change for subtle tactile feedback. (Check support; Safari is limited.) |
| **Accessibility** | Arrow key navigation on desktop. Swipe OR tap on mobile. Screen reader: aria-live region announces card content on change. |

---

## 2. Animation & Motion Design Principles

### Core Principles

#### From Apple Human Interface Guidelines
- **Fluid and continuous:** Animations should feel like natural physical responses, not abrupt state changes.
- **Direct manipulation:** Objects should follow the user's finger precisely during drag, then animate to their destination.
- **Purposeful motion:** Every animation should communicate something — relationship, hierarchy, state change. Never animate just to animate.
- **Consistent velocity:** Exit animations should be faster than entrance animations. Objects leaving should feel "dismissed," objects entering should feel "welcomed."

#### From Material Design 3 Motion
- **Emphasized easing** (`cubic-bezier(0.2, 0, 0, 1)`): For most transitions. Starts with energy, settles gently.
- **Standard easing** (`cubic-bezier(0.2, 0, 0, 1)` — same in M3): For elements moving within view.
- **Duration tokens:**
  - Short: 200ms (micro-interactions, button feedback)
  - Medium: 300-400ms (card transitions, modal open/close)
  - Long: 500ms+ (page transitions, dramatic reveals — use sparingly)
- **Stagger:** When multiple elements enter, stagger by 50-80ms each. Creates a "cascade" that feels organic.

#### From Rauno Freiberg (rauno.me)
Rauno's work at Vercel exemplifies "invisible" animation — motion that's so natural you don't notice it's there, but you'd notice if it were gone.
- **Spring physics over cubic-bezier:** Springs feel alive. They overshoot slightly and settle, like real objects.
- **Shared layout animations:** When an element exists in two views, animate it between positions rather than fading out/in. This creates spatial continuity.
- **Micro-interactions on hover/tap:** Subtle scale (1.02-1.05) on press, not on hover. Hover gets a gentle glow or shadow lift.

#### From Emil Kowalski (emilkowal.ski)
Emil's animation philosophy: "The best animations are the ones you don't notice." His Sonner toast library and animation articles emphasize:
- **Enter from a natural origin:** Elements should come from where the user's attention already is.
- **Exit toward the edge:** Dismissed elements leave toward the nearest screen edge.
- **Spring configs that feel "real":**
  - Snappy: `stiffness: 400, damping: 30`
  - Gentle: `stiffness: 200, damping: 20`
  - Bouncy: `stiffness: 300, damping: 15` (lower damping = more bounce)
  - Molasses: `stiffness: 100, damping: 20` (slow, heavy, elegant)

#### From Josh Comeau
- **Respect `prefers-reduced-motion`:** Always. Provide a CSS-only fallback that simply fades.
- **Don't animate layout properties** (width, height, top, left). Animate `transform` and `opacity` only — these are GPU-composited and won't jank.
- **The "springy entrance" pattern:** `y: 20, opacity: 0` → `y: 0, opacity: 1` with a spring. The slight upward movement creates a "rising" feeling that's universally perceived as positive/welcoming.

---

### Specific Animation Techniques for Warmth & Sentimentality

#### 1. Handwriting Reveal Animation
SVG `<path>` with `stroke-dasharray` and `stroke-dashoffset` animated from full offset to 0. Makes text appear as if being written in real-time.

```css
.handwriting-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: write 2.5s ease-out forwards;
}

@keyframes write {
  to { stroke-dashoffset: 0; }
}
```

For the envelope "To: Aman" or the opening greeting, this is extremely effective. Use a tool like https://danmarshall.github.io/google-font-to-svg-path/ to convert text to SVG paths.

**Timing:** 2-3 seconds for a short phrase. Stagger multiple words by 0.3s each.

#### 2. Parallax Depth on Cards
Photos inside message cards move at a different rate than the card itself during transitions. Creates a "window into a scene" feeling.

```tsx
<motion.div style={{ x: dragX }}>
  {/* Card frame moves with drag */}
  <motion.img
    style={{ x: useTransform(dragX, [-200, 200], [-20, 20]) }}
    // Photo moves at 10% of drag speed — subtle parallax
  />
</motion.div>
```

#### 3. Staggered Content Reveal
When a card appears, its content doesn't all load at once. The sender's name appears first, then the message fades in, then the photo slides up.

```tsx
const cardVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};
```

**Stagger timing:** 80-150ms between elements. 120ms is the sweet spot for "flowing" without feeling slow.

#### 4. Soft Glow / Warmth Pulse
A radial gradient behind the active card that pulses gently, like candlelight or a warm hearth.

```css
.card-glow {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 200, 150, 0.15) 0%,
    transparent 70%
  );
  animation: pulse-warm 4s ease-in-out infinite;
}

@keyframes pulse-warm {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
```

#### 5. Page Curl / Paper Fold
For transitioning between cards, a subtle paper-fold effect using `perspective` and `rotateY` gives a physical, paper-like quality.

```css
.card-exit {
  transform-origin: left center;
  animation: page-turn 0.6s ease-in-out forwards;
}

@keyframes page-turn {
  0% { transform: perspective(1200px) rotateY(0deg); }
  100% { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
}
```

Use sparingly — this is expensive and can feel gimmicky if overdone. Best reserved for the initial envelope-opening moment.

#### 6. Floating Particles / Confetti
Tiny floating particles (dots, hearts, stars) drifting upward slowly behind the cards. Very subtle — opacity 0.1-0.3, size 2-4px.

For the final card or a "celebration" moment, a brief confetti burst. Use `canvas-confetti` library or a custom Framer Motion implementation with randomized spring animations.

---

### Animation Timing Reference Table

| Interaction | Duration | Easing | Notes |
|------------|----------|--------|-------|
| Card enter (next) | 400ms | `spring(200, 20)` | Scale 0.95→1, y +10→0 |
| Card exit (swipe away) | 300ms | `spring(400, 30)` | Continue drag direction, add rotation |
| Card spring-back (cancelled swipe) | 500ms | `spring(300, 25)` | Slightly bouncy to feel alive |
| Content stagger (per element) | 120ms delay | `spring(200, 20)` | Name → message → photo |
| Envelope open | 800ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Two-part: flap lifts (400ms) then content rises (400ms) |
| Handwriting reveal | 2000-3000ms | `ease-out` | SVG stroke-dashoffset |
| Photo zoom (tap to expand) | 350ms | `spring(300, 28)` | Use layoutId for shared element |
| Background glow pulse | 4000ms | `ease-in-out` | Infinite loop, very subtle |
| Dot indicator transition | 200ms | `spring(400, 35)` | Snappy, responsive |
| Page counter fade | 150ms | `ease-out` | Quick number change |

---

## 3. Visual Design References — Handwritten/Sentimental Feel

### Typography

#### Handwriting / Script Fonts (Google Fonts, free)

| Font | Style | Use Case | Notes |
|------|-------|----------|-------|
| **Caveat** | Casual handwriting | Message body text, card content | Very legible at small sizes, feels like a friend's handwriting |
| **Caveat Brush** | Bolder handwriting | Headlines, sender names | More emphasis than regular Caveat |
| **Kalam** | Pen handwriting | Message body alternative | Slightly more formal than Caveat, still warm |
| **Patrick Hand** | Rounded handwriting | UI labels, "To: Aman" | Clean, friendly, approachable |
| **Dancing Script** | Elegant cursive | Opening greeting, "A farewell gift for Aman" | More formal/beautiful, use for hero moments only |
| **Satisfy** | Flowing script | Decorative headlines | Very stylized — use sparingly |
| **Homemade Apple** | Scratchy handwriting | "From: [name]" signatures | Feels like an actual signature |
| **Permanent Marker** | Marker/felt-tip | Emphasis, pull-quotes | Bold, informal, great for short phrases |
| **Indie Flower** | Bubbly handwriting | Lighthearted messages | More playful/youthful |

**Recommended combination:**
- **Hero / Opening:** Dancing Script (32-40px) — "For Aman"
- **Sender name:** Permanent Marker or Homemade Apple (18-22px) — feels like a signature
- **Message body:** Caveat (18-20px) — most legible handwriting font, scales well
- **UI elements (counter, nav):** Inter or system sans-serif (13-14px) — don't force handwriting on functional UI

**Line height for handwriting fonts:** 1.6-1.8 (these fonts need more breathing room than sans-serif).

**Letter spacing:** +0.01em to +0.03em for handwriting fonts at body size. They can feel cramped at default spacing.

---

### Color Palette

#### Option A: Warm Cream & Terracotta (Recommended)

A palette that feels like a love letter written on aged paper by warm lamplight.

```
Background (paper):     #FDF6EC  — warm cream, like aged stationery
Background (envelope):  #E8D5B7  — kraft paper tan
Card background:        #FFFBF5  — slightly warmer white
Primary text:           #3D2C1E  — dark brown, like ink (NOT pure black)
Secondary text:         #7A6555  — warm gray-brown for metadata
Accent (warm):          #C45D3E  — terracotta / burnt sienna for highlights
Accent (gold):          #C4922A  — aged gold for decorative elements
Accent (soft):          #D4A574  — muted caramel for borders, dividers
Sender highlight:       #E8B87D  — warm amber glow behind sender name
Error/gentle red:       #B5564F  — muted brick red (not alarming)
Success/gentle green:   #6B8F6B  — sage green (for progress indicators)
```

**Why this works:** Brown ink on cream paper is the universal signifier for "handwritten letter." The terracotta accent adds warmth without being garish. Zero blue = zero corporate energy.

#### Option B: Soft Lavender & Dusty Rose

More delicate, nostalgic — like pressed flowers in a journal.

```
Background:             #FAF5FF  — barely-there lavender
Card background:        #FFFFFF
Primary text:           #2D1B3D  — deep purple-brown
Secondary text:         #6B5A7B  — muted purple
Accent (rose):          #C47D8C  — dusty rose
Accent (lavender):      #9B8EC4  — soft lavender
Accent (gold):          #C4A24A  — warm gold for contrast
Border:                 #E8DDF0  — light purple-gray
```

#### Option C: Night Sky & Candlelight

Darker, more dramatic — like reading letters by candlelight.

```
Background:             #1A1520  — deep purple-black
Card background:        #2A2230  — slightly lighter
Primary text:           #F0E6D4  — warm off-white (candlelight)
Secondary text:         #A09088  — warm gray
Accent (gold):          #D4A54A  — candlelight gold
Accent (warm):          #C47050  — ember orange
Glow:                   #D4A54A33 — gold at 20% opacity for card glow
```

**Note:** Dark themes can feel dramatic and beautiful, but test carefully — handwriting fonts can lose legibility on dark backgrounds. Increase font weight or use a bolder font variant.

---

### Textures & Materials

#### Paper Texture
Apply a subtle noise/grain texture to the background to evoke real paper. Two approaches:

**CSS noise (performant, no image):**
```css
.paper-texture {
  background-color: #FDF6EC;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
}
```

**CSS backdrop with mix-blend-mode:**
```css
.paper-bg::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-conic-gradient(
    rgba(0,0,0,0.01) 0% 25%,
    transparent 0% 50%
  ) 0 0 / 3px 3px;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}
```

#### Card Shadows
Avoid harsh `box-shadow`. Use layered, warm-toned shadows that look like a card resting on a surface:

```css
.message-card {
  box-shadow:
    0 1px 2px rgba(61, 44, 30, 0.04),
    0 4px 8px rgba(61, 44, 30, 0.06),
    0 12px 24px rgba(61, 44, 30, 0.08);
  /* Three layers: contact shadow, mid shadow, ambient shadow */
  /* Using warm brown (#3D2C1E) instead of pure black */
}
```

For a "lifted card" on hover/active:
```css
.message-card:active {
  box-shadow:
    0 2px 4px rgba(61, 44, 30, 0.06),
    0 8px 16px rgba(61, 44, 30, 0.08),
    0 20px 40px rgba(61, 44, 30, 0.12);
  transform: translateY(-2px);
}
```

#### Decorative Elements
- **Tape strips:** CSS-only "tape" on corners of photos — a slightly rotated rectangle with low opacity and a subtle gradient to simulate translucent tape.
- **Polaroid frames:** White border (thicker at bottom) around photos with a slight shadow and 1-3deg rotation.
- **Doodle borders:** SVG hand-drawn border frames around cards. There are free SVG sets for this (search "hand drawn border SVG free").
- **Washi tape:** Colorful semi-transparent strips across the top of cards, like decorative tape in scrapbooking. CSS gradient with 60% opacity.

---

### Visual Design Anti-Patterns (Avoid)

- **Pure black text (#000):** Harsh and digital-feeling. Use dark brown (#3D2C1E) or dark charcoal (#2A2A2A).
- **Pure white background (#FFF):** Cold. Use warm cream (#FDF6EC or #FFFBF5).
- **Sharp corners on cards:** Use border-radius 12-16px minimum. 20px for a softer feel.
- **System fonts for message content:** Breaks the handwritten illusion. Reserve system fonts for tiny UI elements only.
- **Drop shadows with pure black:** Use warm-toned shadows (brown or amber base).
- **Bright saturated accent colors:** Screams "app" not "letter." Keep accents muted and earthy.
- **Too many fonts:** Max 3 font families. One handwriting for content, one script for hero, one sans-serif for UI.

---

## 4. Technical Implementation (Next.js + Tailwind + Framer Motion)

### Animation Library Choice

**Framer Motion — the clear winner for this project.**

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Framer Motion** | React-native integration, spring physics, gesture system (drag, pan, tap), AnimatePresence for exit animations, layoutId for shared elements, excellent DX | Bundle size ~30KB gzipped, can be overkill for simple animations | **Use this.** The gesture system alone justifies it for card swiping. |
| **GSAP** | Most powerful animation engine, timeline sequencing, ScrollTrigger | Not React-first (imperative API), requires refs everywhere, license for commercial use is complex | Overkill for this use case. Better for marketing pages with complex scroll-linked animations. |
| **CSS-only** | Zero bundle cost, excellent performance | No spring physics, no gesture handling, exit animations are painful without JS, no drag support | Use for simple transitions (hover states, loading spinners) but not for the core card interaction. |
| **Motion One** | Tiny (~3KB), Web Animations API, performant | Less ecosystem than Framer Motion, fewer React integrations | Worth considering if bundle size is critical, but you'd lose gesture support. |

---

### Card Stack Implementation

Here's a complete implementation of the swipeable card stack pattern:

```tsx
// components/CardStack.tsx
"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";

interface Message {
  id: string;
  sender: string;
  message: string;
  photoUrl?: string;
}

interface CardStackProps {
  messages: Message[];
}

export function CardStack({ messages }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right">("left");

  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    setCurrentIndex((prev) => Math.min(prev + 1, messages.length - 1));
  };

  // Show current card + 2 behind it for depth
  const visibleCards = messages.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative h-[500px] w-full">
      {/* Card counter */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <span className="text-sm text-[#7A6555] font-sans">
          {currentIndex + 1} of {messages.length}
        </span>
      </div>

      {/* Card stack */}
      <div className="relative mt-8 h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((message, i) => (
            <SwipeableCard
              key={message.id}
              message={message}
              isTop={i === 0}
              stackIndex={i}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface SwipeableCardProps {
  message: Message;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: "left" | "right") => void;
}

function SwipeableCard({ message, isTop, stackIndex, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);

  // Rotation follows drag — max ~15deg
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);

  // Opacity of the card behind reduces as this card is dragged
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className="absolute w-[340px] max-w-[90vw]"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackIndex,
      }}
      initial={{
        scale: 1 - stackIndex * 0.05,
        y: stackIndex * 8,
        opacity: 1 - stackIndex * 0.15,
      }}
      animate={{
        scale: 1 - stackIndex * 0.05,
        y: stackIndex * 8,
        opacity: 1 - stackIndex * 0.15,
      }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        rotate: x.get() > 0 ? 20 : -20,
        opacity: 0,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      <MessageCard message={message} isActive={isTop} />
    </motion.div>
  );
}

function MessageCard({ message, isActive }: { message: Message; isActive: boolean }) {
  return (
    <motion.div
      className="bg-[#FFFBF5] rounded-2xl p-6 min-h-[360px]"
      style={{
        boxShadow: `
          0 1px 2px rgba(61, 44, 30, 0.04),
          0 4px 8px rgba(61, 44, 30, 0.06),
          0 12px 24px rgba(61, 44, 30, 0.08)
        `,
      }}
    >
      {isActive && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {/* Sender name */}
          <motion.p
            className="font-['Permanent_Marker'] text-lg text-[#3D2C1E] mb-4"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1, y: 0,
                transition: { type: "spring", stiffness: 200, damping: 20 },
              },
            }}
          >
            {message.sender}
          </motion.p>

          {/* Photo (if present) */}
          {message.photoUrl && (
            <motion.div
              className="mb-4 -rotate-1"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                  opacity: 1, scale: 1,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                },
              }}
            >
              <div className="bg-white p-2 pb-8 rounded shadow-md">
                <img
                  src={message.photoUrl}
                  alt={`Photo from ${message.sender}`}
                  className="w-full h-40 object-cover rounded-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Message text */}
          <motion.p
            className="font-['Caveat'] text-xl leading-relaxed text-[#3D2C1E]"
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: {
                opacity: 1, y: 0,
                transition: {
                  type: "spring", stiffness: 200, damping: 20, delay: 0.05,
                },
              },
            }}
          >
            {message.message}
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
```

---

### Envelope Opening Animation

```tsx
// components/EnvelopeOpening.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeProps {
  recipientName: string;
  onOpen: () => void;
}

export function Envelope({ recipientName, onOpen }: EnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    // Wait for animation to complete before transitioning
    setTimeout(onOpen, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF6EC]">
      <motion.div
        className="relative w-[320px] h-[220px] cursor-pointer"
        onClick={handleOpen}
        whileTap={{ scale: 0.98 }}
      >
        {/* Envelope body */}
        <motion.div
          className="absolute inset-0 bg-[#E8D5B7] rounded-lg overflow-hidden"
          style={{
            boxShadow: `
              0 4px 12px rgba(61, 44, 30, 0.1),
              0 20px 40px rgba(61, 44, 30, 0.15)
            `,
          }}
        >
          {/* Inner shadow lines to look like an envelope */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                135deg,
                transparent 40%,
                rgba(61, 44, 30, 0.05) 40%,
                rgba(61, 44, 30, 0.05) 41%,
                transparent 41%
              ), linear-gradient(
                225deg,
                transparent 40%,
                rgba(61, 44, 30, 0.05) 40%,
                rgba(61, 44, 30, 0.05) 41%,
                transparent 41%
              )`,
            }}
          />
        </motion.div>

        {/* Envelope flap */}
        <motion.div
          className="absolute -top-0 left-0 right-0 h-[110px] origin-top"
          style={{
            background: `linear-gradient(180deg, #D4B896 0%, #E8D5B7 100%)`,
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            borderRadius: "8px 8px 0 0",
          }}
          animate={isOpening ? {
            rotateX: -180,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          } : {}}
        />

        {/* "To: Name" text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pt-8"
          animate={isOpening ? { opacity: 0 } : {}}
        >
          <p className="font-['Dancing_Script'] text-2xl text-[#3D2C1E]">
            For {recipientName}
          </p>
        </motion.div>

        {/* Letter peeking out during open */}
        <AnimatePresence>
          {isOpening && (
            <motion.div
              className="absolute left-4 right-4 h-[180px] bg-[#FFFBF5] rounded-lg"
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: -100,
                opacity: 1,
                transition: {
                  delay: 0.4,
                  duration: 0.6,
                  ease: [0.2, 0, 0, 1],
                },
              }}
              style={{
                boxShadow: "0 2px 8px rgba(61, 44, 30, 0.1)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tap instruction */}
      <motion.p
        className="mt-8 text-sm text-[#7A6555] font-sans"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to open
      </motion.p>
    </div>
  );
}
```

---

### Handwriting SVG Animation Component

```tsx
// components/HandwrittenText.tsx
"use client";

import { motion } from "framer-motion";

interface HandwrittenTextProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}

// For simple cases, use CSS animation on the text itself.
// For true handwriting animation, you need SVG paths.
// This component handles the SVG path approach.

export function HandwrittenSVGPath({
  pathData,
  duration = 2.5,
  delay = 0,
  strokeColor = "#3D2C1E",
  strokeWidth = 2,
}: {
  pathData: string;
  duration?: number;
  delay?: number;
  strokeColor?: string;
  strokeWidth?: number;
}) {
  return (
    <motion.path
      d={pathData}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: {
          duration,
          delay,
          ease: "easeOut",
        },
        opacity: { duration: 0.2, delay },
      }}
    />
  );
}
```

---

### Shared Element Transition (Photo Expand)

When a user taps a photo in a card, it expands to fill the screen. Using `layoutId` makes this seamless:

```tsx
// In the card:
<motion.img
  layoutId={`photo-${message.id}`}
  src={message.photoUrl}
  className="w-full h-40 object-cover rounded-sm cursor-pointer"
  onClick={() => setExpandedPhoto(message.id)}
/>

// Full-screen overlay:
<AnimatePresence>
  {expandedPhoto && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setExpandedPhoto(null)}
    >
      <motion.img
        layoutId={`photo-${expandedPhoto}`}
        src={messages.find(m => m.id === expandedPhoto)?.photoUrl}
        className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
      />
    </motion.div>
  )}
</AnimatePresence>
```

---

### Performance Checklist for Mobile

1. **Only animate `transform` and `opacity`.**
   Framer Motion does this by default for `x`, `y`, `scale`, `rotate`, `opacity`. Never animate `width`, `height`, `top`, `left`, `border-radius` on cards.

2. **Use `will-change: transform` on the card stack container.**
   ```css
   .card-stack { will-change: transform; }
   ```
   But remove it after animation completes — persistent `will-change` wastes GPU memory.

3. **Lazy-load photos.**
   Only load photos for the current card and the next card. Use `loading="lazy"` on `<img>` tags for cards beyond the next 2.

4. **Reduce motion for accessibility:**
   ```tsx
   import { useReducedMotion } from "framer-motion";

   const prefersReducedMotion = useReducedMotion();

   // Use simpler transitions when reduced motion is preferred
   const transition = prefersReducedMotion
     ? { duration: 0 }
     : { type: "spring", stiffness: 200, damping: 20 };
   ```

5. **Avoid re-renders during drag.**
   Use `useMotionValue` (not `useState`) for drag position. `useMotionValue` updates outside React's render cycle:
   ```tsx
   const x = useMotionValue(0); // Good: no re-renders during drag
   // vs.
   const [x, setX] = useState(0); // Bad: re-renders every frame
   ```

6. **Image optimization.**
   Use `next/image` with appropriate `sizes` prop. For card photos:
   ```tsx
   <Image
     src={photoUrl}
     alt={`Photo from ${sender}`}
     width={600}
     height={400}
     sizes="(max-width: 768px) 90vw, 340px"
     className="object-cover"
     quality={80}
   />
   ```

7. **Font loading.**
   Preload the handwriting fonts to avoid FOUT (flash of unstyled text):
   ```tsx
   // app/layout.tsx
   import { Caveat, Dancing_Script, Permanent_Marker } from "next/font/google";

   const caveat = Caveat({
     subsets: ["latin"],
     variable: "--font-caveat",
     display: "swap",
   });

   const dancingScript = Dancing_Script({
     subsets: ["latin"],
     variable: "--font-dancing",
     display: "swap",
   });

   const permanentMarker = Permanent_Marker({
     weight: "400",
     subsets: ["latin"],
     variable: "--font-marker",
     display: "swap",
   });
   ```

   Then in `tailwind.config.ts`:
   ```ts
   theme: {
     extend: {
       fontFamily: {
         caveat: ["var(--font-caveat)", "cursive"],
         dancing: ["var(--font-dancing)", "cursive"],
         marker: ["var(--font-marker)", "cursive"],
       },
     },
   },
   ```

---

### Tailwind Configuration for the Design System

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Cream & Terracotta palette
        paper: {
          50: "#FFFBF5",   // card background
          100: "#FDF6EC",  // page background
          200: "#F5EBD8",  // subtle dividers
          300: "#E8D5B7",  // envelope / kraft
        },
        ink: {
          DEFAULT: "#3D2C1E", // primary text (dark brown)
          light: "#7A6555",   // secondary text
          faint: "#A89888",   // disabled / placeholder
        },
        accent: {
          terracotta: "#C45D3E",
          gold: "#C4922A",
          caramel: "#D4A574",
          amber: "#E8B87D",
          sage: "#6B8F6B",
        },
      },
      fontFamily: {
        caveat: ["var(--font-caveat)", "cursive"],
        dancing: ["var(--font-dancing)", "cursive"],
        marker: ["var(--font-marker)", "cursive"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        photo: "8px",
      },
      boxShadow: {
        card: `
          0 1px 2px rgba(61, 44, 30, 0.04),
          0 4px 8px rgba(61, 44, 30, 0.06),
          0 12px 24px rgba(61, 44, 30, 0.08)
        `,
        "card-lifted": `
          0 2px 4px rgba(61, 44, 30, 0.06),
          0 8px 16px rgba(61, 44, 30, 0.08),
          0 20px 40px rgba(61, 44, 30, 0.12)
        `,
        "card-subtle": `
          0 1px 3px rgba(61, 44, 30, 0.03),
          0 4px 6px rgba(61, 44, 30, 0.04)
        `,
        polaroid: `
          0 2px 8px rgba(61, 44, 30, 0.08),
          0 8px 20px rgba(61, 44, 30, 0.12)
        `,
      },
      animation: {
        "pulse-warm": "pulse-warm 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "write": "write 2.5s ease-out forwards",
      },
      keyframes: {
        "pulse-warm": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        write: {
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 5. Inspirational Examples

### Digital Farewell / Tribute Experiences

| Example | What They Do Well | Takeaway for This Project |
|---------|------------------|--------------------------|
| **Kudoboard** | Grid of cards, each expandable. Group gift concept. Photo + text per card. | The "many messages in one place" concept. But their UI is functional, not emotional. We can do much better with animation and typography. |
| **Tribute.co** | Video message compilation. Vertical scroll of video cards. | The "reveal one at a time" pacing is excellent. Even without video, the sequential reveal builds emotion. |
| **Paperless Post** | Beautiful envelope-opening animation. Premium stationery textures. Handwriting fonts. | The envelope metaphor is perfect. Their opening animation (envelope flap lifts, card slides out) is the gold standard. |
| **Apple Farewell Cards (internal)** | Reportedly uses a scroll-driven experience with full-bleed photos and handwritten overlays. | Full-bleed photos with text overlay — consider this for messages that include photos. |
| **Hallmark e-cards** | Animated card open, sometimes with sound. Classic "open a card" interaction. | The opening moment matters hugely. Don't skip it. |

### Motion Design References

| Reference | What to Study | Link Pattern |
|-----------|--------------|-------------|
| **Rauno Freiberg** (rauno.me) | His craft page has incredible examples of spring animations, layout transitions, and micro-interactions. The way elements flow between states is directly applicable. | rauno.me |
| **Emil Kowalski** (emilkowal.ski) | His animation articles break down exactly why certain animations feel good. His Sonner toast library demonstrates perfect enter/exit choreography. | emilkowal.ski |
| **Josh Comeau** (joshwcomeau.com) | The "Animation" section of his blog. His article on spring physics is the best explanation of why springs > easing curves. | joshwcomeau.com/animation |
| **Jhey Tompkins** (@jh3y) | CodePen demos of creative CSS/JS animations. His card-flip, parallax, and sticker effects are directly relevant. | codepen.io/jh3y |
| **Cassie Evans** (@cassiecodes) | SVG animation expertise. Her handwriting animation demos are exactly what we need for the "To: Aman" reveal. | cassie.codes |
| **Sam Selikoff** (samselikoff.com) | Framer Motion tutorials — his "Build UI" series covers card stacks, drag gestures, and AnimatePresence patterns. | buildui.com |

### Product Motion References

| Product | What to Study |
|---------|--------------|
| **Linear** | Their issue cards have a subtle hover lift (translateY -1px + shadow increase) that makes each item feel tangible. The way views transition using shared layout animations is best-in-class. |
| **Vercel Dashboard** | The deployment list uses staggered entrance animations. Each row slides in 40ms after the previous. Very clean and purposeful. |
| **Arc Browser** | The tab management uses spring physics for everything — dragging tabs, rearranging spaces, the sidebar reveal. Everything bounces just slightly. |
| **Stripe Checkout** | The payment form has micro-animations on every input focus, validation, and step transition. The shimmer loading state is warm and premium. |
| **Apple Music** | The "now playing" card expands from the mini-player using a shared element transition. The album art scales up while the background blurs. Perfect example of layout animation. |
| **Notion** | The page-open animation slides content in from the right with a soft spring. Covers fade in with a stagger. Clean and calm. |

### Open Source / CodePen References

**Card stack interactions:**
- Search CodePen for "tinder card stack framer motion" — there are several excellent implementations
- The `react-tinder-card` npm package is a reference implementation (study the code even if you don't use the library)
- `framer-motion-card-stack` patterns on GitHub

**Handwriting animations:**
- Search CodePen for "SVG handwriting animation" — Cassie Evans has several
- The `vivus.js` library animates SVG paths and can create handwriting effects
- `typed.js` for a simulated typing effect (different vibe, but sometimes appropriate)

**Envelope opening:**
- Search CodePen for "CSS envelope animation" — there are pure CSS versions using transform-origin and rotateX
- The 3D CSS envelope by Temani Afif is particularly well-done

**Parallax cards:**
- Search CodePen for "3D parallax card tilt" — mouse/touch-following tilt effect
- `react-parallax-tilt` npm package for a React-ready version

### Design Awards References

Search these galleries for "card," "story," "farewell," "tribute," or "scroll" experiences:
- **Awwwards** (awwwards.com) — Filter by "Mobile Excellence" and "Animation" categories
- **CSS Design Awards** (cssdesignawards.com)
- **FWA** (thefwa.com) — Search for "storytelling" and "interactive"
- **SiteInspire** (siteinspire.com) — Clean, editorial references

---

## 6. Recommended Design Direction

Based on everything above, here is the recommended approach — one clear direction to reduce decision overhead:

### The Concept: "A Stack of Letters"

The experience is framed as a physical stack of handwritten letters that Aman opens one by one. It's not a website, it's a gift.

### Flow

```
1. LANDING
   - Warm cream background with subtle paper texture
   - A sealed envelope, slightly askew, with "For Aman" in Dancing Script
   - Gentle floating animation on the envelope (translateY ±4px, 6s loop)
   - "Tap to open" fades in/out below

2. OPENING
   - Envelope flap lifts (rotateX, 600ms)
   - A white card slides up out of the envelope (translateY, 600ms, delayed 400ms)
   - Envelope fades/scales down as the card takes over the screen
   - Total transition: ~1200ms

3. FIRST CARD (COVER)
   - Full-width card on warm background
   - "We'll miss you, Aman" in Dancing Script, animated with handwriting SVG reveal
   - "From your friends at Canary" in Caveat below, fades in after handwriting completes
   - Small downward chevron or "Swipe to read →" hint
   - After 3 seconds, auto-advance or wait for swipe

4. MESSAGE CARDS (the stack)
   - Swipeable card stack (Pattern A from Section 1)
   - Each card has:
     - Sender name in Permanent Marker (top, like a signature)
     - Optional photo in a polaroid frame (slight rotation, tape decoration)
     - Message text in Caveat (body)
   - Content staggers in: name (0ms) → photo (120ms) → message (240ms)
   - Card counter: "3 of 12" in Inter, subtle, top-center
   - Dot indicators at bottom, soft and warm-toned

5. FINAL CARD
   - Different design — slightly larger, centered
   - Group photo (if available) or a decorative illustration
   - "Good luck on your next adventure" or similar collective message
   - Perhaps a confetti burst (brief, 2-3 seconds)
   - "Start over" link at the bottom
```

### Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js (App Router) | Already in your stack, SSR for fast first paint |
| Styling | Tailwind CSS | Fast iteration, custom theme for the warm palette |
| Animation | Framer Motion | Gesture system for swipe, spring physics, AnimatePresence for exits |
| Fonts | Caveat + Dancing Script + Permanent Marker (Google Fonts via next/font) | Free, excellent quality, cover all three needs (body, hero, signature) |
| Hosting | Vercel | Zero-config with Next.js, fast global CDN, custom domain easy |
| Data | Static JSON or hardcoded array | No backend needed — it's a fixed set of messages. Keep it simple. |

### File Structure

```
aman-farewell/
├── app/
│   ├── layout.tsx          # Font loading, global styles, metadata
│   ├── page.tsx            # Main page — orchestrates the flow
│   └── globals.css         # Paper texture, custom utilities
├── components/
│   ├── Envelope.tsx        # Opening animation
│   ├── CardStack.tsx       # Swipeable card stack
│   ├── MessageCard.tsx     # Individual message card
│   ├── PolaroidPhoto.tsx   # Photo with polaroid frame
│   ├── HandwrittenText.tsx # SVG handwriting animation
│   ├── CoverCard.tsx       # "We'll miss you" opening card
│   ├── FinalCard.tsx       # Closing card with group message
│   ├── DotIndicator.tsx    # Progress dots
│   └── PaperTexture.tsx    # Background texture component
├── data/
│   └── messages.ts         # Array of { sender, message, photoUrl? }
├── public/
│   └── photos/             # Teammate photos (optimized)
├── tailwind.config.ts      # Custom theme (colors, shadows, fonts)
└── package.json
```

### What to Build First (Priority Order)

1. **Data file** — Get all messages and photos collected and structured
2. **CardStack + MessageCard** — The core interaction. Get swiping working with placeholder content.
3. **Visual polish** — Apply the warm palette, handwriting fonts, card shadows, paper texture
4. **Envelope opening** — The "wow" first impression
5. **Cover card + final card** — Bookend the experience
6. **Staggered content reveals** — The subtle animation choreography within each card
7. **Photo treatments** — Polaroid frames, tap-to-expand
8. **Handwriting SVG animation** — For the cover card hero text (nice-to-have, high impact)
9. **Confetti on final card** — Cherry on top

---

## Quick-Reference: Spring Configs Cheat Sheet

```ts
// Copy-paste these into your Framer Motion transitions

const springs = {
  // Snappy — for button feedback, small movements
  snappy: { type: "spring", stiffness: 400, damping: 30 },

  // Gentle — for card entrances, content reveals
  gentle: { type: "spring", stiffness: 200, damping: 20 },

  // Bouncy — for playful moments (envelope bounce, confetti)
  bouncy: { type: "spring", stiffness: 300, damping: 15 },

  // Molasses — for slow, elegant transitions (cover card, hero text)
  molasses: { type: "spring", stiffness: 100, damping: 20 },

  // Card dismiss — fast exit, no bounce
  dismiss: { type: "spring", stiffness: 400, damping: 35 },

  // Card spring-back — slightly bouncy on cancel
  springBack: { type: "spring", stiffness: 300, damping: 25 },
};
```

---

## Quick-Reference: Color Tokens

```css
:root {
  /* Backgrounds */
  --color-page:       #FDF6EC;
  --color-card:       #FFFBF5;
  --color-envelope:   #E8D5B7;
  --color-divider:    #F5EBD8;

  /* Text */
  --color-ink:        #3D2C1E;
  --color-ink-light:  #7A6555;
  --color-ink-faint:  #A89888;

  /* Accents */
  --color-terracotta: #C45D3E;
  --color-gold:       #C4922A;
  --color-caramel:    #D4A574;
  --color-amber:      #E8B87D;
  --color-sage:       #6B8F6B;

  /* Shadows (warm brown base) */
  --shadow-color:     61, 44, 30;
}
```
