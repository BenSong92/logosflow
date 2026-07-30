"use client";

import { Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAnyVerseText } from "@/lib/bible/hooks";
import { findFiguresInText } from "@/lib/data/figure-match";

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

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }

  const figures = findFiguresInText(text);

  if (figures.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-ink-muted">
        이 구절에서는 등록된 인물을 찾지 못했어요. 이름이 문맥에 따라 다르게 표기되면 놓칠 수 있어요.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-muted">이 구절에 등장하는 인물 (총 {figures.length}명)</p>
      {figures.map((figure) => (
        <div key={figure.id} className="rounded-lg border border-border p-3">
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
      ))}
    </div>
  );
}
