"use client";

import { BookMarked } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { verseKey } from "@/lib/data/verses";
import { useReaderStore } from "@/lib/store/reader-store";
import { WordStudyTab } from "@/components/study/word-study-tab";
import { CrossRefTab } from "@/components/study/cross-ref-tab";
import { NotesTab } from "@/components/study/notes-tab";
import { AITab } from "@/components/study/ai-tab";

export function ResearchDrawer() {
  const bookId = useReaderStore((s) => s.currentBookId);
  const chapter = useReaderStore((s) => s.currentChapter);
  const selectedVerseNumber = useReaderStore((s) => s.selectedVerseNumber);
  const book = BOOKS_BY_ID[bookId];

  if (selectedVerseNumber == null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <BookMarked className="h-6 w-6 text-ink-muted" />
        <p className="text-xs text-ink-muted">
          구절을 클릭하면
          <br />
          원어·관주·노트·AI 해설을 볼 수 있어요
        </p>
      </div>
    );
  }

  const vKey = verseKey(bookId, chapter, selectedVerseNumber);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium text-ink-muted">연구 패널</p>
        <p className="text-sm font-semibold text-ink">
          {book?.nameKo} {chapter}:{selectedVerseNumber}
        </p>
      </div>
      <Tabs defaultValue="word" className="flex flex-1 flex-col overflow-hidden px-4 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="word" className="flex-1">원어</TabsTrigger>
          <TabsTrigger value="crossref" className="flex-1">관주</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">노트</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">AI</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="word" className="pb-6 pr-2">
            <WordStudyTab bookId={bookId} chapter={chapter} verse={selectedVerseNumber} />
          </TabsContent>
          <TabsContent value="crossref" className="pb-6 pr-2">
            <CrossRefTab bookId={bookId} chapter={chapter} verse={selectedVerseNumber} />
          </TabsContent>
          <TabsContent value="notes" className="pb-6 pr-2">
            <NotesTab verseKey={vKey} />
          </TabsContent>
          <TabsContent value="ai" className="pb-6 pr-2">
            <AITab bookId={bookId} chapter={chapter} verse={selectedVerseNumber} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
