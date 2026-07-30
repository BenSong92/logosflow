import { z } from "zod";

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
