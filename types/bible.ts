export type Testament = "OT" | "NT";

export type BookCategory =
  | "모세오경"
  | "역사서"
  | "시가서"
  | "대선지서"
  | "소선지서"
  | "복음서"
  | "역사서(신약)"
  | "바울서신"
  | "일반서신"
  | "예언서(신약)";

export interface BibleBook {
  /** Stable OSIS-style id, e.g. "GEN", "JOHN" — never changes */
  id: string;
  order: number;
  testament: Testament;
  nameKo: string;
  nameEn: string;
  abbrKo: string;
  chapterCount: number;
  category: BookCategory;
}

export type TranslationCode = "WEB" | "KJV" | "KRV" | "NKRV" | "KLB" | "BRB";

/**
 * - public-domain: no restrictions (WEB, KJV)
 * - free-attribution: royalty-free per rights holder, but moral rights
 *   (성명표시권/동일성유지권) apply — must attribute, must not alter (개역한글)
 * - pending-license: rights holder requires a paid/negotiated license we
 *   don't have yet — no text shipped, shown as locked in the UI (개역개정, 현대인의 성경)
 */
export type LicenseStatus = "public-domain" | "free-attribution" | "pending-license";

export interface Translation {
  code: TranslationCode;
  nameKo: string;
  nameEn: string;
  language: "ko" | "en";
  licenseStatus: LicenseStatus;
  /** Short credit shown right next to the translation name, e.g. "ⓒ 대한성서공회" */
  attribution?: string;
  /** Longer explanation shown in tooltips */
  licenseNote: string;
}

/** "GEN.1.1" style stable key for a single verse across translations */
export type VerseKey = `${string}.${number}.${number}`;

export interface Verse {
  bookId: string;
  chapter: number;
  verse: number;
  translationCode: TranslationCode;
  text: string;
  strongCodes?: string[];
}

export type OriginalLanguage = "hebrew" | "greek";

/**
 * Full Strong's Hebrew/Greek lexicon entry (1890 Strong's Exhaustive
 * Concordance, public domain). `definition` is the original English text;
 * `definitionKo` is a Gemini-translated Korean gloss, filled in for a
 * growing subset of entries (see scripts/translate-lexicon.mjs) — falls
 * back to English in the UI when missing.
 */
export interface LexiconEntry {
  strongNumber: string;
  language: OriginalLanguage;
  original: string;
  transliteration: string;
  definition: string;
  definitionKo?: string;
  usageCount?: number;
}

export const HIGHLIGHT_COLORS = [
  "yellow",
  "green",
  "blue",
  "pink",
  "purple",
] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

export interface Highlight {
  id: string;
  verseKey: VerseKey;
  color: HighlightColor;
  createdAt: string;
}

export interface AIInsight {
  contextSummary: string;
  historicalBackground: string;
  keyPoints: string[];
  discussionQuestions: string[];
  /** true when this came from the small hand-written demo set, not a live Claude API call */
  isDemo: boolean;
}

export interface YouthSermonSketch {
  visualMetaphor: string;
  keyTakeaways: string[];
  discussionQuestions: string[];
  isDemo: boolean;
}

/** One clickable word/phrase in a verse, with the Strong's number(s) tagged to it. */
export type WordLinkSpan = [term: string, strongNumbers: string[]];

export interface SearchResult {
  verseKey: VerseKey;
  bookId: string;
  chapter: number;
  verse: number;
  translationCode: TranslationCode;
  text: string;
  matchedTerm: string;
}
