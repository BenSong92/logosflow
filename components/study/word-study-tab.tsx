"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLexiconEntry, useWordLinks } from "@/lib/bible/hooks";
import type { LexiconEntry } from "@/types/bible";

function LexiconEntryCard({ strongNumber }: { strongNumber: string }) {
  const { data: entry, isLoading } = useLexiconEntry(strongNumber);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }
  if (!entry) return null;

  return <LexiconEntryBody entry={entry} />;
}

function LexiconEntryBody({ entry }: { entry: LexiconEntry }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-scripture text-lg text-ink">{entry.original}</div>
          <div className="text-xs text-ink-muted">{entry.transliteration}</div>
        </div>
        <Badge variant="outline">{entry.strongNumber}</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">
        {entry.definitionKo ?? entry.definition}
      </p>
      {!entry.definitionKo && (
        <p className="mt-1 text-[10px] text-ink-muted">
          아직 한글 번역이 준비되지 않아 영어 원문(스트롱 사전)을 보여드려요.
        </p>
      )}
      {entry.usageCount && (
        <p className="mt-2 text-[11px] text-ink-muted">
          KJV 전체 {entry.usageCount}회 사용 · {entry.language === "hebrew" ? "히브리어" : "헬라어"}
        </p>
      )}
    </>
  );
}

export function WordStudyTab({
  bookId,
  chapter,
  verse,
}: {
  bookId: string;
  chapter: number;
  verse: number;
}) {
  const { data: links, isLoading } = useWordLinks(bookId, chapter, verse, "KJV");

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }

  if (!links || links.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-ink-muted">
        이 구절에는 등록된 스트롱 원어 데이터가 아직 없어요.
      </p>
    );
  }

  // one card per unique Strong's number tagged to this verse, in reading order
  const seen = new Set<string>();
  const numbers: string[] = [];
  for (const [, strongNumbers] of links) {
    for (const num of strongNumbers) {
      if (!seen.has(num)) {
        seen.add(num);
        numbers.push(num);
      }
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-muted">
        KJV 본문 기준 스트롱 원어 태깅 (총 {numbers.length}개 단어)
      </p>
      {numbers.map((num) => (
        <div key={num} className="rounded-lg border border-border p-3">
          <LexiconEntryCard strongNumber={num} />
        </div>
      ))}
    </div>
  );
}
