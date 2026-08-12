"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnyVerseText, useCrossReferences } from "@/lib/bible/hooks";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { useReaderStore } from "@/lib/store/reader-store";
import { fetchXrefInsight } from "@/lib/ai/client";
import type { XrefEntry } from "@/lib/bible/loader";

function CrossRefRow({ xref, reason }: { xref: XrefEntry; reason?: string }) {
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
      {reason && (
        <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-relaxed text-accent">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
          {reason}
        </p>
      )}
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

  // Explicitly triggered (not auto-fired on tab open) — a verse can have a
  // dozen+ cross-references, and this spends real Gemini quota, so it should
  // only run when the user actually wants the explanations.
  const insight = useMutation({
    mutationFn: () =>
      fetchXrefInsight(
        { bookId, chapter, verse },
        (xrefs ?? []).map((x) => ({ bookId: x.b, chapter: x.c, verse: x.v }))
      ),
  });
  const reasonByIndex = new Map(
    insight.data?.status === "ok" ? insight.data.data.reasons.map((r) => [r.index, r.reason]) : []
  );

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
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => insight.mutate()}
          disabled={insight.isPending}
        >
          {insight.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          <Sparkles className="h-3 w-3 text-accent" />
          왜 연결되는지 AI로 설명
        </Button>
      </div>

      {insight.data?.status === "not_configured" && (
        <p className="text-xs text-ink-muted">AI 설명을 쓰려면 Gemini API 키 설정이 필요해요.</p>
      )}
      {insight.data?.status === "error" && (
        <p className="text-xs text-red-500">지금은 AI 설명을 쓸 수 없어요. 잠시 후 다시 시도해주세요.</p>
      )}

      {xrefs.map((xref, i) => (
        <CrossRefRow key={i} xref={xref} reason={reasonByIndex.get(i)} />
      ))}
    </div>
  );
}
