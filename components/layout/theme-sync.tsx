"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/lib/store/reader-store";

/** Keeps <html data-theme="..."> in sync with the persisted theme choice. */
export function ThemeSync() {
  const theme = useReaderStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}
