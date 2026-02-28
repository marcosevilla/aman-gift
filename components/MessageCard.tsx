"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDialKit } from "dialkit";
import Image from "next/image";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { CardTheme } from "@/data/themes";

interface MessageCardProps {
  sender: string;
  message: string;
  signature?: string; // SVG filename in /public/signatures/
  theme: CardTheme;
  fullBleed?: boolean; // true in expanded view — no bg/shadow/radius
  inlinePhotos?: React.ReactNode; // rendered between paragraphs
  photoAfterParagraph?: number; // insert inlinePhotos after this paragraph index
  postscript?: string; // grey placeholder text rendered after signature
}

interface FloatingPhotosProps {
  photos: string[];
  sender: string;
  photoCaption?: string;
  theme: CardTheme;
  inline?: boolean; // true in expanded view — flex row instead of absolute
  audio?: string; // filename in /public/music/
}

// Positions for floating photos — percentage-based for mobile safety
const photoPositions = [
  { top: "-14%", right: "-6%", rotate: 4 },
  { bottom: "-12%", left: "-4%", rotate: -3 },
  { top: "8%", right: "-8%", rotate: -5 },
  { bottom: "-10%", right: "6%", rotate: 6 },
];

export function MessageCard({ sender, message, signature, theme, fullBleed, inlinePhotos, photoAfterParagraph, postscript }: MessageCardProps) {
  /* ── DialKit: Content Timing ────────────────── */
  const timing = useDialKit("Content Timing", {
    delayChildren: [0.15, 0, 0.8],
    staggerChildren: [0.12, 0, 0.4],
    messageDelay: [0.08, 0, 0.4],
    contentSpring: {
      stiffness: [200, 50, 500],
      damping: [20, 5, 40],
    },
  });

  /* ── DialKit: Letter Typography ──────────────── */
  const typo = useDialKit("Letter Typography", {
    fontSize: [20, 14, 28],
    lineHeight: [2.2, 1.2, 2.6],
    letterSpacing: [-0.2, -0.5, 1.5],
    paddingX: [42, 12, 48],
    paddingY: [40, 12, 48],
    signatureHeight: [52, 20, 72],
  });

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          delayChildren: timing.delayChildren,
          staggerChildren: timing.staggerChildren,
        },
      },
    }),
    [timing.delayChildren, timing.staggerChildren]
  );

  const nameVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          type: "spring" as const,
          stiffness: timing.contentSpring.stiffness,
          damping: timing.contentSpring.damping,
        },
      },
    }),
    [timing.contentSpring.stiffness, timing.contentSpring.damping]
  );

  const messageVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          type: "spring" as const,
          stiffness: timing.contentSpring.stiffness,
          damping: timing.contentSpring.damping,
          delay: timing.messageDelay,
        },
      },
    }),
    [timing.contentSpring.stiffness, timing.contentSpring.damping, timing.messageDelay]
  );

  return (
    <div
      className={fullBleed ? "select-none px-6 sm:px-[42px]" : "select-none rounded-2xl"}
      style={{
        ...(fullBleed ? {} : { backgroundColor: theme.bg }),
        fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
        paddingTop: `${typo.paddingY}px`,
        paddingBottom: `${typo.paddingY}px`,
        paddingLeft: fullBleed ? undefined : `${typo.paddingX}px`,
        paddingRight: fullBleed ? undefined : `${typo.paddingX}px`,
        ...(fullBleed ? {} : {
          boxShadow: `
            0 1px 2px rgba(${theme.shadowRgb}, 0.04),
            0 4px 8px rgba(${theme.shadowRgb}, 0.05),
            0 12px 24px rgba(${theme.shadowRgb}, 0.06),
            0 24px 48px rgba(${theme.shadowRgb}, 0.08)
          `,
        }),
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Message text */}
        {inlinePhotos != null && photoAfterParagraph != null ? (() => {
          const paragraphs = message.split("\n\n");
          const before = paragraphs.slice(0, photoAfterParagraph + 1).join("\n\n");
          const after = paragraphs.slice(photoAfterParagraph + 1).join("\n\n");
          return (
            <>
              <motion.p
                className="whitespace-pre-wrap"
                style={{
                  color: theme.text,
                  fontSize: `${typo.fontSize}px`,
                  lineHeight: typo.lineHeight,
                  letterSpacing: `${typo.letterSpacing}px`,
                }}
                variants={messageVariants}
              >
                {before}
              </motion.p>
              {inlinePhotos}
              {after && (
                <motion.p
                  className="whitespace-pre-wrap"
                  style={{
                    color: theme.text,
                    fontSize: `${typo.fontSize}px`,
                    lineHeight: typo.lineHeight,
                    letterSpacing: `${typo.letterSpacing}px`,
                  }}
                  variants={messageVariants}
                >
                  {after}
                </motion.p>
              )}
            </>
          );
        })() : (
          <motion.p
            className="whitespace-pre-wrap"
            style={{
              color: theme.text,
              fontSize: `${typo.fontSize}px`,
              lineHeight: typo.lineHeight,
              letterSpacing: `${typo.letterSpacing}px`,
            }}
            variants={messageVariants}
          >
            {message}
          </motion.p>
        )}

        {/* Handwritten signature at bottom-left */}
        {signature && (
          <motion.div
            className="mt-14"
            variants={messageVariants}
          >
            <div
              role="img"
              aria-label={sender}
              style={{
                height: `${typo.signatureHeight}px`,
                width: "240px",
                backgroundColor: theme.text,
                maskImage: `url(/signatures/${signature})`,
                WebkitMaskImage: `url(/signatures/${signature})`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "left center",
                WebkitMaskPosition: "left center",
              }}
            />
          </motion.div>
        )}

        {/* Grey placeholder box (e.g. Kevin's missing photo) */}
        {postscript && (
          <motion.div
            className="mt-10 rounded-xl px-6 py-8 text-center"
            style={{
              backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: theme.text,
              opacity: 0.6,
              fontSize: `${typo.fontSize - 2}px`,
              lineHeight: typo.lineHeight,
              fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif",
            }}
            variants={messageVariants}
          >
            {postscript}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function FloatingPhotos({
  photos,
  sender,
  photoCaption,
  theme,
  inline,
  audio,
}: FloatingPhotosProps) {
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  /* ── DialKit: Photo Entrance ────────────────── */
  const photoParams = useDialKit("Photo Entrance", {
    initialDelay: [0.25, 0, 1],
    stagger: [0.08, 0, 0.3],
    initialBlur: [8, 0, 24],
    photoSpring: {
      stiffness: [200, 50, 500],
      damping: [20, 5, 40],
    },
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeRef = useRef<number | null>(null);

  const fadeAudio = useCallback((el: HTMLAudioElement, from: number, to: number, duration: number, onDone?: () => void) => {
    if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);
    const start = performance.now();
    el.volume = from;
    const step = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      el.volume = from + (to - from) * t;
      if (t < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        fadeRef.current = null;
        onDone?.();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const handleEnded = () => {
      fadeAudio(el, el.volume, 0, 300, () => {
        setIsPlaying(false);
        el.currentTime = 0;
        el.volume = 1;
      });
    };
    el.addEventListener("ended", handleEnded);
    return () => el.removeEventListener("ended", handleEnded);
  }, [fadeAudio]);

  // Cleanup: fade out on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);
      const el = audioRef.current;
      if (el && !el.paused) {
        el.pause();
        el.volume = 1;
      }
    };
  }, []);

  const toggleAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      fadeAudio(el, el.volume, 0, 400, () => {
        el.pause();
        setIsPlaying(false);
      });
    } else {
      el.volume = 0;
      el.play();
      setIsPlaying(true);
      fadeAudio(el, 0, 1, 400);
    }
  }, [isPlaying, fadeAudio]);

  if (photos.length === 0) return null;

  /* ── Inline mode: photos in a flex row below message ── */
  if (inline) {
    return (
      <>
        {audio && <audio ref={audioRef} src={`/music/${audio}`} preload="metadata" />}
        <motion.div
          className={`flex flex-wrap justify-center gap-4 mt-14 mb-10 ${photos.length >= 4 ? "max-w-xl mx-auto" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: photoParams.initialDelay }}
        >
          {photos.map((photo, i) => {
            const rot = photoPositions[i % photoPositions.length].rotate;
            const isGrid = photos.length >= 2;
            return (
              <motion.div
                key={photo}
                className="cursor-pointer group"
                initial={{ opacity: 0, scale: 0.8, filter: `blur(${photoParams.initialBlur}px)` }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: rot,
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    stiffness: photoParams.photoSpring.stiffness,
                    damping: photoParams.photoSpring.damping,
                    delay: photoParams.initialDelay + i * photoParams.stagger,
                  },
                }}
                whileHover={{ scale: 1.05, rotate: 0 }}
                onClick={audio && i === 0 ? toggleAudio : () => setExpandedPhoto(photo)}
              >
                <div
                  className="bg-white p-1.5 pb-5 rounded shadow-md"
                  style={{
                    boxShadow: `
                      0 2px 8px rgba(${theme.shadowRgb}, 0.1),
                      0 8px 20px rgba(${theme.shadowRgb}, 0.14)
                    `,
                  }}
                >
                  <div className="relative">
                    <Image
                      src={`/photos/${photo}`}
                      alt={`Photo from ${sender}`}
                      width={400}
                      height={400}
                      className={isGrid ? "w-52 h-auto object-contain rounded-sm" : "w-80 h-auto object-contain rounded-sm"}
                      sizes={isGrid ? "208px" : "320px"}
                      loading="lazy"
                    />
                    {audio && i === 0 && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: isPlaying ? 0.85 : 1,
                          opacity: isPlaying ? 0.5 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                          {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                              <rect x="4" y="3" width="5" height="18" rx="1.5" />
                              <rect x="15" y="3" width="5" height="18" rx="1.5" />
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                              <path d="M6 3v18l14-9z" />
                            </svg>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {photoCaption && i === 0 && (
                    <p
                      className="text-sm mt-1.5 text-center italic"
                      style={{ color: "#3D2C1E", opacity: 0.7, maxWidth: isGrid ? "208px" : "320px", fontFamily: "var(--font-newsreader), 'Newsreader', Georgia, serif" }}
                    >
                      {photoCaption}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Expanded photo overlay — portal to body so it's above peeking cards */}
        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {expandedPhoto && (
              <motion.div
                key="photo-overlay"
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setExpandedPhoto(null)}
              >
                <motion.div
                  initial={{ filter: "blur(24px)", opacity: 0 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  exit={{ filter: "blur(24px)", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Image
                    src={`/photos/${expandedPhoto}`}
                    alt={`Photo from ${sender}`}
                    width={800}
                    height={600}
                    className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
                    sizes="90vw"
                    loading="lazy"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  }

  /* ── Floating mode: absolute positioned around card ── */
  return (
    <>
      {photos.map((photo, i) => {
        const pos = photoPositions[i % photoPositions.length];
        return (
          <motion.div
            key={photo}
            className="absolute z-20 cursor-pointer"
            style={{
              top: pos.top,
              right: pos.right,
              bottom: pos.bottom,
              left: pos.left,
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: 0, filter: `blur(${photoParams.initialBlur}px)` }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: pos.rotate,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: photoParams.photoSpring.stiffness,
                damping: photoParams.photoSpring.damping,
                delay: photoParams.initialDelay + i * photoParams.stagger,
              },
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            onClick={() => setExpandedPhoto(photo)}
          >
            <div
              className="bg-white p-1.5 pb-5 rounded shadow-md"
              style={{
                boxShadow: `
                  0 2px 8px rgba(61, 44, 30, 0.1),
                  0 8px 20px rgba(61, 44, 30, 0.14)
                `,
              }}
            >
              <Image
                src={`/photos/${photo}`}
                alt={`Photo from ${sender}`}
                width={300}
                height={200}
                className="w-28 h-20 object-cover rounded-sm"
                sizes="112px"
                loading="lazy"
              />
              {photoCaption && i === 0 && (
                <p
                  className="text-xs mt-0.5 text-center max-w-28 italic"
                  style={{ color: theme.text, opacity: 0.6 }}
                >
                  {photoCaption}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Expanded photo overlay — portal to body so it's above peeking cards */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {expandedPhoto && (
            <motion.div
              key="photo-overlay"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setExpandedPhoto(null)}
            >
              <motion.div
                initial={{ filter: "blur(24px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                exit={{ filter: "blur(24px)", opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Image
                  src={`/photos/${expandedPhoto}`}
                  alt={`Photo from ${sender}`}
                  width={800}
                  height={600}
                  className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
                  sizes="90vw"
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
