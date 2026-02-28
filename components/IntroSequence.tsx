"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDialKit } from "dialkit";
import type { TeamMessage } from "@/data/messages";
import { CARD_THEMES } from "@/data/themes";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — IntroSequence
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   Stage 0 — blank screen
 *    0ms   Stage 1 — "Dear Aman," blurs in (centered)
 * 1000ms   Stage 2 — "Thank you for everything!" blurs in below
 * 2000ms   Stage 3 — text slides UP above center, card stack
 *                     fades in (blur 3px, askew), "Tap to begin"
 *                     pulses below stack
 *   [tap]  tapped  — stack scale dips to 0.97 (tap feedback)
 *  +120ms  Stage 4 — cards spread to carousel resting positions
 *                     (staggered spring), text blurs out, CTA gone
 *  +1.5s   swap    — IntroSequence unmounts, MessageCarousel
 *                     mounts instantly with skipEntrance (no fade)
 * ───────────────────────────────────────────────────────── */

/** Deterministic per-card rotations — reused from MessageCarousel */
const CARD_ROTATIONS = [
  -3.2, 2.8, -1.5, 4.1, -2.7, 1.9, -4.3, 3.5,
  -1.8, 2.4, -3.6, 1.2, -2.1, 3.8, -4.5, 2.6,
  -1.4, 3.1,
];

const CARD_W = 260;
const CARD_H = 347;
const SPREAD_DESKTOP = 100;
const SPREAD_NARROW = 70;
const INITIAL_INDEX = 9; // center card for carousel handoff

/** Deterministic jitter — seeded per index so it's stable across renders */
function seededJitter(i: number): { x: number; y: number } {
  const seed = Math.sin(i * 9301 + 49297) * 49297;
  const x = ((seed % 1000) / 1000 - 0.5) * 10; // ±5px
  const y2 = ((Math.sin(i * 1301 + 7927) * 7927) % 1000) / 1000;
  const yJitter = (y2 - 0.5) * 6; // ±3px
  return { x, y: yJitter };
}

interface IntroSequenceProps {
  messages: TeamMessage[];
  onComplete: () => void;
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
};

export function IntroSequence({ messages, onComplete }: IntroSequenceProps) {
  const [stage, setStage] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const spread = isNarrow ? SPREAD_NARROW : SPREAD_DESKTOP;

  /* ── DialKit: Intro ──────────────────────────── */
  const intro = useDialKit("Intro", {
    textBlurIn: [0.8, 0.3, 1.5],
    textPause: [1000, 400, 2000],
    stackFadeIn: [0.6, 0.2, 1.2],
    spreadStagger: [50, 20, 120],
    spreadSpring: {
      stiffness: [200, 80, 400],
      damping: [22, 10, 40],
    },
  });

  /* ── Stack positions (deterministic) ──────────── */
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

  /* ── Stage progression — auto-advance 0→3 ───── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 0),
      setTimeout(() => setStage(2), intro.textPause),
      setTimeout(() => setStage(3), intro.textPause * 2),
    ];
    return () => timers.forEach(clearTimeout);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Stage 4: spread to carousel → complete ──── */
  const handleTapBegin = () => {
    if (stage < 3 || tapped) return;
    setTapped(true);
    // Brief scale dip for tap feedback, then spread
    setTimeout(() => setStage(4), 120);
    // Wait for spread to settle (last card delay + spring settle)
    const lastCardDelay = messages.length * intro.spreadStagger;
    setTimeout(onComplete, 120 + lastCardDelay + 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4">
      {/* ── Text: persists from stage 1, slides up at stage 3, fades at stage 4 ── */}
      <AnimatePresence>
        {stage >= 1 && stage < 4 && (
          <motion.div
            key="text-container"
            className="flex flex-col items-center gap-3 z-10"
            animate={stage >= 3 ? { y: -(CARD_H / 2 + 130) } : { y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
          >
            <motion.p
              className="text-3xl select-none"
              style={{
                color: "#3D2C1E",
                fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
              }}
              initial={{ filter: "blur(12px)", opacity: 0, y: 8 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{
                duration: intro.textBlurIn,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              Dear Aman,
            </motion.p>

            <motion.p
              className="text-3xl select-none"
              style={{
                color: "#3D2C1E",
                fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
              }}
              initial={{ filter: "blur(12px)", opacity: 0, y: 8 }}
              animate={
                stage >= 2
                  ? { filter: "blur(0px)", opacity: 1, y: 0 }
                  : { filter: "blur(12px)", opacity: 0, y: 8 }
              }
              transition={{
                duration: intro.textBlurIn,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              Thank you for everything!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage 3+: Card stack → spread to carousel positions ── */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div
            key="card-stack"
            className="absolute cursor-pointer"
            style={{ width: CARD_W, height: CARD_H }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              scale: tapped && stage < 4 ? 0.97 : 1,
            }}
            transition={
              tapped && stage < 4
                ? { type: "spring", stiffness: 600, damping: 15 }
                : { duration: intro.stackFadeIn }
            }
            onClick={handleTapBegin}
          >
            {/* Message cards — underneath the "Tap to begin" card */}
            {messages.map((msg, i) => {
              const theme = CARD_THEMES[msg.themeIndex];
              const pos = stackPositions[i];
              const isCenter = i === INITIAL_INDEX;
              const distFromCenter = Math.abs(i - INITIAL_INDEX);

              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center p-5"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    backgroundColor: theme.bg,
                    border: `1.5px solid rgba(${theme.shadowRgb}, ${theme.isDark ? 0.25 : 0.1})`,
                    boxShadow: `0 2px 8px rgba(${theme.shadowRgb}, 0.08)`,
                    zIndex: stage === 4
                      ? (isCenter ? 10 : 5 - distFromCenter)
                      : i,
                  }}
                  initial={{
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rotate,
                    scale: pos.scale,
                    filter: "blur(0px)",
                  }}
                  animate={
                    stage === 4
                      ? {
                          x: (i - INITIAL_INDEX) * spread,
                          y: 0,
                          rotate: isCenter ? 0 : CARD_ROTATIONS[i % CARD_ROTATIONS.length],
                          scale: isCenter ? 1.0 : 0.6,
                          filter: "blur(0px)",
                        }
                      : {
                          x: pos.x,
                          y: pos.y,
                          rotate: pos.rotate,
                          scale: pos.scale,
                          filter: "blur(0px)",
                        }
                  }
                  transition={
                    stage === 4
                      ? {
                          type: "spring",
                          stiffness: intro.spreadSpring.stiffness,
                          damping: intro.spreadSpring.damping,
                          delay: i * (intro.spreadStagger / 1000),
                        }
                      : { duration: 0.3 }
                  }
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
                    <p
                      className="text-3xl font-bold italic"
                      style={{ color: theme.text }}
                    >
                      {msg.name}
                    </p>
                  )}
                </motion.div>
              );
            })}

            {/* "Tap to begin" card — sits on top of the stack, fades out on spread */}
            <AnimatePresence>
              {stage === 3 && (
                <motion.div
                  key="tap-card"
                  className="absolute inset-0 rounded-2xl flex items-center justify-center"
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
                    Tap to begin
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
