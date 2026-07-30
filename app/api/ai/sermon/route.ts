import { NextRequest } from "next/server";
import { handleAIVerseRequest } from "@/lib/server/ai-handler";
import { sermonSchema, buildSermonPrompt } from "@/lib/server/ai-prompts";

export async function POST(request: NextRequest) {
  return handleAIVerseRequest(request, sermonSchema, buildSermonPrompt);
}
