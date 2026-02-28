"use client";

import { MessageCarousel } from "@/components/MessageCarousel";
import { messages } from "@/data/messages";

export default function Home() {
  return (
    <main className="relative min-h-dvh bg-paper-100">
      <MessageCarousel messages={messages} initialIndex={9} intro />
    </main>
  );
}
