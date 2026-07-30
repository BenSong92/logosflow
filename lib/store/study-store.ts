import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Highlight, HighlightColor } from "@/types/bible";

interface StudyState {
  highlights: Highlight[];
  setHighlight: (verseKey: string, color: HighlightColor) => void;
  clearHighlight: (verseKey: string) => void;
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      highlights: [],

      setHighlight: (verseKey, color) =>
        set((s) => {
          const existing = s.highlights.find((h) => h.verseKey === verseKey);
          if (existing) {
            return {
              highlights: s.highlights.map((h) =>
                h.verseKey === verseKey ? { ...h, color } : h
              ),
            };
          }
          return {
            highlights: [
              ...s.highlights,
              {
                id: makeId(),
                verseKey: verseKey as Highlight["verseKey"],
                color,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),

      clearHighlight: (verseKey) =>
        set((s) => ({ highlights: s.highlights.filter((h) => h.verseKey !== verseKey) })),
    }),
    { name: "logosflow-study" }
  )
);
