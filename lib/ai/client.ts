export type AIFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "error" };

async function postAI<T, TBody = { bookId: string; chapter: number; verse: number }>(
  url: string,
  body: TBody
): Promise<AIFetchResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 501) return { status: "not_configured" };
    if (!res.ok) return { status: "error" };
    const json = await res.json();
    return { status: "ok", data: json.data as T };
  } catch {
    return { status: "error" };
  }
}

export function fetchRealInsight(bookId: string, chapter: number, verse: number) {
  return postAI<{
    contextSummary: string;
    historicalBackground: string;
    keyPoints: string[];
    discussionQuestions: string[];
  }>("/api/ai/insight", { bookId, chapter, verse });
}

export function fetchRealSermon(bookId: string, chapter: number, verse: number) {
  return postAI<{
    icebreaker: string;
    visualMetaphor: string;
    keyTakeaways: string[];
    applicationQuestions: string[];
    prayerPoint: string;
  }>("/api/ai/sermon", { bookId, chapter, verse });
}

export interface ConceptSearchHit {
  bookId: string;
  chapter: number;
  verse: number;
  reason: string;
  text: string;
}

export function fetchConceptSearch(query: string) {
  return postAI<{ results: ConceptSearchHit[] }, { query: string }>("/api/ai/concept-search", {
    query,
  });
}

export interface XrefRef {
  bookId: string;
  chapter: number;
  verse: number;
}

export function fetchXrefInsight(source: XrefRef, xrefs: XrefRef[]) {
  return postAI<
    { reasons: { index: number; reason: string }[] },
    { bookId: string; chapter: number; verse: number; xrefs: XrefRef[] }
  >("/api/ai/xref-insight", { ...source, xrefs });
}
