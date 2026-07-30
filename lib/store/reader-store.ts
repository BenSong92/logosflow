import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BIBLE_BOOKS, BOOKS_BY_ID } from "@/lib/data/books";
import { DEFAULT_ACTIVE_TRANSLATIONS } from "@/lib/data/translations";
import { CHRONOLOGICAL_BOOK_ORDER, CHRONOLOGICAL_INDEX } from "@/lib/data/chronological";
import type { TranslationCode } from "@/types/bible";

export type ThemeMode = "light" | "dark" | "system";
export type ScriptureFont = "serif" | "sans";
export type ReadingOrder = "canonical" | "chronological";

interface ReaderState {
  theme: ThemeMode;
  fontSize: number;
  lineHeight: number;
  scriptureFont: ScriptureFont;
  focusMode: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  /** Mobile-only panel state — deliberately not persisted, so phones always start with both closed
   * regardless of what leftPanelOpen/rightPanelOpen were left at on desktop. Only one open at a time. */
  mobileOpenPanel: "left" | "right" | null;
  /** The figure name currently pinned/hovered in the 인물 tab — highlighted wherever it appears in the reader. Not persisted. */
  hoveredFigureName: string | null;
  activeTranslations: TranslationCode[];
  readingOrder: ReadingOrder;
  currentBookId: string;
  currentChapter: number;
  selectedVerseNumber: number | null;
  commandPaletteOpen: boolean;
  /** Verse numbers loaded for the current chapter — set by ReaderPanel once its async fetch
   * resolves, so keyboard nav (J/K) knows the bounds without re-fetching. */
  currentChapterVerseNumbers: number[];

  setTheme: (t: ThemeMode) => void;
  setFontSize: (n: number) => void;
  setLineHeight: (n: number) => void;
  setScriptureFont: (f: ScriptureFont) => void;
  toggleFocusMode: () => void;
  setFocusMode: (v: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setMobileOpenPanel: (panel: "left" | "right" | null) => void;
  setHoveredFigureName: (name: string | null) => void;
  toggleTranslation: (code: TranslationCode) => void;
  setReadingOrder: (order: ReadingOrder) => void;
  navigateTo: (bookId: string, chapter: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  selectVerse: (n: number | null) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setCurrentChapterVerseNumbers: (verses: number[]) => void;
}

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 24;
const LINE_HEIGHT_MIN = 1.6;
const LINE_HEIGHT_MAX = 2.0;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      theme: "system",
      fontSize: 18,
      lineHeight: 1.8,
      scriptureFont: "serif",
      focusMode: false,
      leftPanelOpen: true,
      rightPanelOpen: true,
      mobileOpenPanel: null,
      hoveredFigureName: null,
      activeTranslations: DEFAULT_ACTIVE_TRANSLATIONS,
      readingOrder: "canonical",
      currentBookId: "GEN",
      currentChapter: 1,
      selectedVerseNumber: null,
      commandPaletteOpen: false,
      currentChapterVerseNumbers: [],

      setTheme: (theme) => set({ theme }),
      setFontSize: (n) => set({ fontSize: clamp(n, FONT_SIZE_MIN, FONT_SIZE_MAX) }),
      setLineHeight: (n) => set({ lineHeight: clamp(n, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX) }),
      setScriptureFont: (scriptureFont) => set({ scriptureFont }),
      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
      setFocusMode: (v) => set({ focusMode: v }),
      toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
      toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
      setMobileOpenPanel: (panel) => set({ mobileOpenPanel: panel }),
      setHoveredFigureName: (name) => set({ hoveredFigureName: name }),
      toggleTranslation: (code) =>
        set((s) => {
          const has = s.activeTranslations.includes(code);
          if (has) {
            if (s.activeTranslations.length === 1) return s;
            return { activeTranslations: s.activeTranslations.filter((c) => c !== code) };
          }
          if (s.activeTranslations.length >= 3) {
            return { activeTranslations: [...s.activeTranslations.slice(1), code] };
          }
          return { activeTranslations: [...s.activeTranslations, code] };
        }),
      setReadingOrder: (readingOrder) => set({ readingOrder }),
      navigateTo: (bookId, chapter) =>
        set({
          currentBookId: bookId,
          currentChapter: chapter,
          selectedVerseNumber: null,
          hoveredFigureName: null,
        }),
      nextChapter: () => {
        const { currentBookId, currentChapter, readingOrder } = get();
        const book = BOOKS_BY_ID[currentBookId];
        if (!book) return;
        if (currentChapter < book.chapterCount) {
          set({ currentChapter: currentChapter + 1, selectedVerseNumber: null, hoveredFigureName: null });
          return;
        }
        const nextBook =
          readingOrder === "chronological"
            ? BOOKS_BY_ID[CHRONOLOGICAL_BOOK_ORDER[CHRONOLOGICAL_INDEX[currentBookId] + 1]]
            : BIBLE_BOOKS.find((b) => b.order === book.order + 1);
        if (nextBook) {
          set({
            currentBookId: nextBook.id,
            currentChapter: 1,
            selectedVerseNumber: null,
            hoveredFigureName: null,
          });
        }
      },
      prevChapter: () => {
        const { currentBookId, currentChapter, readingOrder } = get();
        const book = BOOKS_BY_ID[currentBookId];
        if (!book) return;
        if (currentChapter > 1) {
          set({ currentChapter: currentChapter - 1, selectedVerseNumber: null, hoveredFigureName: null });
          return;
        }
        const prevBook =
          readingOrder === "chronological"
            ? BOOKS_BY_ID[CHRONOLOGICAL_BOOK_ORDER[CHRONOLOGICAL_INDEX[currentBookId] - 1]]
            : BIBLE_BOOKS.find((b) => b.order === book.order - 1);
        if (prevBook) {
          set({
            currentBookId: prevBook.id,
            currentChapter: prevBook.chapterCount,
            selectedVerseNumber: null,
            hoveredFigureName: null,
          });
        }
      },
      selectVerse: (n) => set({ selectedVerseNumber: n, hoveredFigureName: null }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setCurrentChapterVerseNumbers: (verses) => set({ currentChapterVerseNumbers: verses }),
    }),
    {
      name: "logosflow-reader",
      partialize: (s) => ({
        theme: s.theme,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        scriptureFont: s.scriptureFont,
        leftPanelOpen: s.leftPanelOpen,
        rightPanelOpen: s.rightPanelOpen,
        activeTranslations: s.activeTranslations,
        readingOrder: s.readingOrder,
        currentBookId: s.currentBookId,
        currentChapter: s.currentChapter,
      }),
    }
  )
);

export const READER_LIMITS = {
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_MAX,
};
