"use client";

import { Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAnyVerseText } from "@/lib/bible/hooks";
import { findFiguresInText } from "@/lib/data/figure-match";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { useReaderStore } from "@/lib/store/reader-store";
import { cn } from "@/lib/utils";

const TESTAMENT_LABEL: Record<string, string> = {
  OT: "구약",
  NT: "신약",
  both: "구약·신약",
};

export function FiguresTab({
  bookId,
  chapter,
  verse,
}: {
  bookId: string;
  chapter: number;
  verse: number;
}) {
  const { data: text, isLoading } = useAnyVerseText(bookId, chapter, verse);
  const hoveredFigureName = useReaderStore((s) => s.hoveredFigureName);
  const setHoveredFigureName = useReaderStore((s) => s.setHoveredFigureName);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }

  const testament = BOOKS_BY_ID[bookId]?.testament;
  const matches = findFiguresInText(text, testament);

  if (matches.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-ink-muted">
        이 구절에서는 등록된 인물을 찾지 못했어요. 이름이 문맥에 따라 다르게 표기되면 놓칠 수 있어요.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-muted">
        이 구절에 등장하는 인물 (총 {matches.length}명) — 눌러보면 본문에서 위치가 표시돼요
      </p>
      {matches.map(({ figure, matchedName }) => {
        const active = hoveredFigureName === matchedName;
        return (
          <div
            key={figure.id}
            role="button"
            tabIndex={0}
            onClick={() => setHoveredFigureName(active ? null : matchedName)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHoveredFigureName(active ? null : matchedName);
              }
            }}
            className={cn(
              "w-full cursor-pointer rounded-lg border p-3 text-left transition-colors",
              active ? "border-accent bg-accent-soft" : "border-border hover:bg-paper-raised"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-accent" />
                <span className="font-scripture text-base text-ink">{figure.nameKo}</span>
                <span className="text-xs text-ink-muted">{figure.nameEn}</span>
              </div>
              <Badge variant="outline">{TESTAMENT_LABEL[figure.testament]}</Badge>
            </div>
            <p className="mt-1 text-xs font-medium text-accent">{figure.role}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{figure.description}</p>
          </div>
        );
      })}
    </div>
  );
}
