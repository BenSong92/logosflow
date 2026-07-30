import { NextRequest } from "next/server";
import { handleAIVerseRequest } from "@/lib/server/ai-handler";
import { insightSchema, buildInsightPrompt } from "@/lib/server/ai-prompts";

export async function POST(request: NextRequest) {
  return handleAIVerseRequest(request, insightSchema, buildInsightPrompt);
}
