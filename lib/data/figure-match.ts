import { BIBLICAL_FIGURES, type BiblicalFigure } from "@/lib/data/figures";

/** Simple substring match against a curated name list — no NLP, so it can miss/over-match on ambiguous names. */
export function findFiguresInText(text: string | null | undefined): BiblicalFigure[] {
  if (!text) return [];
  const matches: BiblicalFigure[] = [];
  for (const figure of BIBLICAL_FIGURES) {
    const names = [figure.nameKo, ...(figure.aliases ?? [])];
    if (names.some((name) => text.includes(name))) {
      matches.push(figure);
    }
  }
  return matches;
}
