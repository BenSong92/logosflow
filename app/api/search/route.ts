import { NextRequest, NextResponse } from "next/server";
import { searchBible } from "@/lib/server/bible-repo";
import { TRANSLATIONS } from "@/lib/data/translations";

const LOADABLE_CODES = TRANSLATIONS.filter((t) => t.licenseStatus !== "pending-license").map(
  (t) => t.code
);

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const translationsParam = request.nextUrl.searchParams.get("translations");
  const translationCodes = translationsParam ? translationsParam.split(",") : LOADABLE_CODES;

  const results = searchBible(q, translationCodes, 30);
  return NextResponse.json({ results });
}
