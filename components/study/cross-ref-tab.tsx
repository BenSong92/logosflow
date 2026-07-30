"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnyVerseText, useCrossReferences } from "@/lib/bible/hooks";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { useReaderStore } from "@/lib/store/reader-store";
import type { XrefEntry } from "@/lib/bible/loader";

function CrossRefRow({ xref }: { xref: XrefEntry }) {
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const book = BOOKS_BY_ID[xref.b];
  const { data: text, isLoading } = useAnyVerseText(xref.b, xref.c, xref.v);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">
          {book?.nameKo} {xref.c}:{xref.v}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            navigateTo(xref.b, xref.c);
            selectVerse(xref.v);
          }}
          aria-label="해당 구절로 이동"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
        ) : (
          text ?? <span className="text-ink-muted/70">(본문 미등록)</span>
        )}
      </p>
    </div>
  );
}

export function CrossRefTab({
  bookId,
  chapter,
  verse,
}: {
  bookId: string;
  chapter: number;
  verse: number;
}) {
  const { data: xrefs, isLoading } = useCrossReferences(bookId, chapter, verse);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }

  if (!xrefs || xrefs.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-ink-muted">
        이 구절에 연결된 관주가 아직 없어요.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {xrefs.map((xref, i) => (
        <CrossRefRow key={i} xref={xref} />
      ))}
    </div>
  );
}
