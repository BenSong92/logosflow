import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AI_MODEL, getGoogleAIClient, isGoogleAIConfigured } from "@/lib/server/google-ai";
import {
  conceptSearchSchema,
  buildConceptSearchSystemPrompt,
  buildConceptSearchPrompt,
} from "@/lib/server/ai-prompts";
import { getVerseText } from "@/lib/server/bible-repo";
import { BOOKS_BY_ID } from "@/lib/data/books";

export async function POST(request: NextRequest) {
  if (!isGoogleAIConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const client = getGoogleAIClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: buildConceptSearchPrompt(query),
      config: {
        systemInstruction: buildConceptSearchSystemPrompt(),
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(conceptSearchSchema),
      },
    });

    const raw = response.text;
    if (!raw) {
      const blockReason = response.promptFeedback?.blockReason;
      console.error("AI concept search blocked or empty:", blockReason);
      return NextResponse.json({ error: "refused" }, { status: 502 });
    }

    const parsed = conceptSearchSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error("AI concept search failed schema validation:", parsed.error);
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }

    // The model can still hallucinate a bookId, an out-of-range chapter, or a
    // verse that doesn't exist — verify every result against real data before
    // it ever reaches the user, same principle as the KRV word-link validation.
    const results = parsed.data.results.flatMap((r) => {
      const book = BOOKS_BY_ID[r.bookId];
      if (!book || r.chapter < 1 || r.chapter > book.chapterCount) return [];
      const text = getVerseText("KRV", r.bookId, r.chapter, r.verse);
      if (!text) return [];
      return [{ bookId: r.bookId, chapter: r.chapter, verse: r.verse, reason: r.reason, text }];
    });

    return NextResponse.json({ data: { results } });
  } catch (err) {
    console.error("AI concept search failed:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
