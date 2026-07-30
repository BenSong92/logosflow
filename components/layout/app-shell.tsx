"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ThemeSync } from "@/components/layout/theme-sync";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ReaderPanel } from "@/components/reader/reader-panel";
import { ResearchDrawer } from "@/components/study/research-drawer";
import { CommandPalette } from "@/components/search/command-palette";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/lib/store/reader-store";

export function AppShell() {
  const focusMode = useReaderStore((s) => s.focusMode);
  const setFocusMode = useReaderStore((s) => s.setFocusMode);
  const leftPanelOpen = useReaderStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useReaderStore((s) => s.rightPanelOpen);
  const setCommandPaletteOpen = useReaderStore((s) => s.setCommandPaletteOpen);
  const nextChapter = useReaderStore((s) => s.nextChapter);
  const prevChapter = useReaderStore((s) => s.prevChapter);
  const selectedVerseNumber = useReaderStore((s) => s.selectedVerseNumber);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const currentChapterVerseNumbers = useReaderStore((s) => s.currentChapterVerseNumbers);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      if (typing) return;

      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
        return;
      }
      if (e.key === "ArrowRight") {
        nextChapter();
        return;
      }
      if (e.key === "ArrowLeft") {
        prevChapter();
        return;
      }

      const lower = e.key.toLowerCase();
      if (lower === "j" || lower === "k") {
        const verses = currentChapterVerseNumbers;
        if (verses.length === 0) return;

        if (lower === "j") {
          const idx = selectedVerseNumber == null ? -1 : verses.indexOf(selectedVerseNumber);
          selectVerse(verses[Math.min(idx + 1, verses.length - 1)]);
        } else {
          const idx =
            selectedVerseNumber == null ? verses.length : verses.indexOf(selectedVerseNumber);
          selectVerse(verses[Math.max(idx - 1, 0)]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    focusMode,
    setFocusMode,
    setCommandPaletteOpen,
    nextChapter,
    prevChapter,
    selectedVerseNumber,
    selectVerse,
    currentChapterVerseNumbers,
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <ThemeSync />
      <CommandPalette />
      {!focusMode && <Header />}

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {!focusMode && leftPanelOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-r border-border"
            >
              <div className="h-full w-60">
                <SidebarNav />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <ReaderPanel />
        </main>

        <AnimatePresence initial={false}>
          {!focusMode && rightPanelOpen && (
            <motion.aside
              key="drawer"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-l border-border"
            >
              <div className="h-full w-80">
                <ResearchDrawer />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {focusMode && (
        <Button
          variant="subtle"
          size="sm"
          onClick={() => setFocusMode(false)}
          className="fixed right-4 top-4 z-50 gap-1.5 shadow-md"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          집중 모드 종료 (Esc)
        </Button>
      )}
    </div>
  );
}
