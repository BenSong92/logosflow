import { BIBLICAL_FIGURES, type BiblicalFigure } from "@/lib/data/figures";
import type { Testament } from "@/types/bible";

export interface FigureMatch {
  figure: BiblicalFigure;
  /** The exact substring that matched (nameKo or one of the aliases) — used for highlighting in the verse text. */
  matchedName: string;
}

/**
 * Simple substring match against a curated name list — no NLP. Filtering by
 * the current book's testament resolves same-spelling collisions across
 * Old/New Testament (e.g. 요셉 the patriarch vs. Mary's husband; 사울 King
 * Saul vs. Paul's birth name) but can't disambiguate same-testament
 * namesakes (e.g. the several New Testament 야고보) — those are called out
 * in the figure's description instead.
 */
export function findFiguresInText(
  text: string | null | undefined,
  testament?: Testament
): FigureMatch[] {
  if (!text) return [];
  const matches: FigureMatch[] = [];
  for (const figure of BIBLICAL_FIGURES) {
    if (testament && figure.testament !== "both" && figure.testament !== testament) continue;
    const names = [figure.nameKo, ...(figure.aliases ?? [])];
    const matchedName = names.find((name) => text.includes(name));
    if (matchedName) {
      matches.push({ figure, matchedName });
    }
  }
  return matches;
}
