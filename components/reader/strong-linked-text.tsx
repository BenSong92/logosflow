"use client";

import { Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLexiconEntry } from "@/lib/bible/hooks";
import type { WordLinkSpan } from "@/types/bible";

function LexiconCard({ strongNumber }: { strongNumber: string }) {
  const { data: entry, isLoading } = useLexiconEntry(strongNumber);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />;
  }
  if (!entry) return null;

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-scripture text-lg text-ink">{entry.original}</div>
          <div className="text-xs text-ink-muted">{entry.transliteration}</div>
        </div>
        <Badge variant="outline">{entry.strongNumber}</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">{entry.definition}</p>
      {entry.usageCount && (
        <p className="mt-2 text-[11px] text-ink-muted">
          KJV 전체 {entry.usageCount}회 사용 · {entry.language === "hebrew" ? "히브리어" : "헬라어"}
        </p>
      )}
    </div>
  );
}

function StrongWord({ term, strongNumbers }: { term: string; strongNumbers: string[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="rounded-sm border-b-2 border-dotted border-accent/60 text-inherit transition-colors hover:bg-accent-soft"
        >
          {term}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 space-y-3 font-ui text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {strongNumbers.map((num, i) => (
          <div key={num}>
            {i > 0 && <div className="mb-3 h-px bg-border" />}
            <LexiconCard strongNumber={num} />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function StrongLinkedText({ text, links }: { text: string; links: WordLinkSpan[] }) {
  if (links.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  links.forEach(([term, strongNumbers], i) => {
    const idx = text.indexOf(term, cursor);
    if (idx === -1) return; // source text and displayed text diverged for this span; skip gracefully
    if (idx > cursor) nodes.push(text.slice(cursor, idx));
    nodes.push(<StrongWord key={i} term={term} strongNumbers={strongNumbers} />);
    cursor = idx + term.length;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <>{nodes}</>;
}
