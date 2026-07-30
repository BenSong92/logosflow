import type { BibleBook } from "@/types/bible";

/**
 * All 66 canonical books. `id` mirrors the common 3-letter OSIS/USFM codes
 * (GEN, EXO, ... REV) so it can line up with external Bible APIs/datasets
 * later. Only a handful of chapters have mock verse text for now (see
 * lib/data/verses.ts) — the rest render an empty state until real data is
 * wired up in Phase 4.
 */
export const BIBLE_BOOKS: BibleBook[] = [
  // 모세오경
  { id: "GEN", order: 1, testament: "OT", nameKo: "창세기", nameEn: "Genesis", abbrKo: "창", chapterCount: 50, category: "모세오경" },
  { id: "EXO", order: 2, testament: "OT", nameKo: "출애굽기", nameEn: "Exodus", abbrKo: "출", chapterCount: 40, category: "모세오경" },
  { id: "LEV", order: 3, testament: "OT", nameKo: "레위기", nameEn: "Leviticus", abbrKo: "레", chapterCount: 27, category: "모세오경" },
  { id: "NUM", order: 4, testament: "OT", nameKo: "민수기", nameEn: "Numbers", abbrKo: "민", chapterCount: 36, category: "모세오경" },
  { id: "DEU", order: 5, testament: "OT", nameKo: "신명기", nameEn: "Deuteronomy", abbrKo: "신", chapterCount: 34, category: "모세오경" },
  // 역사서
  { id: "JOS", order: 6, testament: "OT", nameKo: "여호수아", nameEn: "Joshua", abbrKo: "수", chapterCount: 24, category: "역사서" },
  { id: "JDG", order: 7, testament: "OT", nameKo: "사사기", nameEn: "Judges", abbrKo: "삿", chapterCount: 21, category: "역사서" },
  { id: "RUT", order: 8, testament: "OT", nameKo: "룻기", nameEn: "Ruth", abbrKo: "룻", chapterCount: 4, category: "역사서" },
  { id: "1SA", order: 9, testament: "OT", nameKo: "사무엘상", nameEn: "1 Samuel", abbrKo: "삼상", chapterCount: 31, category: "역사서" },
  { id: "2SA", order: 10, testament: "OT", nameKo: "사무엘하", nameEn: "2 Samuel", abbrKo: "삼하", chapterCount: 24, category: "역사서" },
  { id: "1KI", order: 11, testament: "OT", nameKo: "열왕기상", nameEn: "1 Kings", abbrKo: "왕상", chapterCount: 22, category: "역사서" },
  { id: "2KI", order: 12, testament: "OT", nameKo: "열왕기하", nameEn: "2 Kings", abbrKo: "왕하", chapterCount: 25, category: "역사서" },
  { id: "1CH", order: 13, testament: "OT", nameKo: "역대상", nameEn: "1 Chronicles", abbrKo: "대상", chapterCount: 29, category: "역사서" },
  { id: "2CH", order: 14, testament: "OT", nameKo: "역대하", nameEn: "2 Chronicles", abbrKo: "대하", chapterCount: 36, category: "역사서" },
  { id: "EZR", order: 15, testament: "OT", nameKo: "에스라", nameEn: "Ezra", abbrKo: "스", chapterCount: 10, category: "역사서" },
  { id: "NEH", order: 16, testament: "OT", nameKo: "느헤미야", nameEn: "Nehemiah", abbrKo: "느", chapterCount: 13, category: "역사서" },
  { id: "EST", order: 17, testament: "OT", nameKo: "에스더", nameEn: "Esther", abbrKo: "에", chapterCount: 10, category: "역사서" },
  // 시가서
  { id: "JOB", order: 18, testament: "OT", nameKo: "욥기", nameEn: "Job", abbrKo: "욥", chapterCount: 42, category: "시가서" },
  { id: "PSA", order: 19, testament: "OT", nameKo: "시편", nameEn: "Psalms", abbrKo: "시", chapterCount: 150, category: "시가서" },
  { id: "PRO", order: 20, testament: "OT", nameKo: "잠언", nameEn: "Proverbs", abbrKo: "잠", chapterCount: 31, category: "시가서" },
  { id: "ECC", order: 21, testament: "OT", nameKo: "전도서", nameEn: "Ecclesiastes", abbrKo: "전", chapterCount: 12, category: "시가서" },
  { id: "SNG", order: 22, testament: "OT", nameKo: "아가", nameEn: "Song of Solomon", abbrKo: "아", chapterCount: 8, category: "시가서" },
  // 대선지서
  { id: "ISA", order: 23, testament: "OT", nameKo: "이사야", nameEn: "Isaiah", abbrKo: "사", chapterCount: 66, category: "대선지서" },
  { id: "JER", order: 24, testament: "OT", nameKo: "예레미야", nameEn: "Jeremiah", abbrKo: "렘", chapterCount: 52, category: "대선지서" },
  { id: "LAM", order: 25, testament: "OT", nameKo: "예레미야애가", nameEn: "Lamentations", abbrKo: "애", chapterCount: 5, category: "대선지서" },
  { id: "EZK", order: 26, testament: "OT", nameKo: "에스겔", nameEn: "Ezekiel", abbrKo: "겔", chapterCount: 48, category: "대선지서" },
  { id: "DAN", order: 27, testament: "OT", nameKo: "다니엘", nameEn: "Daniel", abbrKo: "단", chapterCount: 12, category: "대선지서" },
  // 소선지서
  { id: "HOS", order: 28, testament: "OT", nameKo: "호세아", nameEn: "Hosea", abbrKo: "호", chapterCount: 14, category: "소선지서" },
  { id: "JOL", order: 29, testament: "OT", nameKo: "요엘", nameEn: "Joel", abbrKo: "욜", chapterCount: 3, category: "소선지서" },
  { id: "AMO", order: 30, testament: "OT", nameKo: "아모스", nameEn: "Amos", abbrKo: "암", chapterCount: 9, category: "소선지서" },
  { id: "OBA", order: 31, testament: "OT", nameKo: "오바댜", nameEn: "Obadiah", abbrKo: "옵", chapterCount: 1, category: "소선지서" },
  { id: "JON", order: 32, testament: "OT", nameKo: "요나", nameEn: "Jonah", abbrKo: "욘", chapterCount: 4, category: "소선지서" },
  { id: "MIC", order: 33, testament: "OT", nameKo: "미가", nameEn: "Micah", abbrKo: "미", chapterCount: 7, category: "소선지서" },
  { id: "NAM", order: 34, testament: "OT", nameKo: "나훔", nameEn: "Nahum", abbrKo: "나", chapterCount: 3, category: "소선지서" },
  { id: "HAB", order: 35, testament: "OT", nameKo: "하박국", nameEn: "Habakkuk", abbrKo: "합", chapterCount: 3, category: "소선지서" },
  { id: "ZEP", order: 36, testament: "OT", nameKo: "스바냐", nameEn: "Zephaniah", abbrKo: "습", chapterCount: 3, category: "소선지서" },
  { id: "HAG", order: 37, testament: "OT", nameKo: "학개", nameEn: "Haggai", abbrKo: "학", chapterCount: 2, category: "소선지서" },
  { id: "ZEC", order: 38, testament: "OT", nameKo: "스가랴", nameEn: "Zechariah", abbrKo: "슥", chapterCount: 14, category: "소선지서" },
  { id: "MAL", order: 39, testament: "OT", nameKo: "말라기", nameEn: "Malachi", abbrKo: "말", chapterCount: 4, category: "소선지서" },
  // 복음서
  { id: "MAT", order: 40, testament: "NT", nameKo: "마태복음", nameEn: "Matthew", abbrKo: "마", chapterCount: 28, category: "복음서" },
  { id: "MRK", order: 41, testament: "NT", nameKo: "마가복음", nameEn: "Mark", abbrKo: "막", chapterCount: 16, category: "복음서" },
  { id: "LUK", order: 42, testament: "NT", nameKo: "누가복음", nameEn: "Luke", abbrKo: "눅", chapterCount: 24, category: "복음서" },
  { id: "JHN", order: 43, testament: "NT", nameKo: "요한복음", nameEn: "John", abbrKo: "요", chapterCount: 21, category: "복음서" },
  // 역사서(신약)
  { id: "ACT", order: 44, testament: "NT", nameKo: "사도행전", nameEn: "Acts", abbrKo: "행", chapterCount: 28, category: "역사서(신약)" },
  // 바울서신
  { id: "ROM", order: 45, testament: "NT", nameKo: "로마서", nameEn: "Romans", abbrKo: "롬", chapterCount: 16, category: "바울서신" },
  { id: "1CO", order: 46, testament: "NT", nameKo: "고린도전서", nameEn: "1 Corinthians", abbrKo: "고전", chapterCount: 16, category: "바울서신" },
  { id: "2CO", order: 47, testament: "NT", nameKo: "고린도후서", nameEn: "2 Corinthians", abbrKo: "고후", chapterCount: 13, category: "바울서신" },
  { id: "GAL", order: 48, testament: "NT", nameKo: "갈라디아서", nameEn: "Galatians", abbrKo: "갈", chapterCount: 6, category: "바울서신" },
  { id: "EPH", order: 49, testament: "NT", nameKo: "에베소서", nameEn: "Ephesians", abbrKo: "엡", chapterCount: 6, category: "바울서신" },
  { id: "PHP", order: 50, testament: "NT", nameKo: "빌립보서", nameEn: "Philippians", abbrKo: "빌", chapterCount: 4, category: "바울서신" },
  { id: "COL", order: 51, testament: "NT", nameKo: "골로새서", nameEn: "Colossians", abbrKo: "골", chapterCount: 4, category: "바울서신" },
  { id: "1TH", order: 52, testament: "NT", nameKo: "데살로니가전서", nameEn: "1 Thessalonians", abbrKo: "살전", chapterCount: 5, category: "바울서신" },
  { id: "2TH", order: 53, testament: "NT", nameKo: "데살로니가후서", nameEn: "2 Thessalonians", abbrKo: "살후", chapterCount: 3, category: "바울서신" },
  { id: "1TI", order: 54, testament: "NT", nameKo: "디모데전서", nameEn: "1 Timothy", abbrKo: "딤전", chapterCount: 6, category: "바울서신" },
  { id: "2TI", order: 55, testament: "NT", nameKo: "디모데후서", nameEn: "2 Timothy", abbrKo: "딤후", chapterCount: 4, category: "바울서신" },
  { id: "TIT", order: 56, testament: "NT", nameKo: "디도서", nameEn: "Titus", abbrKo: "딛", chapterCount: 3, category: "바울서신" },
  { id: "PHM", order: 57, testament: "NT", nameKo: "빌레몬서", nameEn: "Philemon", abbrKo: "몬", chapterCount: 1, category: "바울서신" },
  // 일반서신
  { id: "HEB", order: 58, testament: "NT", nameKo: "히브리서", nameEn: "Hebrews", abbrKo: "히", chapterCount: 13, category: "일반서신" },
  { id: "JAS", order: 59, testament: "NT", nameKo: "야고보서", nameEn: "James", abbrKo: "약", chapterCount: 5, category: "일반서신" },
  { id: "1PE", order: 60, testament: "NT", nameKo: "베드로전서", nameEn: "1 Peter", abbrKo: "벧전", chapterCount: 5, category: "일반서신" },
  { id: "2PE", order: 61, testament: "NT", nameKo: "베드로후서", nameEn: "2 Peter", abbrKo: "벧후", chapterCount: 3, category: "일반서신" },
  { id: "1JN", order: 62, testament: "NT", nameKo: "요한일서", nameEn: "1 John", abbrKo: "요일", chapterCount: 5, category: "일반서신" },
  { id: "2JN", order: 63, testament: "NT", nameKo: "요한이서", nameEn: "2 John", abbrKo: "요이", chapterCount: 1, category: "일반서신" },
  { id: "3JN", order: 64, testament: "NT", nameKo: "요한삼서", nameEn: "3 John", abbrKo: "요삼", chapterCount: 1, category: "일반서신" },
  { id: "JUD", order: 65, testament: "NT", nameKo: "유다서", nameEn: "Jude", abbrKo: "유", chapterCount: 1, category: "일반서신" },
  // 예언서(신약)
  { id: "REV", order: 66, testament: "NT", nameKo: "요한계시록", nameEn: "Revelation", abbrKo: "계", chapterCount: 22, category: "예언서(신약)" },
];

export const BOOKS_BY_ID: Record<string, BibleBook> = Object.fromEntries(
  BIBLE_BOOKS.map((b) => [b.id, b])
);

export const BOOK_CATEGORIES: { category: BibleBook["category"]; testament: BibleBook["testament"] }[] = [
  { category: "모세오경", testament: "OT" },
  { category: "역사서", testament: "OT" },
  { category: "시가서", testament: "OT" },
  { category: "대선지서", testament: "OT" },
  { category: "소선지서", testament: "OT" },
  { category: "복음서", testament: "NT" },
  { category: "역사서(신약)", testament: "NT" },
  { category: "바울서신", testament: "NT" },
  { category: "일반서신", testament: "NT" },
  { category: "예언서(신약)", testament: "NT" },
];
