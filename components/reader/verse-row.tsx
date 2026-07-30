"use client";

import type { CSSProperties } from "react";
import { StrongLinkedText } from "@/components/reader/strong-linked-text";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCrossReferences, useWordLinks } from "@/lib/bible/hooks";
import { verseKey } from "@/lib/data/verses";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { TRANSLATIONS_BY_CODE } from "@/lib/data/translations";
import { useReaderStore } from "@/lib/store/reader-store";
import { useStudyStore } from "@/lib/store/study-store";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import type { HighlightColor, TranslationCode } from "@/types/bible";

/** Tailwind's scanner needs literal class strings, so this can't be a template literal. */
const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: "bg-highlight-yellow",
  green: "bg-highlight-green",
  blue: "bg-highlight-blue",
  pink: "bg-highlight-pink",
  purple: "bg-highlight-purple",
};

interface VerseRowProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  texts: Partial<Record<string, string>>;
  translations: TranslationCode[];
  gridStyle: CSSProperties;
}

export function VerseRow({ bookId, chapter, verseNumber, texts, translations, gridStyle }: VerseRowProps) {
  const vKey = verseKey(bookId, chapter, verseNumber);
  const selectedVerseNumber = useReaderStore((s) => s.selectedVerseNumber);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const rightPanelOpen = useReaderStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useReaderStore((s) => s.toggleRightPanel);
  const mobileOpenPanel = useReaderStore((s) => s.mobileOpenPanel);
  const setMobileOpenPanel = useReaderStore((s) => s.setMobileOpenPanel);
  const fontSize = useReaderStore((s) => s.fontSize);
  const lineHeight = useReaderStore((s) => s.lineHeight);
  const scriptureFont = useReaderStore((s) => s.scriptureFont);
  const highlight = useStudyStore((s) => s.highlights.find((h) => h.verseKey === vKey));
  const isMobile = useIsMobile();

  const isSelected = selectedVerseNumber === verseNumber;
  const { data: crossRefs } = useCrossReferences(bookId, chapter, verseNumber);
  const crossRefCount = crossRefs?.length ?? 0;
  const crossRefPreview = (crossRefs ?? [])
    .slice(0, 3)
    .map((x) => `${BOOKS_BY_ID[x.b]?.nameKo ?? x.b} ${x.c}:${x.v}`)
    .join(" · ");

  const handleSelect = () => {
    selectVerse(isSelected ? null : verseNumber);
    if (isMobile) {
      if (mobileOpenPanel !== "right") setMobileOpenPanel("right");
    } else if (!rightPanelOpen) {
      toggleRightPanel();
    }
  };

  const verseNumBadge = (
    <span className="flex select-none items-center gap-1 text-xs font-semibold text-ink-muted">
      {crossRefCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              onClick={(e) => e.stopPropagation()}
              className="h-1.5 w-1.5 rounded-full bg-crossref"
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            관주 {crossRefCount}건 — {crossRefPreview}
            {crossRefCount > 3 && ` 외 ${crossRefCount - 3}건`}
          </TooltipContent>
        </Tooltip>
      )}
      {verseNumber}
    </span>
  );

  if (isMobile) {
    return (
      <div
        onClick={handleSelect}
        className={cn(
          "cursor-pointer rounded-lg px-2 py-2 transition-colors",
          isSelected ? "ring-2 ring-accent/60" : "hover:bg-paper-raised",
          highlight && HIGHLIGHT_BG[highlight.color]
        )}
      >
        <div className="mb-1">{verseNumBadge}</div>
        <div className="flex flex-col gap-2">
          {translations.map((code) => (
            <div key={code}>
              {translations.length > 1 && (
                <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-ink-muted/70">
                  {TRANSLATIONS_BY_CODE[code]?.nameKo ?? code}
                </span>
              )}
              <VerseTranslationCell
                bookId={bookId}
                chapter={chapter}
                verseNumber={verseNumber}
                code={code}
                text={texts[code]}
                fontSize={fontSize}
                lineHeight={lineHeight}
                scriptureFont={scriptureFont}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "grid cursor-pointer gap-4 rounded-lg px-2 py-1.5 transition-colors",
        isSelected ? "ring-2 ring-accent/60" : "hover:bg-paper-raised",
        highlight && HIGHLIGHT_BG[highlight.color]
      )}
      style={gridStyle}
    >
      <div className="flex items-start justify-end pt-1">{verseNumBadge}</div>
      {translations.map((code) => (
        <VerseTranslationCell
          key={code}
          bookId={bookId}
          chapter={chapter}
          verseNumber={verseNumber}
          code={code}
          text={texts[code]}
          fontSize={fontSize}
          lineHeight={lineHeight}
          scriptureFont={scriptureFont}
        />
      ))}
    </div>
  );
}

function VerseTranslationCell({
  bookId,
  chapter,
  verseNumber,
  code,
  text,
  fontSize,
  lineHeight,
  scriptureFont,
}: {
  bookId: string;
  chapter: number;
  verseNumber: number;
  code: TranslationCode;
  text: string | undefined;
  fontSize: number;
  lineHeight: number;
  scriptureFont: string;
}) {
  const { data: links } = useWordLinks(bookId, chapter, verseNumber, code);

  return (
    <p
      className="scripture-text text-ink"
      style={{
        fontSize,
        lineHeight,
        fontFamily: scriptureFont === "sans" ? "var(--font-ui)" : "var(--font-scripture)",
      }}
    >
      {text ? (
        <StrongLinkedText text={text} links={links ?? []} />
      ) : (
        <span className="text-ink-muted/60">
          {TRANSLATIONS_BY_CODE[code]?.licenseStatus === "pending-license"
            ? "(라이선스 확보 후 제공 예정)"
            : "(이 번역의 본문 없음)"}
        </span>
      )}
    </p>
  );
}
