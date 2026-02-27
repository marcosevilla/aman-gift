"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  motion,
  animate,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useDialKit } from "dialkit";
import { MessageCard, FloatingPhotos } from "./MessageCard";
import type { TeamMessage } from "@/data/messages";
import { CARD_THEMES, hexToRgba, type CardTheme } from "@/data/themes";

/* ── Hooks ────────────────────────────────────── */

function useIsNarrow(breakpoint = 768) {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isNarrow;
}

/* ── Static constants (not tunable) ───────────── */

const CARD_W = 260;
const CARD_H = 347; // 3:4 ratio
const SCALE_ACTIVE = 1.0;

/** Deterministic per-card rotations — looks like papers scattered on a table */
const CARD_ROTATIONS = [
  -3.2, 2.8, -1.5, 4.1, -2.7, 1.9, -4.3, 3.5,
  -1.8, 2.4, -3.6, 1.2, -2.1, 3.8, -4.5, 2.6,
  -1.4, 3.1,
];

/** Maps sender name → SVG filename in /public/signatures/ */
const SIGNATURE_MAP: Record<string, string> = {
  EJ: "ej.svg",
  Stephanie: "stephanie.svg",
  Bree: "bree.svg",
  Sebastian: "sebastian.svg",
  Kevin: "kevin.svg",
  Nico: "nico.svg",
  Brad: "brad.svg",
  Jess: "jessica.svg",
  Miguel: "miguel.svg",
  Mehul: "mehul.svg",
  Darshan: "darshan.svg",
  Jake: "jake.svg",
  Becca: "becca.svg",
  Sage: "sage.svg",
  Connor: "connor.svg",
  Quinn: "quinn.svg",
  Ani: "ani.svg",
  Rachel: "rachel.svg",
  Vibhor: "vibhor.svg",
};

/* ── Props ─────────────────────────────────────── */

interface MessageCarouselProps {
  messages: TeamMessage[];
}

/* ── Component ─────────────────────────────────── */

export function MessageCarousel({
  messages,
}: MessageCarouselProps) {
  /* ── DialKit: Carousel Physics ─────────────── */
  const params = useDialKit("Carousel", {
    spread: [100, 60, 400],
    scaleSide: [0.6, 0.3, 1],
    entranceStagger: [0.04, 0, 0.2],
    dragElastic: [0.15, 0, 0.5],
    settleSpring: {
      stiffness: [180, 50, 500],
      damping: [18, 5, 60],
      mass: [1, 0.1, 5],
    },
    expand: {
      visualDuration: [0.25, 0.1, 1],
      bounce: [0.05, 0, 0.5],
    },
    crossfadeDuration: [0.2, 0.05, 0.5],
    backdropBlur: [8, 0, 24],
  });

  const isNarrow = useIsNarrow();
  const SPREAD = isNarrow ? Math.min(params.spread, 70) : params.spread;
  const SCALE_SIDE = params.scaleSide;
  const ENTRANCE_STAGGER = params.entranceStagger;
  const SETTLE_SPRING = useMemo(
    () => ({
      stiffness: params.settleSpring.stiffness,
      damping: params.settleSpring.damping,
      mass: params.settleSpring.mass,
    }),
    [params.settleSpring.stiffness, params.settleSpring.damping, params.settleSpring.mass]
  );
  const SPRING = useMemo(
    () => ({
      type: "spring" as const,
      visualDuration: params.expand.visualDuration,
      bounce: params.expand.bounce,
    }),
    [params.expand.visualDuration, params.expand.bounce]
  );
  const SPRING_SNAPPY = { type: "spring" as const, visualDuration: 0.15, bounce: 0 };

  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedInitialIndex, setExpandedInitialIndex] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Continuous offset — 0 = card 0 centered, -SPREAD = card 1 centered, etc.
  const offsetX = useMotionValue(0);
  const isDragging = useRef(false);
  const panStartOffset = useRef(0);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const count = messages.length;

  // Store SPREAD in a ref for stable callbacks
  const spreadRef = useRef(SPREAD);
  spreadRef.current = SPREAD;
  const settleSpringRef = useRef(SETTLE_SPRING);
  settleSpringRef.current = SETTLE_SPRING;

  // Derive activeIndex from continuous offset (nearest card)
  useMotionValueEvent(offsetX, "change", (latest) => {
    if (!isDragging.current) return;
    const nearest = Math.round(-latest / spreadRef.current);
    const clamped = Math.max(0, Math.min(nearest, count - 1));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  });

  // Mark entrance animation done after stagger completes
  useEffect(() => {
    const timeout = setTimeout(
      () => setHasMounted(true),
      (count * ENTRANCE_STAGGER + 0.5) * 1000
    );
    return () => clearTimeout(timeout);
  }, [count, ENTRANCE_STAGGER]);

  /* ── Settle to nearest card ────────────────── */

  const settleTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, count - 1));
      setActiveIndex(clamped);
      animRef.current = animate(offsetX, -clamped * spreadRef.current, settleSpringRef.current);
    },
    [count, offsetX]
  );

  /* ── Drag handlers ─────────────────────────── */

  const handlePanStart = useCallback(() => {
    isDragging.current = true;
    panStartOffset.current = offsetX.get();
    // Cancel any in-flight settle animation
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  }, [offsetX]);

  const handlePan = useCallback(
    (_: unknown, info: PanInfo) => {
      const spread = spreadRef.current;
      const maxDrag = 0;
      const minDrag = -(count - 1) * spread;
      const raw = panStartOffset.current + info.offset.x;

      // Rubber-band at edges
      if (raw > maxDrag) {
        offsetX.set(maxDrag + (raw - maxDrag) * 0.15);
      } else if (raw < minDrag) {
        offsetX.set(minDrag + (raw - minDrag) * 0.15);
      } else {
        offsetX.set(raw);
      }
    },
    [count, offsetX]
  );

  const handlePanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const currentOffset = offsetX.get();

      // Project where the offset would end up given velocity (decay model)
      const projectedOffset = currentOffset + info.velocity.x * 0.3;
      const projectedIndex = Math.round(-projectedOffset / spreadRef.current);
      const clamped = Math.max(0, Math.min(projectedIndex, count - 1));

      settleTo(clamped);

      // Clear drag flag after a tick so click handlers can check it
      setTimeout(() => { isDragging.current = false; }, 50);
    },
    [count, offsetX, settleTo]
  );

  /* ── Tap navigation ────────────────────────── */

  const navigateTo = useCallback(
    (index: number) => {
      settleTo(index);
    },
    [settleTo]
  );

  /* ── Expand / Collapse ───────────────────────── */

  const expandCard = useCallback(
    (index: number) => {
      setExpandedIndex(index);
      setExpandedInitialIndex(index);
    },
    []
  );

  const collapseCard = useCallback(() => {
    // Sync carousel to current expanded card before closing
    if (expandedIndex !== null) {
      // Snap carousel offset instantly, then clear expanded state
      offsetX.set(-expandedIndex * spreadRef.current);
      setActiveIndex(expandedIndex);
    }
    setExpandedIndex(null);
    setExpandedInitialIndex(null);
  }, [expandedIndex, offsetX]);

  const navigateExpanded = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, count - 1));
      setExpandedIndex(clamped);
      // Only update activeIndex for progress bar — don't animate the carousel
      // underneath, as that moves the layoutId-sharing card and can trigger
      // an unwanted shared layout animation that collapses the overlay.
      setActiveIndex(clamped);
    },
    [count]
  );

  /* ── Keyboard navigation ─────────────────────── */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (expandedIndex !== null) {
          if (expandedIndex > 0) navigateExpanded(expandedIndex - 1);
        } else {
          if (activeIndex > 0) settleTo(activeIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (expandedIndex !== null) {
          if (expandedIndex < count - 1) navigateExpanded(expandedIndex + 1);
        } else {
          if (activeIndex < count - 1) settleTo(activeIndex + 1);
        }
      } else if (e.key === "Escape" && expandedIndex !== null) {
        collapseCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, expandedIndex, count, settleTo, navigateExpanded, collapseCard]);

  /* ── Render ──────────────────────────────────── */

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh py-8 overflow-hidden">
      {/* "Dear Aman," heading — hidden for now */}
      {/* <div
        className="mb-6"
        style={{
          width: "280px",
          height: "60px",
          backgroundColor: "#3D2C1E",
          maskImage: "url(/dear-aman.svg)",
          WebkitMaskImage: "url(/dear-aman.svg)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
        role="img"
        aria-label="Dear Aman,"
      /> */}

      {/* Carousel track */}
      <div className="relative w-full">
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            width: "100%",
            height: CARD_H + 40,
            touchAction: "pan-y",
            cursor: "grab",
          }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          {messages.map((msg, i) => (
          <CarouselCard
            key={`carousel-${i}`}
            msg={msg}
            index={i}
            theme={CARD_THEMES[msg.themeIndex]}
            offsetX={offsetX}
            activeIndex={activeIndex}
            hasMounted={hasMounted}
            isDragging={isDragging}
            isExpanding={expandedInitialIndex === i}
            spread={SPREAD}
            scaleSide={SCALE_SIDE}
            entranceStagger={ENTRANCE_STAGGER}
            spring={SPRING}
            onTapActive={() => expandCard(i)}
            onTapSide={() => navigateTo(i)}
          />
        ))}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="w-32 h-1 bg-paper-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-caramel rounded-full"
            animate={{ width: `${((activeIndex + 1) / count) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* "Thank you for everything" — hidden for now */}
      {/* <div
        className="mt-8"
        style={{
          width: "440px",
          height: "72px",
          backgroundColor: "#3D2C1E",
          maskImage: "url(/thank-you-for-everything.svg)",
          WebkitMaskImage: "url(/thank-you-for-everything.svg)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
        role="img"
        aria-label="Thank you for everything"
      /> */}


      {/* Expanded card overlay */}
      <AnimatePresence>
        {expandedIndex !== null && expandedInitialIndex !== null && (
          <ExpandedOverlay
            messages={messages}
            currentIndex={expandedIndex}
            layoutIndex={expandedInitialIndex}
            theme={CARD_THEMES[messages[expandedIndex].themeIndex]}
            onClose={collapseCard}
            onNavigate={navigateExpanded}
            spring={SPRING}
            springSnappy={SPRING_SNAPPY}
            crossfadeDuration={params.crossfadeDuration}
            backdropBlur={params.backdropBlur}
            showPeekingCards={!isNarrow}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Carousel Card ─────────────────────────────── */

interface CarouselCardProps {
  msg: TeamMessage;
  index: number;
  theme: CardTheme;
  offsetX: ReturnType<typeof useMotionValue<number>>;
  activeIndex: number;
  hasMounted: boolean;
  isDragging: React.RefObject<boolean>;
  isExpanding: boolean;
  spread: number;
  scaleSide: number;
  entranceStagger: number;
  spring: { type: "spring"; visualDuration: number; bounce: number };
  onTapActive: () => void;
  onTapSide: () => void;
}

function CarouselCard({
  msg,
  index,
  theme,
  offsetX,
  activeIndex,
  hasMounted,
  isDragging,
  isExpanding,
  spread,
  scaleSide,
  entranceStagger,
  spring,
  onTapActive,
  onTapSide,
}: CarouselCardProps) {
  const isActive = index === activeIndex;
  const baseRotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

  // Derive x position from continuous offset — cards move 1:1 with drag
  const x = useTransform(offsetX, (v) => v + index * spread);

  // Derive scale: smooth interpolation from scaleSide → 1.0 → scaleSide
  const scale = useTransform(x, [-spread * 2, -spread, 0, spread, spread * 2], [scaleSide * 0.85, scaleSide, SCALE_ACTIVE, scaleSide, scaleSide * 0.85]);

  // Derive rotation: 0° when centered, baseRotation when off-center
  const rotate = useTransform(x, [-spread, 0, spread], [baseRotation, 0, baseRotation]);

  // All cards at full opacity
  const opacity = 1;

  // Derive z-index: highest at center, falls off with distance
  const distFromCenter = Math.abs(index - activeIndex);
  const zIndex = isActive ? 10 : 5 - distFromCenter;

  // Cull cards far off-screen
  if (distFromCenter > 8) return null;

  return (
    <motion.div
      layoutId={`card-${index}`}
      className="absolute cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        x,
        scale,
        rotate,
        opacity,
        zIndex,
      }}
      // Entrance animation only on first mount
      {...(!hasMounted
        ? {
            initial: { x: 400, opacity: 0, scale: 0.8 },
            animate: { x: index * spread, opacity: 1, scale: index === 0 ? 1 : scaleSide },
            transition: { ...spring, delay: index * entranceStagger },
          }
        : {})}
      onClick={() => {
        if (isDragging.current) return;
        if (isActive) {
          onTapActive();
        } else {
          onTapSide();
        }
      }}
    >
      {/* Preview card */}
      <div
        className="w-full h-full overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl"
        style={{
          backgroundColor: theme.bg,
          border: `1.5px solid rgba(${theme.shadowRgb}, ${theme.isDark ? 0.25 : 0.1})`,
          boxShadow: isActive
            ? `0 1px 2px rgba(${theme.shadowRgb}, 0.06), 0 4px 12px rgba(${theme.shadowRgb}, 0.07), 0 10px 28px rgba(${theme.shadowRgb}, 0.05)`
            : `0 1px 2px rgba(${theme.shadowRgb}, 0.04), 0 3px 8px rgba(${theme.shadowRgb}, 0.05)`,
        }}
      >
        {/* Sender name — blurs and fades during expand/collapse */}
        <motion.div
          animate={{
            opacity: isExpanding ? 0 : 1,
            filter: isExpanding ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ duration: 0.15 }}
        >
          {SIGNATURE_MAP[msg.name] ? (
            <div
              role="img"
              aria-label={msg.name}
              className="h-12 max-w-[85%]"
              style={{
                width: "160px",
                backgroundColor: theme.text,
                maskImage: `url(/signatures/${SIGNATURE_MAP[msg.name]})`,
                WebkitMaskImage: `url(/signatures/${SIGNATURE_MAP[msg.name]})`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          ) : (
            <p className="text-3xl font-bold italic" style={{ color: theme.text }}>
              {msg.name}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Expanded Overlay ──────────────────────────── */

interface ExpandedOverlayProps {
  messages: TeamMessage[];
  currentIndex: number;
  layoutIndex: number; // the card that was originally tapped — for stable layoutId
  theme: CardTheme;
  onClose: () => void;
  onNavigate: (index: number) => void;
  spring: { type: "spring"; visualDuration: number; bounce: number };
  springSnappy: { type: "spring"; visualDuration: number; bounce: number };
  crossfadeDuration: number;
  backdropBlur: number;
  showPeekingCards: boolean;
}

function ExpandedOverlay({
  messages,
  currentIndex,
  layoutIndex,
  theme: initialTheme,
  onClose,
  onNavigate,
  spring,
  springSnappy,
  crossfadeDuration,
  backdropBlur,
  showPeekingCards,
}: ExpandedOverlayProps) {
  const message = messages[currentIndex];
  const currentTheme = CARD_THEMES[message.themeIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < messages.length - 1;

  // Track navigation direction for slide animation
  const prevIndexRef = useRef(currentIndex);
  const direction = currentIndex > prevIndexRef.current ? 1 : currentIndex < prevIndexRef.current ? -1 : 0;

  // Delay peeking cards after navigation
  const [peekReady, setPeekReady] = useState(false);
  useEffect(() => {
    setPeekReady(false);
    const timeout = setTimeout(() => setPeekReady(true), 600);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  useEffect(() => {
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Scroll tracking — on mobile, peeking cards only appear at bottom
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setIsAtBottom(atBottom);
    };
    // Check initially (short messages may already be "at bottom")
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [currentIndex]);

  // On mobile, only show peeking cards when scrolled to bottom (or during swipe)
  const mobilePeekVisible = !showPeekingCards ? isAtBottom : true;

  // Swipe tracking for interactive peeking cards
  const swipeX = useMotionValue(0);
  const isSwiping = useRef(false);

  // Peeking card positions driven by swipe
  // Left card: negative % pushes off left edge. Right card: positive % pushes off right edge.
  const peekHidden = showPeekingCards ? 75 : 97; // % off-screen at rest
  const peekReveal = 40; // % revealed at full swipe

  // Left peeking card: rests at -peekHidden%, slides in (toward 0) as user swipes right
  const leftPeekX = useTransform(swipeX, [0, 150], [`${-peekHidden}%`, `${-peekHidden + peekReveal}%`]);
  // Right peeking card: rests at +peekHidden%, slides in (toward 0) as user swipes left
  const rightPeekX = useTransform(swipeX, [-150, 0], [`${peekHidden - peekReveal}%`, `${peekHidden}%`]);

  const handlePanStart = useCallback(() => {
    isSwiping.current = false;
  }, []);

  const handlePan = useCallback((_: unknown, info: PanInfo) => {
    // Only track horizontal swipes that dominate vertical movement
    if (!isSwiping.current && Math.abs(info.offset.x) > 10) {
      if (Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.2) {
        isSwiping.current = true;
      }
    }
    if (isSwiping.current) {
      // Rubber-band at edges (no prev/next)
      let x = info.offset.x;
      if ((x > 0 && !hasPrev) || (x < 0 && !hasNext)) {
        x *= 0.2;
      }
      swipeX.set(x);
    }
  }, [swipeX, hasPrev, hasNext]);

  const handlePanEnd = useCallback((_: unknown, info: PanInfo) => {
    if (!isSwiping.current) {
      swipeX.set(0);
      return;
    }
    const swipeThreshold = 60;
    const velocityThreshold = 300;
    const shouldNavigate = Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold;

    if (shouldNavigate) {
      if (info.offset.x > 0 && hasPrev) {
        onNavigate(currentIndex - 1);
      } else if (info.offset.x < 0 && hasNext) {
        onNavigate(currentIndex + 1);
      }
    }
    // Spring back
    animate(swipeX, 0, { type: "spring", stiffness: 400, damping: 30 });
    isSwiping.current = false;
  }, [swipeX, hasPrev, hasNext, currentIndex, onNavigate]);

  // Reset swipeX when index changes
  useEffect(() => {
    swipeX.set(0);
  }, [currentIndex, swipeX]);

  return (
    <>
      {/* Backdrop — blur layer behind full-bleed card */}
      <motion.div
        className="fixed inset-0 z-40"
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: `blur(${backdropBlur}px)` }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.3 }}
      />

      {/* Full-bleed expanded view — bg always solid, never fades */}
      <motion.div
        ref={scrollRef}
        layoutId={`card-${layoutIndex}`}
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={false}
        style={{ opacity: 1, touchAction: "pan-y", backgroundColor: currentTheme.bg }}
        transition={spring}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {/* Desktop: close button top-right */}
        {showPeekingCards && (
          <motion.button
            className="fixed top-5 right-5 z-60 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: hexToRgba(currentTheme.text, 0.1),
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ ...springSnappy, delay: 0.15 }}
            onClick={onClose}
          >
            <span className="text-lg leading-none" style={{ color: currentTheme.text }}>✕</span>
          </motion.button>
        )}

        {/* Mobile: nav bar sticky at bottom */}
        {!showPeekingCards && (
          <motion.div
            className="fixed bottom-6 left-6 right-6 z-60 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ ...springSnappy, delay: 0.15 }}
          >
            {hasPrev ? (
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: hexToRgba(currentTheme.text, 0.12),
                  backdropFilter: "blur(8px)",
                }}
                onClick={() => onNavigate(currentIndex - 1)}
              >
                <span className="text-xl leading-none" style={{ color: currentTheme.text }}>←</span>
              </button>
            ) : (
              <div className="w-12" />
            )}

            <button
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: hexToRgba(currentTheme.text, 0.12),
                backdropFilter: "blur(8px)",
              }}
              onClick={onClose}
            >
              <span className="text-xl leading-none" style={{ color: currentTheme.text }}>✕</span>
            </button>

            {hasNext ? (
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: hexToRgba(currentTheme.text, 0.12),
                  backdropFilter: "blur(8px)",
                }}
                onClick={() => onNavigate(currentIndex + 1)}
              >
                <span className="text-xl leading-none" style={{ color: currentTheme.text }}>→</span>
              </button>
            ) : (
              <div className="w-12" />
            )}
          </motion.div>
        )}

        {/* Peeking prev/next preview cards — on mobile, only appear at bottom of scroll */}
        <AnimatePresence>
          {hasPrev && mobilePeekVisible && peekReady && (
            <motion.button
              key={`peek-left-${currentIndex}`}
              className="fixed top-1/2 z-60 cursor-pointer left-0"
              style={{
                y: "-50%",
                ...(showPeekingCards ? {} : { x: leftPeekX }),
                scale: showPeekingCards ? 1 : 0.55,
                transformOrigin: "left center",
              }}
              initial={{ opacity: 0, x: "-100%" }}
              animate={{
                opacity: 1,
                rotate: -6,
                ...(showPeekingCards ? { x: `${-peekHidden}%` } : {}),
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              whileHover={showPeekingCards ? {
                x: "-15%",
                rotate: -1,
              } : undefined}
              exit={{
                x: "-100%",
                opacity: 0,
                transition: { type: "spring", visualDuration: 0.2, bounce: 0 },
              }}
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
            >
              <PeekingCardContent message={messages[currentIndex - 1]} />
            </motion.button>
          )}
          {hasNext && mobilePeekVisible && peekReady && (
            <motion.button
              key={`peek-right-${currentIndex}`}
              className="fixed top-1/2 z-60 cursor-pointer right-0"
              style={{
                y: "-50%",
                ...(showPeekingCards ? {} : { x: rightPeekX }),
                scale: showPeekingCards ? 1 : 0.55,
                transformOrigin: "right center",
              }}
              initial={{ opacity: 0, x: "100%" }}
              animate={{
                opacity: 1,
                rotate: 6,
                ...(showPeekingCards ? { x: `${peekHidden}%` } : {}),
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              whileHover={showPeekingCards ? {
                x: "15%",
                rotate: 1,
              } : undefined}
              exit={{
                x: "100%",
                opacity: 0,
                transition: { type: "spring", visualDuration: 0.2, bounce: 0 },
              }}
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
            >
              <PeekingCardContent message={messages[currentIndex + 1]} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Crossfading content — centered with max-width for readability */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            className="min-h-dvh flex items-center justify-center"
            style={{ backgroundColor: CARD_THEMES[messages[currentIndex].themeIndex].bg }}
            variants={{
              enter: (d: number) => ({
                opacity: 0,
                x: d * 60,
                filter: "blur(12px)",
              }),
              center: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              },
              exit: (d: number) => ({
                opacity: 0,
                x: d * -60,
                filter: "blur(8px)",
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: crossfadeDuration * 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="w-full max-w-2xl mx-auto px-6 py-16">
              <MessageCard
                sender={message.name}
                message={message.message}
                signature={SIGNATURE_MAP[message.name]}
                theme={currentTheme}
                fullBleed
                {...(message.photoAfterParagraph != null ? {
                  photoAfterParagraph: message.photoAfterParagraph,
                  inlinePhotos: (
                    <FloatingPhotos
                      photos={message.photos.slice(0, message.inlinePhotoCount ?? message.photos.length)}
                      sender={message.name}
                      photoCaption={message.photoCaption}
                      theme={currentTheme}
                      inline
                      audio={message.audio}
                    />
                  ),
                } : {})}
              />

              {/* Photos below message — all when no inline, or remaining overflow photos */}
              {(() => {
                const belowPhotos = message.photoAfterParagraph != null
                  ? message.photos.slice(message.inlinePhotoCount ?? message.photos.length)
                  : message.photos;
                return belowPhotos.length > 0 ? (
                  <FloatingPhotos
                    photos={belowPhotos}
                    sender={message.name}
                    photoCaption={message.photoAfterParagraph != null ? undefined : message.photoCaption}
                    theme={currentTheme}
                    inline
                  />
                ) : null;
              })()}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ── Peeking Card Content (visual only) ──────── */

function PeekingCardContent({ message }: { message: TeamMessage }) {
  const theme = CARD_THEMES[message.themeIndex];
  return (
    <div
      className="flex items-center justify-center rounded-2xl overflow-hidden p-5"
      style={{
        width: CARD_W,
        height: CARD_H,
        backgroundColor: theme.bg,
        border: `1.5px solid rgba(${theme.shadowRgb}, ${theme.isDark ? 0.25 : 0.1})`,
        boxShadow: `0 4px 20px rgba(${theme.shadowRgb}, 0.15)`,
      }}
    >
      {SIGNATURE_MAP[message.name] ? (
        <div
          role="img"
          aria-label={message.name}
          className="h-12 max-w-[85%]"
          style={{
            width: "160px",
            backgroundColor: theme.text,
            maskImage: `url(/signatures/${SIGNATURE_MAP[message.name]})`,
            WebkitMaskImage: `url(/signatures/${SIGNATURE_MAP[message.name]})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      ) : (
        <p className="text-3xl font-bold italic" style={{ color: theme.text }}>
          {message.name}
        </p>
      )}
    </div>
  );
}
