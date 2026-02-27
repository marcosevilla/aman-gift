"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDialKit } from "dialkit";

interface EnvelopeProps {
  onOpen: () => void;
}

export function Envelope({ onOpen }: EnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);

  /* ── DialKit: Envelope Opening ─────────────── */
  const env = useDialKit("Envelope", {
    flapDuration: [0.6, 0.2, 1.5],
    letterDelay: [0.4, 0, 1],
    letterDuration: [0.7, 0.2, 1.5],
    letterSlideY: [-120, -200, 0],
    bodyFadeDelay: [0.8, 0.2, 2],
    bodyFadeDuration: [0.5, 0.1, 1],
    phaseDelay: [1400, 500, 3000],
    bobAmplitude: [4, 0, 12],
    bobDuration: [3, 1, 6],
  });

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(onOpen, env.phaseDelay);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4">
      <motion.div
        className="relative w-[320px] h-[220px] cursor-pointer"
        onClick={handleOpen}
        whileTap={{ scale: 0.98 }}
        animate={
          !isOpening
            ? {
                y: [0, -env.bobAmplitude, 0],
                transition: {
                  duration: env.bobDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {}
        }
      >
        {/* Envelope body */}
        <motion.div
          className="absolute inset-0 bg-paper-300 rounded-xl overflow-hidden"
          style={{
            boxShadow: `
              0 4px 12px rgba(61, 44, 30, 0.1),
              0 20px 40px rgba(61, 44, 30, 0.15)
            `,
          }}
          animate={
            isOpening
              ? {
                  scale: 0.9,
                  y: 40,
                  opacity: 0,
                  transition: { delay: env.bodyFadeDelay, duration: env.bodyFadeDuration, ease: "easeIn" },
                }
              : {}
          }
        >
          {/* Envelope fold lines */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(135deg, transparent 38%, rgba(61,44,30,0.04) 38%, rgba(61,44,30,0.04) 39%, transparent 39%),
                linear-gradient(225deg, transparent 38%, rgba(61,44,30,0.04) 38%, rgba(61,44,30,0.04) 39%, transparent 39%)
              `,
            }}
          />
        </motion.div>

        {/* Envelope flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[110px] origin-top"
          style={{
            background: `linear-gradient(180deg, #D4B896 0%, #E8D5B7 100%)`,
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            borderRadius: "12px 12px 0 0",
            zIndex: isOpening ? 1 : 3,
          }}
          animate={
            isOpening
              ? {
                  rotateX: -180,
                  transition: { duration: env.flapDuration, ease: [0.4, 0, 0.2, 1] },
                }
              : {}
          }
        />

        {/* "For Aman" text on envelope */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pt-6 z-[2]"
          animate={
            isOpening
              ? { opacity: 0, transition: { duration: 0.3 } }
              : {}
          }
        >
          <p className="text-3xl text-ink italic">
            For Aman
          </p>
        </motion.div>

        {/* Letter sliding out — layoutId links to CoverCard for morph */}
        {isOpening && (
          <motion.div
            layoutId="letter-to-cover"
            className="absolute left-4 right-4 h-[180px] bg-paper-50 rounded-xl z-[4]"
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: env.letterSlideY,
              opacity: 1,
              transition: {
                delay: env.letterDelay,
                duration: env.letterDuration,
                ease: [0.2, 0, 0, 1],
              },
            }}
            style={{
              boxShadow: "0 4px 16px rgba(61, 44, 30, 0.12)",
            }}
          />
        )}
      </motion.div>

      {/* Tap instruction */}
      <motion.p
        className="mt-10 text-sm text-ink-faint"
        animate={
          !isOpening
            ? {
                opacity: [0.3, 0.7, 0.3],
                transition: { duration: 2.5, repeat: Infinity },
              }
            : { opacity: 0 }
        }
      >
        Tap to open
      </motion.p>
    </div>
  );
}
