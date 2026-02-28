"use client";

import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
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

/** Deterministic jitter — seeded per index so it's stable across renders */
function seededJitter(i: number): { x: number; y: number } {
  const seed = Math.sin(i * 9301 + 49297) * 49297;
  const x = ((seed % 1000) / 1000 - 0.5) * 10; // ±5px
  const y2 = ((Math.sin(i * 1301 + 7927) * 7927) % 1000) / 1000;
  const yJitter = (y2 - 0.5) * 6; // ±3px
  return { x, y: yJitter };
}

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
  Wenjun: "wenjun.svg",
  Marco: "marco.svg",
};

/* ── Props ─────────────────────────────────────── */

interface MessageCarouselProps {
  messages: TeamMessage[];
  initialIndex?: number;
  intro?: boolean;
}

/* ── Component ─────────────────────────────────── */

export function MessageCarousel({
  messages,
  initialIndex = 0,
  intro = false,
}: MessageCarouselProps) {
  /* ── DialKit: Carousel Physics ─────────────── */
  const params = useDialKit("Carousel", {
    spread: [130, 60, 400],
    scaleSide: [0.6, 0.3, 1],
    dragElastic: [0.15, 0, 0.5],
    settleSpring: {
      stiffness: [180, 50, 500],
      damping: [17, 5, 60],
      mass: [1, 0.1, 5],
    },
    expand: {
      visualDuration: [0.25, 0.1, 1],
      bounce: [0.05, 0, 0.5],
    },
    crossfadeDuration: [0.2, 0.05, 0.5],
    backdropBlur: [8, 0, 24],
  });

  /* ── DialKit: Intro ──────────────────────────── */
  const introParams = useDialKit("Intro", {
    textBlurIn: [1.2, 0.3, 2.5],
    textPause: [1800, 400, 3000],
    stackFadeIn: [1.6, 0.2, 3.0],
    spreadStagger: [60, 20, 120],
    spreadSpring: {
      stiffness: [160, 80, 400],
      damping: [22, 10, 40],
    },
  });

  const isNarrow = useIsNarrow();
  const SPREAD = isNarrow ? Math.min(params.spread, 90) : params.spread;
  const SCALE_SIDE = params.scaleSide;
  const SETTLE_SPRING = useMemo(
    () => ({
      type: "spring" as const,
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

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedInitialIndex, setExpandedInitialIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  /* ── Intro state ────────────────────────────── */
  const [introStage, setIntroStage] = useState<number | null>(intro ? 0 : null);
  const [introTapped, setIntroTapped] = useState(false);
  const [introTextVisible, setIntroTextVisible] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Stack positions for intro (deterministic jitter)
  const stackPositions = useMemo(
    () =>
      messages.map((_, i) => {
        const jitter = seededJitter(i);
        return {
          x: jitter.x,
          y: -i * 0.4 + jitter.y,
          rotate: CARD_ROTATIONS[i % CARD_ROTATIONS.length] * 0.3,
          scale: 1 - i * 0.002,
        };
      }),
    [messages]
  );

  // Intro config passed to CarouselCard
  const introConfig = useMemo(
    () => ({
      stackFadeIn: introParams.stackFadeIn,
      spring: {
        stiffness: introParams.spreadSpring.stiffness,
        damping: introParams.spreadSpring.damping,
      },
      stagger: introParams.spreadStagger,
      totalCards: messages.length,
    }),
    [introParams.stackFadeIn, introParams.spreadSpring.stiffness, introParams.spreadSpring.damping, introParams.spreadStagger, messages.length]
  );

  /* ── Intro stage progression — auto-advance 0→4 ── */
  /* Stage 1: "Dear Aman" blurs in
     Stage 2: "Thank you" blurs in
     Stage 3: text slides up
     Stage 4: card stack fades in + "Tap to expand"
     Stage 5: cards spread to carousel (on tap)            */
  useEffect(() => {
    if (!intro) return;
    const pause = introParams.textPause;
    const t1 = 600;                  // beat before "Dear Aman," appears
    const t2 = t1 + pause;           // "Thank you" blurs in
    const t3 = t2 + pause;           // text splits apart
    const t4 = t3 + 400;             // cards start fading in as text is still splitting
    const timers = [
      setTimeout(() => setIntroStage(1), t1),
      setTimeout(() => setIntroStage(2), t2),
      setTimeout(() => setIntroStage(3), t3),
      setTimeout(() => setIntroStage(4), t4),
    ];
    return () => timers.forEach(clearTimeout);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Intro: Tap to expand → spread → carousel ─── */
  const handleTapBegin = useCallback(() => {
    if (introStage === null || introStage < 4 || introTapped) return;
    setIntroTapped(true);
    // Brief scale dip for tap feedback, then spread
    setTimeout(() => setIntroStage(5), 120);
    // Fade out text when cards settle into final positions
    const lastCardDelay = messages.length * introParams.spreadStagger;
    const spreadSettleTime = 120 + lastCardDelay + 500;
    setTimeout(() => setIntroTextVisible(false), spreadSettleTime);
    // Enable carousel after text fade completes
    setTimeout(() => setIntroStage(null), spreadSettleTime + 400);
  }, [introStage, introTapped, messages.length, introParams.spreadStagger]);

  // Continuous offset — 0 = card 0 centered, -SPREAD = card 1 centered, etc.
  const offsetX = useMotionValue(-initialIndex * SPREAD);
  const isDragging = useRef(false);
  const panStartOffset = useRef(0);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const count = messages.length;

  // Store SPREAD in a ref for stable callbacks
  const spreadRef = useRef(SPREAD);
  const prevSpreadRef = useRef(SPREAD);
  spreadRef.current = SPREAD;
  const settleSpringRef = useRef(SETTLE_SPRING);
  settleSpringRef.current = SETTLE_SPRING;

  // Resync offsetX when SPREAD changes (mobile detection, window resize)
  useEffect(() => {
    if (prevSpreadRef.current !== SPREAD) {
      prevSpreadRef.current = SPREAD;
      offsetX.set(-activeIndex * SPREAD);
    }
  }, [SPREAD, activeIndex, offsetX]);

  // Derive activeIndex from continuous offset (nearest card)
  useMotionValueEvent(offsetX, "change", (latest) => {
    if (!isDragging.current) return;
    const nearest = Math.round(-latest / spreadRef.current);
    const clamped = Math.max(0, Math.min(nearest, count - 1));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  });

  /* ── Settle to nearest card ────────────────── */

  const settleTo = useCallback(
    (index: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(index, count - 1));
      setActiveIndex(clamped);
      animRef.current = animate(offsetX, -clamped * spreadRef.current, {
        ...settleSpringRef.current,
        velocity,
      });
    },
    [count, offsetX]
  );

  /* ── Drag handlers ─────────────────────────── */

  const handlePanStart = useCallback(() => {
    isDragging.current = true;
    panStartOffset.current = offsetX.get();
    if (showSwipeHint) setShowSwipeHint(false);
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

      settleTo(clamped, info.velocity.x);

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
    if (isClosing) return;
    // Sync carousel to current expanded card before closing
    if (expandedIndex !== null) {
      animate(offsetX, -expandedIndex * spreadRef.current, { type: "spring", stiffness: 200, damping: 25 });
      setActiveIndex(expandedIndex);
    }
    // Clear expandedInitialIndex so carousel card signature is visible during close
    setExpandedInitialIndex(null);
    setIsClosing(true);
    setTimeout(() => {
      setExpandedIndex(null);
      setIsClosing(false);
    }, 400);
  }, [expandedIndex, offsetX, isClosing]);

  const navigateExpanded = useCallback(
    (index: number) => {
      if (isClosing) return;
      const clamped = Math.max(0, Math.min(index, count - 1));
      setExpandedIndex(clamped);
      setActiveIndex(clamped);
    },
    [count, isClosing]
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

  /* ── Swipe hint — show after intro, dismiss on timer or first swipe ── */
  useEffect(() => {
    if (introStage !== null || !intro) return;
    // Small delay so it appears after cards settle
    const show = setTimeout(() => setShowSwipeHint(true), 600);
    const hide = setTimeout(() => setShowSwipeHint(false), 4000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [introStage, intro]);

  /* ── Render ──────────────────────────────────── */

  const introComplete = introStage === null;

  return (
    <div className="relative flex flex-col items-center justify-center h-dvh overflow-hidden" style={{ touchAction: "pan-x" }}>

      {/* ── Intro text: "Dear Aman," slides UP, "Thank you" slides DOWN ── */}
      <AnimatePresence>
        {introStage !== null && introStage >= 1 && introTextVisible && (
          <motion.div
            key="intro-text-top"
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none will-change-transform"
            animate={introStage >= 3 ? { y: -(CARD_H / 2 + 90) } : { y: -24 }}
            exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 80, damping: 16, mass: 1 }}
          >
            <p
              className="text-3xl select-none transition-all ease-out"
              style={{
                color: "#3D2C1E",
                fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
                transitionDuration: `${introParams.textBlurIn}s`,
                filter: introStage >= 1 ? "blur(0px)" : "blur(12px)",
                opacity: introStage >= 1 ? 1 : 0,
                transform: introStage >= 1 ? "translateY(0)" : "translateY(8px)",
              }}
            >
              Dear Aman,
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {introStage !== null && introStage >= 1 && introTextVisible && (
          <motion.div
            key="intro-text-bottom"
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none will-change-transform"
            animate={introStage >= 3 ? { y: CARD_H / 2 + 90 } : { y: 24 }}
            exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 80, damping: 16, mass: 1 }}
          >
            <p
              className="text-3xl select-none transition-all ease-out"
              style={{
                color: "#3D2C1E",
                fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
                transitionDuration: `${introParams.textBlurIn}s`,
                filter: introStage >= 2 ? "blur(0px)" : "blur(12px)",
                opacity: introStage >= 2 ? 1 : 0,
                transform: introStage >= 2 ? "translateY(0)" : "translateY(8px)",
              }}
            >
              Thank you for everything!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Card area (carousel + intro stack share the same cards) ── */}
      <motion.div
        initial={intro ? { opacity: 0, filter: "blur(12px)" } : undefined}
        animate={{
          filter: expandedIndex !== null && !isClosing
            ? "blur(6px)"
            : introStage !== null && introStage < 4
              ? "blur(12px)"
              : "blur(0px)",
          opacity: expandedIndex !== null && !isClosing
            ? 0.4
            : introStage !== null && introStage < 4
              ? 0
              : 1,
          scale: introTapped && introStage !== null && introStage < 5 ? 0.97 : 1,
        }}
        transition={
          introTapped && introStage !== null && introStage < 5
            ? { type: "spring", stiffness: 600, damping: 15 }
            : introStage === 4
              ? { duration: introParams.stackFadeIn, ease: [0.25, 0.1, 0.25, 1] }
              : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
        }
      >
      {/* Carousel track */}
      <div className="relative w-full">
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            width: "100%",
            height: CARD_H + 40,
            touchAction: "pan-y",
            cursor: introComplete ? "grab" : "default",
          }}
          {...(introComplete ? {
            onPanStart: handlePanStart,
            onPan: handlePan,
            onPanEnd: handlePanEnd,
          } : {})}
        >
          {messages.map((msg, i) => (
          <CarouselCard
            key={`carousel-${i}`}
            msg={msg}
            index={i}
            theme={CARD_THEMES[msg.themeIndex]}
            offsetX={offsetX}
            activeIndex={activeIndex}
            isDragging={isDragging}
            isExpanding={expandedInitialIndex === i}
            spread={SPREAD}
            scaleSide={SCALE_SIDE}
            onTapActive={() => expandCard(i)}
            onTapSide={() => navigateTo(i)}
            introStage={introStage}
            stackPosition={stackPositions[i]}
            introConfig={introConfig}
          />
        ))}

          {/* "Tap to expand" card — on top of stack during stage 4 */}
          <AnimatePresence>
            {introStage === 4 && (
              <motion.div
                key="tap-card"
                className="absolute rounded-2xl flex items-center justify-center cursor-pointer"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: "#1E3B3B",
                  border: "1.5px solid rgba(10, 20, 20, 0.25)",
                  boxShadow: "0 4px 16px rgba(10, 20, 20, 0.2)",
                  zIndex: messages.length + 1,
                  rotate: 2.5,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                whileHover={{ rotate: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleTapBegin}
              >
                <motion.p
                  className="text-2xl tracking-wide select-none"
                  style={{
                    color: "#D4ECEC",
                    fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
                  }}
                  animate={{
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Tap to expand
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      </motion.div>

      {/* ── Swipe hint ── */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.p
            key="swipe-hint"
            className="absolute bottom-12 select-none pointer-events-none tracking-wide"
            style={{
              color: "rgba(61, 44, 30, 0.45)",
              fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
              fontSize: "0.875rem",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            ←&ensp;{isNarrow ? "Swipe" : "Drag"} to navigate&ensp;→
          </motion.p>
        )}
      </AnimatePresence>

      {/* Expanded card overlay */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <ExpandedOverlay
            messages={messages}
            currentIndex={expandedIndex}
            layoutIndex={expandedInitialIndex ?? expandedIndex}
            theme={CARD_THEMES[messages[expandedIndex].themeIndex]}
            onClose={collapseCard}
            onNavigate={navigateExpanded}
            spring={SPRING}
            springSnappy={SPRING_SNAPPY}
            crossfadeDuration={params.crossfadeDuration}
            backdropBlur={params.backdropBlur}
            showPeekingCards={!isNarrow}
            isClosing={isClosing}
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
  isDragging: React.RefObject<boolean>;
  isExpanding: boolean;
  spread: number;
  scaleSide: number;
  onTapActive: () => void;
  onTapSide: () => void;
  // Intro
  introStage: number | null;
  stackPosition: { x: number; y: number; rotate: number; scale: number };
  introConfig: {
    stackFadeIn: number;
    spring: { stiffness: number; damping: number };
    stagger: number;
    totalCards: number;
  };
}

const CarouselCard = memo(function CarouselCard({
  msg,
  index,
  theme,
  offsetX,
  activeIndex,
  isDragging,
  isExpanding,
  spread,
  scaleSide,
  onTapActive,
  onTapSide,
  introStage,
  stackPosition,
  introConfig,
}: CarouselCardProps) {
  const isActive = index === activeIndex;
  const isCenter = index === activeIndex;
  const baseRotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

  // Always compute useTransform (hooks must be unconditional)
  const xFromOffset = useTransform(offsetX, (v) => v + index * spread);
  const scaleFromX = useTransform(
    xFromOffset,
    [-spread * 2, -spread, 0, spread, spread * 2],
    [scaleSide * 0.85, scaleSide, SCALE_ACTIVE, scaleSide, scaleSide * 0.85]
  );
  const rotateFromX = useTransform(
    xFromOffset,
    [-spread, 0, spread],
    [baseRotation, 0, baseRotation]
  );

  // Local motion values — controlled by intro OR synced from useTransform
  const introActive = introStage !== null;
  const localX = useMotionValue(introActive ? 0 : xFromOffset.get());
  const localY = useMotionValue(0);
  const localScale = useMotionValue(introActive ? 1 : scaleFromX.get());
  const localRotate = useMotionValue(introActive ? 0 : rotateFromX.get());
  const localOpacity = useMotionValue(introActive ? 0 : 1);
  const cleanupRef = useRef<(() => void) | null>(null);

  const introComplete = introStage === null;

  // When intro completes → animate to useTransform values & subscribe
  useEffect(() => {
    if (!introComplete) return;

    const springCfg = { type: "spring" as const, stiffness: 150, damping: 20 };

    // Animate from intro final positions to carousel-derived positions
    animate(localX, xFromOffset.get(), springCfg);
    animate(localY, 0, springCfg);
    animate(localScale, scaleFromX.get(), springCfg);
    animate(localRotate, rotateFromX.get(), springCfg);
    localOpacity.set(1);

    // Subscribe after a short delay so the transition animation plays first
    const subTimer = setTimeout(() => {
      const unsubs = [
        xFromOffset.on("change", (v) => localX.set(v)),
        scaleFromX.on("change", (v) => localScale.set(v)),
        rotateFromX.on("change", (v) => localRotate.set(v)),
      ];
      // Store cleanup in ref-like pattern
      cleanupRef.current = () => unsubs.forEach((fn) => fn());
    }, 500);

    return () => {
      clearTimeout(subTimer);
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introComplete]);

  // Handle intro stage transitions
  useEffect(() => {
    if (introComplete) return;

    if (introStage === 4) {
      // Snap to stack position (parent handles blur + fade)
      localX.set(stackPosition.x);
      localY.set(stackPosition.y);
      localScale.set(stackPosition.scale);
      localRotate.set(stackPosition.rotate);
      localOpacity.set(1);
    } else if (introStage === 5) {
      // Animate from stack → carousel resting position
      // Deal from top: highest-index card (top of stack) peels off first
      const totalCards = introConfig.totalCards;
      const reverseDelay = (totalCards - 1 - index) * (introConfig.stagger / 1000);
      const targetX = (index - activeIndex) * spread;
      const targetScale = isCenter ? SCALE_ACTIVE : scaleSide;
      const targetRotate = isCenter ? 0 : baseRotation;
      const cfg = {
        type: "spring" as const,
        stiffness: introConfig.spring.stiffness,
        damping: introConfig.spring.damping,
        delay: reverseDelay,
      };
      animate(localX, targetX, cfg);
      animate(localY, 0, cfg);
      animate(localScale, targetScale, cfg);
      animate(localRotate, targetRotate, cfg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introStage]);

  // Derive z-index reactively from position — card closest to center is always on top
  const localZIndex = useTransform(localX, (x) => {
    if (introStage !== null && introStage <= 4) return index; // stack order during intro
    // Stage 5 (dealing) and carousel: position-based z-index (center = highest)
    return Math.max(0, Math.round(1000 - Math.abs(x)));
  });

  // Cull far off-screen cards (carousel mode only)
  const distFromCenter = Math.abs(index - activeIndex);
  if (introComplete && distFromCenter > 8) return null;

  return (
    <motion.div
      {...(introComplete ? { layoutId: `card-${index}` } : {})}
      className="absolute cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        x: localX,
        y: localY,
        scale: localScale,
        rotate: localRotate,
        opacity: localOpacity,
        zIndex: localZIndex,
      }}
      onClick={() => {
        if (!introComplete) return;
        if (isDragging.current) return;
        if (isActive) onTapActive();
        else onTapSide();
      }}
    >
      {/* Preview card */}
      <div
        className="w-full h-full overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl transition-shadow duration-500 ease-out"
        style={{
          backgroundColor: theme.bg,
          border: `1.5px solid rgba(${theme.shadowRgb}, ${theme.isDark ? 0.25 : 0.1})`,
          boxShadow: isActive && introComplete
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
});

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
  isClosing: boolean;
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
  isClosing,
}: ExpandedOverlayProps) {
  const message = messages[currentIndex];
  const currentTheme = CARD_THEMES[message.themeIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < messages.length - 1;

  // Track navigation direction for slide animation
  const prevIndexRef = useRef(currentIndex);
  const direction = currentIndex > prevIndexRef.current ? 1 : currentIndex < prevIndexRef.current ? -1 : 0;

  // Track outer container bg — only update after exit animation completes
  const [overlayBg, setOverlayBg] = useState(currentTheme.bg);

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
    // Reset scroll position on navigation
    el.scrollTop = 0;
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
        animate={isClosing
          ? { opacity: 0, backdropFilter: "blur(0px)" }
          : { opacity: 1, backdropFilter: `blur(${backdropBlur}px)` }
        }
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.3 }}
      />

      {/* Full-bleed expanded view */}
      <motion.div
        ref={scrollRef}
        {...(!isClosing ? { layoutId: `card-${layoutIndex}` } : {})}
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={false}
        animate={isClosing ? { opacity: 0, filter: "blur(20px)" } : { opacity: 1, filter: "blur(0px)" }}
        style={{ touchAction: "pan-y", backgroundColor: overlayBg }}
        transition={isClosing ? { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } : spring}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {/* Crossfading content — centered with max-width for readability */}
        <AnimatePresence mode="wait" custom={direction} onExitComplete={() => setOverlayBg(currentTheme.bg)}>
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
            <div className="w-full max-w-2xl mx-auto px-0 sm:px-6 pt-8 pb-16 sm:pt-16">
              <MessageCard
                sender={message.name}
                message={message.message}
                signature={SIGNATURE_MAP[message.name]}
                theme={currentTheme}
                fullBleed
                postscript={message.postscript}
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

      {/* Desktop: close button top-right — outside scroll container so fixed works */}
      {showPeekingCards && (
        <motion.button
          className="fixed top-5 right-5 z-60 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: hexToRgba(currentTheme.text, 0.1),
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isClosing ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ ...springSnappy, delay: isClosing ? 0 : 0.15 }}
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
          animate={isClosing ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ ...springSnappy, delay: isClosing ? 0 : 0.15 }}
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

      {/* Peeking prev/next preview cards */}
      <AnimatePresence>
        {hasPrev && mobilePeekVisible && peekReady && !isClosing && (
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
              opacity: 0,
              transition: { duration: 0.1 },
            }}
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          >
            <PeekingCardContent message={messages[currentIndex - 1]} />
          </motion.button>
        )}
        {hasNext && mobilePeekVisible && peekReady && !isClosing && (
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
              opacity: 0,
              transition: { duration: 0.1 },
            }}
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          >
            <PeekingCardContent message={messages[currentIndex + 1]} />
          </motion.button>
        )}
      </AnimatePresence>
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
