"use client";

import { motion } from "framer-motion";
import { useDialKit } from "dialkit";

interface CoverCardProps {
  onContinue: () => void;
}

export function CoverCard({ onContinue }: CoverCardProps) {
  /* ── DialKit: Cover Card ───────────────────── */
  const cover = useDialKit("Cover Card", {
    morphSpring: {
      stiffness: [150, 50, 400],
      damping: [20, 5, 40],
    },
    titleDelay: [0.6, 0, 2],
    nameDelay: [1.0, 0, 2],
    subtitleDelay: [1.6, 0, 3],
    chevronDelay: [2.4, 0, 4],
    textDuration: [0.8, 0.2, 2],
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6">
      <motion.div
        layoutId="letter-to-cover"
        className="bg-paper-50 rounded-2xl p-10 max-w-[380px] w-full text-center"
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: cover.morphSpring.stiffness, damping: cover.morphSpring.damping }}
        style={{
          boxShadow: `
            0 1px 3px rgba(61, 44, 30, 0.04),
            0 6px 12px rgba(61, 44, 30, 0.06),
            0 16px 32px rgba(61, 44, 30, 0.08)
          `,
        }}
      >
        <motion.p
          className="text-4xl text-ink leading-snug italic"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cover.titleDelay, duration: cover.textDuration, ease: "easeOut" }}
        >
          We&apos;ll miss you,
        </motion.p>
        <motion.p
          className="text-5xl text-terracotta mt-2 italic font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cover.nameDelay, duration: cover.textDuration, ease: "easeOut" }}
        >
          Aman
        </motion.p>

        <motion.p
          className="text-xl text-ink-light mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: cover.subtitleDelay, duration: 0.6 }}
        >
          From your friends at Canary
        </motion.p>

        {/* Subtle animated chevron instead of text CTA */}
        <motion.div
          className="mt-10 flex justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: cover.chevronDelay, duration: 0.6 }}
          onClick={onContinue}
        >
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-faint"
            animate={{
              y: [0, 4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
