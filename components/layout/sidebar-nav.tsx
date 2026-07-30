"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { BIBLE_BOOKS, BOOK_CATEGORIES, BOOKS_BY_ID } from "@/lib/data/books";
import { CHRONOLOGICAL_ERAS } from "@/lib/data/chronological";
import { useReaderStore } from "@/lib/store/reader-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Testament } from "@/types/bible";

export function SidebarNav() {
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const navigateTo = useReaderStore((s) => s.navigateTo);
  const readingOrder = useReaderStore((s) => s.readingOrder);
  const setReadingOrder = useReaderStore((s) => s.setReadingOrder);

  const [testament, setTestament] = useState<Testament>(
    BOOKS_BY_ID[currentBookId]?.testament ?? "OT"
  );
  const [pickerBookId, setPickerBookId] = useState<string | null>(null);

  const categories = useMemo(
    () => BOOK_CATEGORIES.filter((c) => c.testament === testament),
    [testament]
  );

  const pickerBook = pickerBookId ? BOOKS_BY_ID[pickerBookId] : null;
  const chronological = readingOrder === "chronological";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-border p-2">
        {(
          [
            ["canonical", "정경순"],
            ["chronological", "연대기순"],
          ] as const
        ).map(([order, label]) => (
          <button
            key={order}
            onClick={() => setReadingOrder(order)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              readingOrder === order
                ? "bg-accent-soft text-accent"
                : "text-ink-muted hover:bg-paper-raised"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {!chronological && (
        <div className="flex items-center gap-1 border-b border-border p-2">
          {(["OT", "NT"] as Testament[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTestament(t);
                setPickerBookId(null);
              }}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                testament === t
                  ? "bg-accent-soft text-accent"
                  : "text-ink-muted hover:bg-paper-raised"
              )}
            >
              {t === "OT" ? "구약" : "신약"}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        {pickerBook ? (
          <div className="p-2">
            <button
              onClick={() => setPickerBookId(null)}
              className="mb-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-paper-raised"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {pickerBook.nameKo}
            </button>
            <div className="grid grid-cols-6 gap-1 px-1 pb-2">
              {Array.from({ length: pickerBook.chapterCount }, (_, i) => i + 1).map(
                (ch) => {
                  const active =
                    pickerBook.id === currentBookId && ch === currentChapter;
                  return (
                    <button
                      key={ch}
                      onClick={() => {
                        navigateTo(pickerBook.id, ch);
                        setPickerBookId(null);
                      }}
                      className={cn(
                        "aspect-square rounded-md text-xs font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-paper-raised text-ink hover:bg-border/60"
                      )}
                    >
                      {ch}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : chronological ? (
          <div className="p-2">
            <p className="px-2 pb-2 text-[11px] leading-relaxed text-ink-muted">
              성경을 사건이 일어난 시대 순서로 읽어요. 책 단위로 배치한 근사치예요.
            </p>
            {CHRONOLOGICAL_ERAS.map((era) => (
              <div key={era.label} className="mb-3">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {era.label}
                </div>
                <div className="flex flex-col">
                  {era.bookIds.map((id) => {
                    const book = BOOKS_BY_ID[id];
                    if (!book) return null;
                    return (
                      <button
                        key={book.id}
                        onClick={() => setPickerBookId(book.id)}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                          book.id === currentBookId
                            ? "bg-accent-soft text-accent"
                            : "text-ink hover:bg-paper-raised"
                        )}
                      >
                        <span>{book.nameKo}</span>
                        <span className="text-[11px] text-ink-muted">{book.abbrKo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            {categories.map((cat) => (
              <div key={cat.category} className="mb-3">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {cat.category}
                </div>
                <div className="flex flex-col">
                  {BIBLE_BOOKS.filter((b) => b.category === cat.category).map(
                    (book) => (
                      <button
                        key={book.id}
                        onClick={() => setPickerBookId(book.id)}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                          book.id === currentBookId
                            ? "bg-accent-soft text-accent"
                            : "text-ink hover:bg-paper-raised"
                        )}
                      >
                        <span>{book.nameKo}</span>
                        <span className="text-[11px] text-ink-muted">
                          {book.abbrKo}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
