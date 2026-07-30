"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BIBLE_BOOKS, BOOKS_BY_ID } from "@/lib/data/books";
import { semanticSearch } from "@/lib/data/ai-mock";
import { useReaderStore } from "@/lib/store/reader-store";
import type { SearchResult } from "@/types/bible";

/** Parses inputs like "창세기 1", "요 3:16", "GEN 1", "에스라 9:13". */
function parseReference(query: string) {
  const trimmed = query.trim();
  const match = trimmed.match(/^([1-3]?[가-힣a-zA-Z]+)\s*(\d+)?(?::(\d+))?$/);
  if (!match) return null;
  const [, namePart, chapterPart, versePart] = match;
  const book = BIBLE_BOOKS.find(
    (b) =>
      b.nameKo === namePart ||
      b.abbrKo === namePart ||
      b.id.toLowerCase() === namePart.toLowerCase() ||
      b.nameEn.toLowerCase() === namePart.toLowerCase()
  );
  if (!book) return null;
  const chapter = chapterPart ? Number(chapterPart) : 1;
  const verse = versePart ? Number(versePart) : undefined;
  return { book, chapter, verse };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

async function fetchSearch(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const { results } = await res.json();
  return results;
}

export function CommandPalette() {
  const open = useReaderStore((s) => s.commandPaletteOpen);
  const setOpen = useReaderStore((s) => s.setCommandPaletteOpen);
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const reference = useMemo(() => parseReference(query), [query]);
  const referenceOutOfRange = reference ? reference.chapter > reference.book.chapterCount : false;

  const textSearch = useQuery({
    queryKey: ["text-search", debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
  });
  const textResults = textSearch.data ?? [];

  const semanticQuery = useQuery({
    queryKey: ["semantic-search", debouncedQuery],
    queryFn: () => semanticSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 4 && textResults.length === 0 && !textSearch.isFetching,
  });

  const go = (bookId: string, chapter: number, verse?: number) => {
    navigateTo(bookId, chapter);
    if (verse) selectVerse(verse);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 p-0" hideClose>
        <DialogTitle className="sr-only">검색</DialogTitle>
        <DialogDescription className="sr-only">
          책, 장, 절 또는 키워드로 검색하세요
        </DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 창세기 1, 요 3:16, 에스라 9:13, 회개..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {reference && (
            <button
              onClick={() => !referenceOutOfRange && go(reference.book.id, reference.chapter, reference.verse)}
              disabled={referenceOutOfRange}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-paper-raised disabled:opacity-50"
            >
              <span className="text-ink">
                {reference.book.nameKo} {reference.chapter}
                {reference.verse ? `:${reference.verse}` : "장"}으로 이동
              </span>
              {referenceOutOfRange && (
                <span className="text-[11px] text-ink-muted">
                  (총 {reference.book.chapterCount}장까지 있어요)
                </span>
              )}
            </button>
          )}

          {textResults.length > 0 && (
            <div className="mt-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                본문 검색
              </p>
              {textResults.map((v, i) => (
                <button
                  key={i}
                  onClick={() => go(v.bookId, v.chapter, v.verse)}
                  className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-paper-raised"
                >
                  <span className="text-xs font-medium text-ink-muted">
                    {BOOKS_BY_ID[v.bookId]?.nameKo} {v.chapter}:{v.verse} · {v.translationCode}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-sm text-ink">{v.text}</span>
                </button>
              ))}
            </div>
          )}

          {debouncedQuery.trim().length >= 2 && textSearch.isFetching && (
            <p className="px-3 py-2 text-xs text-ink-muted">검색 중...</p>
          )}

          {debouncedQuery.trim().length >= 4 &&
            !textSearch.isFetching &&
            textResults.length === 0 &&
            !reference && (
              <div className="mt-1">
                <p className="flex items-center gap-1 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  <Sparkles className="h-3 w-3 text-accent" />
                  의미 기반 검색 (데모)
                </p>
                {semanticQuery.isFetching && (
                  <p className="px-3 py-2 text-xs text-ink-muted">검색 중...</p>
                )}
                {semanticQuery.data?.length === 0 && !semanticQuery.isFetching && (
                  <p className="px-3 py-2 text-xs text-ink-muted">
                    이 개념에 대한 데모 결과가 아직 없어요. (예: &ldquo;회개&rdquo;, &ldquo;목자&rdquo;,
                    &ldquo;창조&rdquo;, &ldquo;사랑&rdquo;으로 시도해보세요)
                  </p>
                )}
                {semanticQuery.data?.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => go(v.bookId, v.chapter, v.verse)}
                    className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-paper-raised"
                  >
                    <span className="text-xs font-medium text-ink-muted">
                      {BOOKS_BY_ID[v.bookId]?.nameKo} {v.chapter}:{v.verse} · {v.translationCode}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-ink">{v.text}</span>
                  </button>
                ))}
              </div>
            )}

          {query.trim().length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-ink-muted">
              책 이름, &ldquo;책 장:절&rdquo; 형식, 또는 키워드를 입력해보세요.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
