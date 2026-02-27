"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FinalCardProps {
  onRestart: () => void;
  messageCount: number;
}

export function FinalCard({ onRestart, messageCount }: FinalCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(900);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
  }, []);

  const [particles] = useState(() => {
    const colors = ["#C45D3E", "#C4922A", "#D4A574", "#E8B87D", "#6B8F6B"];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: (Math.random() - 0.5) * 100,
      spin: Math.random() * 360,
      duration: 2.5 + Math.random() * 1.5,
    }));
  });

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center min-h-dvh px-6 overflow-hidden"
    >
      {/* Confetti particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: -10,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
          animate={{
            y: viewportHeight + 20,
            opacity: [1, 1, 0],
            rotate: p.spin,
            x: p.drift,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}

      <motion.div
        className="bg-paper-50 rounded-2xl p-10 max-w-[380px] w-full text-center relative z-10"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.3 }}
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
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Good luck on your next adventure
        </motion.p>

        <motion.p
          className="text-xl text-ink-light mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          {messageCount} messages from people who think you&apos;re pretty great.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
        >
          <button
            onClick={onRestart}
            className="text-sm text-ink-light hover:text-terracotta transition-colors"
          >
            Read them again &larr;
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
