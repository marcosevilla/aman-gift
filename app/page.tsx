"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Envelope } from "@/components/Envelope";
import { CoverCard } from "@/components/CoverCard";
import { MessageCarousel } from "@/components/MessageCarousel";
import { messages } from "@/data/messages";

type Phase = "envelope" | "cover" | "messages";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("envelope");

  return (
    <main className="relative min-h-dvh bg-paper-100">
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {phase === "envelope" && (
            <motion.div
              key="envelope"
              className="absolute inset-0"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Envelope onOpen={() => setPhase("cover")} />
            </motion.div>
          )}

          {phase === "cover" && (
            <motion.div
              key="cover"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <CoverCard onContinue={() => setPhase("messages")} />
            </motion.div>
          )}

          {phase === "messages" && (
            <motion.div
              key="messages"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageCarousel messages={messages} />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </main>
  );
}
