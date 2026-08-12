import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AI_MODEL, getGoogleAIClient, isGoogleAIConfigured } from "@/lib/server/google-ai";
import {
  xrefInsightSchema,
  buildXrefInsightSystemPrompt,
  buildXrefInsightPrompt,
} from "@/lib/server/ai-prompts";
import { getVerseText } from "@/lib/server/bible-repo";
import { BOOKS_BY_ID } from "@/lib/data/books";

interface XrefRef {
  bookId?: string;
  chapter?: number;
  verse?: number;
}

interface RequestBody {
  bookId?: string;
  chapter?: number;
  verse?: number;
  xrefs?: XrefRef[];
}

export async function POST(request: NextRequest) {
  if (!isGoogleAIConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { bookId, chapter, verse, xrefs } = body;
  const book = bookId ? BOOKS_BY_ID[bookId] : undefined;
  if (
    !book ||
    !Number.isInteger(chapter) ||
    !Number.isInteger(verse) ||
    !Array.isArray(xrefs) ||
    xrefs.length === 0
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Only well-formed refs to real books get sent to the model — everything
  // else is dropped up front rather than asking Gemini to reason about it.
  const validXrefs = xrefs.flatMap((x, index) => {
    const xBook = x.bookId ? BOOKS_BY_ID[x.bookId] : undefined;
    if (!xBook || !Number.isInteger(x.chapter) || !Number.isInteger(x.verse)) return [];
    const textKo = getVerseText("KRV", x.bookId!, x.chapter!, x.verse!);
    return [
      {
        index,
        label: `${xBook.nameKo} ${x.chapter}:${x.verse}`,
        textKo,
      },
    ];
  });
  if (validXrefs.length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const textKo = getVerseText("KRV", bookId!, chapter!, verse!);

  try {
    const client = getGoogleAIClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: buildXrefInsightPrompt({
        bookNameKo: book.nameKo,
        chapter: chapter!,
        verse: verse!,
        textKo,
        xrefs: validXrefs,
      }),
      config: {
        systemInstruction: buildXrefInsightSystemPrompt(),
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(xrefInsightSchema),
      },
    });

    const raw = response.text;
    if (!raw) {
      const blockReason = response.promptFeedback?.blockReason;
      console.error("AI xref insight blocked or empty:", blockReason);
      return NextResponse.json({ error: "refused" }, { status: 502 });
    }

    const parsed = xrefInsightSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error("AI xref insight failed schema validation:", parsed.error);
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }

    // Keep only reasons whose index matches a ref we actually sent, so a
    // model-invented index can't ever get mismatched to the wrong row.
    const validIndexes = new Set(validXrefs.map((x) => x.index));
    const reasons = parsed.data.reasons.filter((r) => validIndexes.has(r.index));

    return NextResponse.json({ data: { reasons } });
  } catch (err) {
    console.error("AI xref insight failed:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
