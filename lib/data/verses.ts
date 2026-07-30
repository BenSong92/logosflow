import type { VerseKey } from "@/types/bible";

export function verseKey(bookId: string, chapter: number, verse: number): VerseKey {
  return `${bookId}.${chapter}.${verse}`;
}

export function parseVerseKey(key: string): { bookId: string; chapter: number; verse: number } {
  const [bookId, chapter, verse] = key.split(".");
  return { bookId, chapter: Number(chapter), verse: Number(verse) };
}
