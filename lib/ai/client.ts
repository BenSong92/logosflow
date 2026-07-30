export type AIFetchResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "error" };

async function postAI<T>(
  url: string,
  body: { bookId: string; chapter: number; verse: number }
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
    visualMetaphor: string;
    keyTakeaways: string[];
    discussionQuestions: string[];
  }>("/api/ai/sermon", { bookId, chapter, verse });
}
