import fs from "node:fs";
import path from "node:path";
import { BIBLE_BOOKS } from "@/lib/data/books";

const DATA_DIR = path.join(process.cwd(), "public", "bible-data");

/** chapters[chapterIndex][verseIndex] (0-indexed) */
type BookChapters = string[][];

/** Persists across requests within the same server process — the whole dataset is ~13MB. */
const bookCache = new Map<string, BookChapters | null>();

function loadBook(translation: string, bookId: string): BookChapters | null {
  const key = `${translation}:${bookId}`;
  if (bookCache.has(key)) return bookCache.get(key)!;
  const file = path.join(DATA_DIR, translation, `${bookId}.json`);
  let result: BookChapters | null = null;
  try {
    result = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    result = null;
  }
  bookCache.set(key, result);
  return result;
}

export function getVerseText(
  translation: string,
  bookId: string,
  chapter: number,
  verse: number
): string | null {
  const chapters = loadBook(translation, bookId);
  return chapters?.[chapter - 1]?.[verse - 1] || null;
}

export interface ServerSearchResult {
  bookId: string;
  chapter: number;
  verse: number;
  translationCode: string;
  text: string;
}

export function searchBible(
  query: string,
  translationCodes: string[],
  limit = 30
): ServerSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: ServerSearchResult[] = [];

  outer: for (const book of BIBLE_BOOKS) {
    for (const code of translationCodes) {
      const chapters = loadBook(code, book.id);
      if (!chapters) continue;
      for (let ci = 0; ci < chapters.length; ci++) {
        const verses = chapters[ci];
        for (let vi = 0; vi < verses.length; vi++) {
          const text = verses[vi];
          if (text && text.toLowerCase().includes(q)) {
            results.push({
              bookId: book.id,
              chapter: ci + 1,
              verse: vi + 1,
              translationCode: code,
              text,
            });
            if (results.length >= limit) break outer;
          }
        }
      }
    }
  }

  return results;
}
