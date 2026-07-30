import { GoogleGenAI } from "@google/genai";

export function isGoogleAIConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

let client: GoogleGenAI | null = null;

/** Throws if GEMINI_API_KEY isn't set — callers should check isGoogleAIConfigured() first. */
export function getGoogleAIClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/** Verified against ai.google.dev/gemini-api/docs/models as the current GA flash-tier default (2026-07-30). */
export const AI_MODEL = "gemini-3.6-flash";
