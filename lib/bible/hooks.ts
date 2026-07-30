"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchChapterVerses,
  fetchAnyVerseText,
  fetchCrossReferences,
  fetchWordLinks,
  fetchLexiconEntry,
} from "@/lib/bible/loader";
import type { TranslationCode } from "@/types/bible";

export function useChapterVerses(
  bookId: string,
  chapter: number,
  translationCodes: TranslationCode[]
) {
  return useQuery({
    queryKey: ["chapter-verses", bookId, chapter, [...translationCodes].sort().join(",")],
    queryFn: () => fetchChapterVerses(bookId, chapter, translationCodes),
    staleTime: Infinity, // scripture text for a given (book, chapter, translation) never changes
  });
}

export function useAnyVerseText(bookId: string, chapter: number, verse: number) {
  return useQuery({
    queryKey: ["any-verse-text", bookId, chapter, verse],
    queryFn: () => fetchAnyVerseText(bookId, chapter, verse),
    staleTime: Infinity,
  });
}

export function useCrossReferences(bookId: string, chapter: number, verse: number) {
  return useQuery({
    queryKey: ["xrefs", bookId, chapter, verse],
    queryFn: () => fetchCrossReferences(bookId, chapter, verse),
    staleTime: Infinity,
  });
}

export function useWordLinks(
  bookId: string,
  chapter: number,
  verse: number,
  translationCode: TranslationCode
) {
  return useQuery({
    queryKey: ["word-links", bookId, chapter, verse, translationCode],
    queryFn: () => fetchWordLinks(bookId, chapter, verse, translationCode),
    staleTime: Infinity,
  });
}

export function useLexiconEntry(strongNumber: string | null) {
  return useQuery({
    queryKey: ["lexicon-entry", strongNumber],
    queryFn: () => fetchLexiconEntry(strongNumber as string),
    enabled: !!strongNumber,
    staleTime: Infinity,
  });
}
