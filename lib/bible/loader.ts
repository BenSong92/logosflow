import { TRANSLATIONS_BY_CODE } from "@/lib/data/translations";
import type { LexiconEntry, TranslationCode, WordLinkSpan } from "@/types/bible";

/** chapters[chapterIndex][verseIndex] (0-indexed), fetched from /public/bible-data. */
export type BookChapters = string[][];

const bookCache = new Map<string, Promise<BookChapters>>();

export function fetchBook(translation: TranslationCode, bookId: string): Promise<BookChapters> {
  const key = `${translation}:${bookId}`;
  let promise = bookCache.get(key);
  if (!promise) {
    promise = fetch(`/bible-data/${translation}/${bookId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`No data for ${key}`);
        return res.json() as Promise<BookChapters>;
      })
      .catch((err) => {
        bookCache.delete(key);
        throw err;
      });
    bookCache.set(key, promise);
  }
  return promise;
}

/** Translations without a license yet (NKRV, KLB) have no file on disk — skip the network request entirely. */
function isLoadable(code: TranslationCode) {
  return TRANSLATIONS_BY_CODE[code]?.licenseStatus !== "pending-license";
}

export async function fetchChapterVerses(
  bookId: string,
  chapter: number,
  translationCodes: TranslationCode[]
): Promise<Record<number, Partial<Record<string, string>>>> {
  const result: Record<number, Partial<Record<string, string>>> = {};

  await Promise.all(
    translationCodes.filter(isLoadable).map(async (code) => {
      let chapters: BookChapters;
      try {
        chapters = await fetchBook(code, bookId);
      } catch {
        return;
      }
      const verses = chapters[chapter - 1];
      if (!verses) return;
      verses.forEach((text, i) => {
        if (!text) return; // a handful of disputed verses are intentionally blank (e.g. WEB Acts 8:37)
        const verseNum = i + 1;
        if (!result[verseNum]) result[verseNum] = {};
        result[verseNum][code] = text;
      });
    })
  );

  return result;
}

export async function fetchVerseText(
  bookId: string,
  chapter: number,
  verse: number,
  translationCode: TranslationCode
): Promise<string | null> {
  if (!isLoadable(translationCode)) return null;
  try {
    const chapters = await fetchBook(translationCode, bookId);
    return chapters[chapter - 1]?.[verse - 1] || null;
  } catch {
    return null;
  }
}

const PREVIEW_TRANSLATION_ORDER: TranslationCode[] = ["KRV", "WEB", "KJV"];

/** First available verse text across a small preference order — used for cross-ref previews. */
export async function fetchAnyVerseText(
  bookId: string,
  chapter: number,
  verse: number
): Promise<string | null> {
  for (const code of PREVIEW_TRANSLATION_ORDER) {
    const text = await fetchVerseText(bookId, chapter, verse, code);
    if (text) return text;
  }
  return null;
}

/** A single cross-reference target: book/chapter/verse + TSK vote weight. */
export interface XrefEntry {
  b: string;
  c: number;
  v: number;
  w: number;
}

/** verseKeyLite ("chapter.verse") -> targets, one file per book. */
type XrefBook = Record<string, XrefEntry[]>;

const xrefCache = new Map<string, Promise<XrefBook>>();

export function fetchXrefBook(bookId: string): Promise<XrefBook> {
  let promise = xrefCache.get(bookId);
  if (!promise) {
    promise = fetch(`/bible-data/xref/${bookId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`No xref data for ${bookId}`);
        return res.json() as Promise<XrefBook>;
      })
      .catch((err) => {
        xrefCache.delete(bookId);
        throw err;
      });
    xrefCache.set(bookId, promise);
  }
  return promise;
}

export async function fetchCrossReferences(
  bookId: string,
  chapter: number,
  verse: number
): Promise<XrefEntry[]> {
  try {
    const data = await fetchXrefBook(bookId);
    return data[`${chapter}.${verse}`] ?? [];
  } catch {
    return [];
  }
}

/**
 * Strong's Hebrew/Greek lexicon (12,040 entries, ~5.6MB), merged with a
 * Korean translation overlay (see scripts/translate-lexicon.mjs) that only
 * covers a subset of entries so far. Fetched once and cached — individual
 * lookups after that are a plain object read.
 */
let lexiconPromise: Promise<Record<string, LexiconEntry>> | null = null;

export function fetchLexicon(): Promise<Record<string, LexiconEntry>> {
  if (!lexiconPromise) {
    lexiconPromise = Promise.all([
      fetch("/bible-data/strongs/lexicon.json").then((res) => {
        if (!res.ok) throw new Error("Failed to load lexicon");
        return res.json() as Promise<Record<string, LexiconEntry>>;
      }),
      fetch("/bible-data/strongs/lexicon.ko.json")
        .then((res) => (res.ok ? (res.json() as Promise<Record<string, string>>) : {}))
        .catch(() => ({}) as Record<string, string>),
    ])
      .then(([lexicon, ko]) => {
        for (const [strongNumber, definitionKo] of Object.entries(ko)) {
          const entry = lexicon[strongNumber];
          if (entry) entry.definitionKo = definitionKo;
        }
        return lexicon;
      })
      .catch((err) => {
        lexiconPromise = null;
        throw err;
      });
  }
  return lexiconPromise;
}

export async function fetchLexiconEntry(strongNumber: string): Promise<LexiconEntry | null> {
  const lexicon = await fetchLexicon();
  return lexicon[strongNumber] ?? null;
}

/** chapters[chapterIndex][verseIndex] = word/phrase spans tagged with Strong's numbers. */
type WordLinksBook = WordLinkSpan[][][];

const wordLinksCache = new Map<string, Promise<WordLinksBook>>();

function fetchWordLinksBook(bookId: string, filePrefix: string): Promise<WordLinksBook> {
  const key = `${filePrefix}:${bookId}`;
  let promise = wordLinksCache.get(key);
  if (!promise) {
    promise = fetch(`/bible-data/strongs/${filePrefix}-${bookId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`No word links for ${key}`);
        return res.json() as Promise<WordLinksBook>;
      })
      .catch((err) => {
        wordLinksCache.delete(key);
        throw err;
      });
    wordLinksCache.set(key, promise);
  }
  return promise;
}

/**
 * Which translations have word-level Strong's tagging, and the file prefix
 * their per-book files use. KJV is tagged directly; KRV is tagged via
 * scripts/translate-krv-links.mjs, which maps each KJV tag onto the matching
 * substring of the Korean text (rolls out book-by-book as that job progresses
 * — a 404 for an untranslated book falls through to the catch below).
 */
const WORD_LINK_FILE_PREFIX: Partial<Record<TranslationCode, string>> = {
  KJV: "kjv-links",
  KRV: "krv-links",
};

export async function fetchWordLinks(
  bookId: string,
  chapter: number,
  verse: number,
  translationCode: TranslationCode
): Promise<WordLinkSpan[]> {
  const filePrefix = WORD_LINK_FILE_PREFIX[translationCode];
  if (!filePrefix) return [];
  try {
    const chapters = await fetchWordLinksBook(bookId, filePrefix);
    return chapters[chapter - 1]?.[verse - 1] ?? [];
  } catch {
    return [];
  }
}
