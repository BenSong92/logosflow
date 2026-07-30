"use client";

import { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VerseRow } from "@/components/reader/verse-row";
import { EmptyChapterState } from "@/components/reader/empty-chapter-state";
import { TRANSLATIONS_BY_CODE } from "@/lib/data/translations";
import { useChapterVerses } from "@/lib/bible/hooks";
import { useReaderStore } from "@/lib/store/reader-store";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

export function ReaderPanel() {
  const bookId = useReaderStore((s) => s.currentBookId);
  const chapter = useReaderStore((s) => s.currentChapter);
  const activeTranslations = useReaderStore((s) => s.activeTranslations);
  const setCurrentChapterVerseNumbers = useReaderStore((s) => s.setCurrentChapterVerseNumbers);

  const { data: chapterVerses, isLoading, isError } = useChapterVerses(
    bookId,
    chapter,
    activeTranslations
  );
  const isMobile = useIsMobile();

  const verseNumbers = useMemo(
    () => Object.keys(chapterVerses ?? {}).map(Number).sort((a, b) => a - b),
    [chapterVerses]
  );

  useEffect(() => {
    setCurrentChapterVerseNumbers(verseNumbers);
  }, [verseNumbers, setCurrentChapterVerseNumbers]);

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `2.5rem repeat(${activeTranslations.length}, minmax(0, 1fr))`,
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (isError || verseNumbers.length === 0) {
    return <EmptyChapterState bookId={bookId} chapter={chapter} />;
  }

  return (
    <ScrollArea className="h-full scroll-thin">
      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
        {!isMobile && (
          <div
            className="sticky top-0 z-10 -mx-6 mb-3 grid gap-4 border-b border-border bg-paper/95 px-6 py-2 backdrop-blur"
            style={gridStyle}
          >
            <div />
            {activeTranslations.map((code) => {
              const t = TRANSLATIONS_BY_CODE[code];
              return (
                <div key={code} className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {t?.nameKo}
                  {t?.attribution && (
                    <span className="ml-1 font-normal normal-case text-ink-muted/70">
                      {t.attribution}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-col gap-0.5 pb-16">
          {verseNumbers.map((num) => (
            <VerseRow
              key={num}
              bookId={bookId}
              chapter={chapter}
              verseNumber={num}
              texts={chapterVerses![num]}
              translations={activeTranslations}
              gridStyle={gridStyle}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
