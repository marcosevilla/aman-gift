"use client";

import { useState, useEffect } from "react";

export function DevToolsToggle({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D (or Cmd+Shift+D on Mac) toggles dev tools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "d") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!visible) return null;
  return <>{children}</>;
}
