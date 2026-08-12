import { z } from "zod";
import { BIBLE_BOOKS } from "@/lib/data/books";

export const insightSchema = z.object({
  contextSummary: z.string().describe("2-3문장, 이 구절의 핵심 맥락 요약 (한국어)"),
  historicalBackground: z.string().describe("2-4문장, 역사적·문화적 배경 설명 (한국어)"),
  keyPoints: z.array(z.string()).describe("핵심 포인트 2-4개 (한국어, 각 항목 1문장)"),
  discussionQuestions: z.array(z.string()).describe("묵상 질문 2-3개 (한국어)"),
});

export const sermonSchema = z.object({
  visualMetaphor: z
    .string()
    .describe("중고등학생이 이해할 만한 일상적 비유 1-2문장 (한국어)"),
  keyTakeaways: z
    .array(z.string())
    .describe("핵심 메시지 정확히 3개 (한국어, 각 항목 1문장)"),
  discussionQuestions: z
    .array(z.string())
    .describe("소그룹 나눔 질문 2-3개, 학생이 자기 삶에 적용할 수 있는 질문 (한국어)"),
});

export const conceptSearchSchema = z.object({
  results: z
    .array(
      z.object({
        bookId: z.string().describe("성경 책 영문 코드, 예: GEN, JHN, PSA, 1CO"),
        chapter: z.number().int(),
        verse: z.number().int(),
        reason: z.string().describe("이 구절이 검색어와 관련된 이유, 1문장, 한국어"),
      })
    )
    .max(8),
});

const BOOK_ID_LIST = BIBLE_BOOKS.map((b) => `${b.id}=${b.nameKo}`).join(", ");

export function buildConceptSearchSystemPrompt() {
  return `당신은 한국 교회 성도를 돕는 성경 구절 추천 시스템입니다. 사용자가 입력한 주제·감정·상황에
실제로 관련 있는 성경 구절을 찾아 추천합니다.

원칙:
- 반드시 실존하는 성경 구절만 추천하세요. 구절을 지어내거나 장·절 번호를 추측하지 마세요.
- bookId는 반드시 다음 66개 코드 중 하나를 정확히 그대로 쓰세요: ${BOOK_ID_LIST}
- 검색어와 억지로 끼워 맞추지 말고, 정말 관련 있는 구절만 (많아야 8개, 적어도 괜찮음) 추천하세요.
- 각 구절마다 왜 이 검색어와 관련 있는지 한국어로 1문장 설명을 붙이세요.
- 모든 응답은 한국어로 작성하세요.`;
}

export function buildConceptSearchPrompt(query: string) {
  return `다음 주제/감정/상황과 관련된 성경 구절을 찾아주세요.

검색어: "${query}"`;
}

export const xrefInsightSchema = z.object({
  reasons: z
    .array(
      z.object({
        index: z.number().int().describe("입력으로 받은 관주 목록의 순번(0부터 시작)"),
        reason: z.string().describe("두 구절이 어떻게 연결되는지, 1문장, 한국어"),
      })
    )
    .describe("입력받은 모든 관주 각각에 대해 하나씩"),
});

export function buildXrefInsightSystemPrompt() {
  return `당신은 한국 교회 성도를 돕는 성경 관주(cross-reference) 해설자입니다. 기준 구절과
그 구절의 관주로 연결된 다른 구절들이 주어지면, 두 구절이 왜/어떻게 연결되는지 짧게
설명합니다.

원칙:
- 이미 주어진 구절들만 다룹니다. 새로운 구절을 추천하거나 지어내지 마세요.
- 연결 방식은 다양할 수 있습니다: 같은 사건/인물, 예언과 성취, 직접 인용, 같은 주제나
  가르침의 반복, 대조되는 표현 등. 실제로 해당하는 방식대로 자연스럽게 설명하세요.
- 억지로 의미를 부여하지 말고, 정말 그 연결이 안 보이면 "본문상의 명확한 연결점은
  뚜렷하지 않으나" 처럼 솔직하게 쓰세요.
- 반드시 입력받은 모든 항목에 대해 순번(index)별로 하나씩 응답하세요.
- 모든 응답은 한국어 1문장으로, 존댓말을 쓰되 자연스럽게 작성하세요.`;
}

export function buildXrefInsightPrompt(params: {
  bookNameKo: string;
  chapter: number;
  verse: number;
  textKo: string | null;
  xrefs: { index: number; label: string; textKo: string | null }[];
}) {
  const { bookNameKo, chapter, verse, textKo, xrefs } = params;
  const lines = xrefs.map(
    (x) => `[${x.index}] ${x.label} — ${x.textKo ?? "(본문 없음)"}`
  );
  return `기준 구절: ${bookNameKo} ${chapter}:${verse}
본문: ${textKo ?? "(본문 없음)"}

이 구절과 연결된 관주들:
${lines.join("\n")}

각 관주가 기준 구절과 왜/어떻게 연결되는지 순번별로 설명해주세요.`;
}

export function buildSystemPrompt() {
  return `당신은 한국 교회의 성경 연구를 돕는 신학 조교입니다. 중고등학생부터 성인까지 폭넓은 사용자를 위해 성경 구절의 배경과 의미를 설명합니다.

원칙:
- 특정 교단의 논쟁적 교리에 치우치지 않고, 널리 받아들여지는 역사적·본문적 사실 위주로 설명하세요.
- 확실하지 않은 역사적 주장은 하지 마세요. 과장하거나 지어내지 마세요.
- 모든 응답은 한국어로 작성하세요.
- 존댓말을 사용하되, 딱딱하지 않고 자연스럽게 쓰세요.`;
}

export function buildInsightPrompt(params: {
  bookNameKo: string;
  chapter: number;
  verse: number;
  textKo: string | null;
  textEn: string | null;
}) {
  const { bookNameKo, chapter, verse, textKo, textEn } = params;
  return `다음 성경 구절의 맥락과 배경을 설명해주세요.

구절: ${bookNameKo} ${chapter}:${verse}
한글 본문(개역한글): ${textKo ?? "(본문 없음)"}
영어 본문(WEB): ${textEn ?? "(본문 없음)"}

이 구절이 속한 문맥, 원저자의 의도, 당시 역사적·문화적 배경을 설명하고, 오늘날 독자에게 도움이 될 핵심 포인트와 묵상 질문을 만들어주세요.`;
}

export function buildSermonPrompt(params: {
  bookNameKo: string;
  chapter: number;
  verse: number;
  textKo: string | null;
  textEn: string | null;
}) {
  const { bookNameKo, chapter, verse, textKo, textEn } = params;
  return `다음 성경 구절로 중고등부 설교/소그룹 나눔 자료를 만들어주세요.

구절: ${bookNameKo} ${chapter}:${verse}
한글 본문(개역한글): ${textKo ?? "(본문 없음)"}
영어 본문(WEB): ${textEn ?? "(본문 없음)"}

청소년이 스마트폰, 친구 관계, 학업 스트레스 같은 자기 삶의 언어로 이해할 수 있는 시각적 비유를 만들고, 핵심 메시지 정확히 3가지, 소그룹에서 나눌 수 있는 질문을 만들어주세요. 설교체가 아니라 또래에게 말하듯 친근하게 써주세요.`;
}
