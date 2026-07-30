/**
 * Book-level chronological reading order — a widely-used approximation
 * (similar to popular "chronological Bible" reading plans), not a
 * scholarly-precise timeline. Granularity is whole books, not
 * chapters/pericopes: books that span an era (e.g. 1 Kings covering both
 * the united and divided kingdom) are placed at their dominant/starting
 * period. Psalms and the Wisdom books are grouped with the united kingdom
 * era rather than scattered by individual authorship date.
 */

export interface ChronologicalEra {
  label: string;
  bookIds: string[];
}

export const CHRONOLOGICAL_ERAS: ChronologicalEra[] = [
  { label: "태초와 족장 시대", bookIds: ["GEN", "JOB"] },
  { label: "출애굽과 광야 시대", bookIds: ["EXO", "LEV", "NUM", "DEU"] },
  { label: "가나안 정착과 사사 시대", bookIds: ["JOS", "JDG", "RUT"] },
  {
    label: "통일 왕국 시대 (사울·다윗·솔로몬)",
    bookIds: ["1SA", "2SA", "PSA", "1KI", "1CH", "2CH", "PRO", "ECC", "SNG"],
  },
  {
    label: "분열 왕국과 선지자 시대",
    bookIds: ["2KI", "OBA", "JOL", "JON", "AMO", "HOS", "ISA", "MIC", "NAM", "ZEP", "HAB"],
  },
  { label: "포로기", bookIds: ["JER", "LAM", "EZK", "DAN"] },
  { label: "포로 귀환기", bookIds: ["EZR", "EST", "HAG", "ZEC", "NEH", "MAL"] },
  { label: "예수님의 생애 (복음서)", bookIds: ["MAT", "MRK", "LUK", "JHN"] },
  {
    label: "초대교회와 서신서",
    bookIds: [
      "ACT",
      "JAS",
      "GAL",
      "1TH",
      "2TH",
      "1CO",
      "2CO",
      "ROM",
      "EPH",
      "PHP",
      "COL",
      "PHM",
      "1TI",
      "TIT",
      "1PE",
      "HEB",
      "2TI",
      "2PE",
      "JUD",
      "1JN",
      "2JN",
      "3JN",
    ],
  },
  { label: "계시록", bookIds: ["REV"] },
];

/** Flat chronological book-id sequence, derived from the eras above. */
export const CHRONOLOGICAL_BOOK_ORDER: string[] = CHRONOLOGICAL_ERAS.flatMap(
  (era) => era.bookIds
);

export const CHRONOLOGICAL_INDEX: Record<string, number> = Object.fromEntries(
  CHRONOLOGICAL_BOOK_ORDER.map((id, i) => [id, i])
);
