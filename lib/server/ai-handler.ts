import { NextRequest, NextResponse } from "next/server";
import { z, type ZodType } from "zod";
import { AI_MODEL, getGoogleAIClient, isGoogleAIConfigured } from "@/lib/server/google-ai";
import { buildSystemPrompt } from "@/lib/server/ai-prompts";
import { getVerseText } from "@/lib/server/bible-repo";
import { BOOKS_BY_ID } from "@/lib/data/books";

interface VerseRequestBody {
  bookId?: string;
  chapter?: number;
  verse?: number;
}

export async function handleAIVerseRequest<T>(
  request: NextRequest,
  schema: ZodType<T>,
  buildPrompt: (params: {
    bookNameKo: string;
    chapter: number;
    verse: number;
    textKo: string | null;
    textEn: string | null;
  }) => string
): Promise<NextResponse> {
  if (!isGoogleAIConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  let body: VerseRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { bookId, chapter, verse } = body;
  const book = bookId ? BOOKS_BY_ID[bookId] : undefined;
  if (
    !book ||
    !Number.isInteger(chapter) ||
    !Number.isInteger(verse) ||
    chapter! < 1 ||
    verse! < 1
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const textKo = getVerseText("KRV", bookId!, chapter!, verse!);
  const textEn = getVerseText("WEB", bookId!, chapter!, verse!);

  try {
    const client = getGoogleAIClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: buildPrompt({
        bookNameKo: book.nameKo,
        chapter: chapter!,
        verse: verse!,
        textKo,
        textEn,
      }),
      config: {
        systemInstruction: buildSystemPrompt(),
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(schema),
      },
    });

    const raw = response.text;
    if (!raw) {
      const blockReason = response.promptFeedback?.blockReason;
      console.error("AI generation blocked or empty:", blockReason);
      return NextResponse.json({ error: "refused" }, { status: 502 });
    }

    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error("AI response failed schema validation:", parsed.error);
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }

    return NextResponse.json({ data: parsed.data });
  } catch (err) {
    console.error("AI generation failed:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
