import type { AIInsight, YouthSermonSketch, SearchResult } from "@/types/bible";
import { verseKey } from "@/lib/data/verses";
import { fetchBook } from "@/lib/bible/loader";

/**
 * Canned "AI" responses — the fallback used when GEMINI_API_KEY isn't
 * configured (see app/api/ai/insight and app/api/ai/sermon for the real
 * Gemini-backed routes, used automatically once a key is set). Semantic
 * search here is always this keyword-mapped stand-in; real implementation
 * would be pgvector similarity search over bible_verses embeddings.
 */

const AI_INSIGHTS: Record<string, AIInsight> = {
  [verseKey("GEN", 1, 1)]: {
    contextSummary:
      "창세기 1장은 이스라엘이 주변 고대 근동의 창조 신화(다신론적 전쟁 신화)와 뚜렷이 대비되는 창조 기사를 제시합니다. 해, 달, 별조차 신이 아니라 하나님이 만드신 피조물로 그려지는 점이 핵심입니다.",
    historicalBackground:
      "고대 근동에서는 태양, 달, 바다 등을 신격화하는 것이 일반적이었습니다. 창세기 1장의 '말씀으로 창조하시는' 하나님 묘사는 이러한 다신론적 세계관에 대한 신학적 대응으로 읽힙니다.",
    keyPoints: [
      "창조는 갈등이 아니라 하나님의 말씀 한마디로 이루어짐",
      "빛과 어둠, 낮과 밤의 구분은 이후 창조 전체의 질서 있는 패턴을 예고함",
      "'보시기에 좋았더라'는 반복 표현이 창조 세계의 선함을 강조함",
    ],
    discussionQuestions: [
      "하나님이 '말씀으로' 창조하셨다는 것은 오늘 우리에게 어떤 의미가 있을까요?",
      "혼돈(formless and empty)에서 질서로 나아가는 창조 패턴을 우리 삶에 적용한다면?",
    ],
    isDemo: true,
  },
  [verseKey("JHN", 3, 16)]: {
    contextSummary:
      "요한복음 3장은 니고데모와의 대화 중 등장하는 구절로, 유대 지도자 니고데모조차 이해하지 못한 '거듭남'의 개념과 하나님의 보편적 사랑이 함께 제시됩니다.",
    historicalBackground:
      "'독생자(monogenes)'라는 표현은 단순한 생물학적 출생이 아니라 '유일무이함'을 강조하는 헬라어 표현으로, 당시 황제 숭배 문화 속에서 예수의 유일한 지위를 부각시키는 용어이기도 했습니다.",
    keyPoints: [
      "사랑의 대상은 '세상' 전체 — 특정 민족이 아님",
      "믿음의 결과는 심판이 아니라 영생",
      "요한복음의 핵심 구절 중 하나로 복음 전체를 요약",
    ],
    discussionQuestions: [
      "'세상을 이처럼 사랑하사'에서 '이처럼'은 구체적으로 무엇을 가리킬까요?",
      "영생은 단순히 '죽은 후'의 삶일까요, 지금 여기의 삶과도 관련이 있을까요?",
    ],
    isDemo: true,
  },
  [verseKey("PSA", 23, 1)]: {
    contextSummary:
      "다윗이 실제 목동이었던 경험을 바탕으로 쓴 시로 추정되며, 고대 이스라엘의 목자-양 관계는 단순한 직업이 아니라 왕과 백성, 하나님과 이스라엘의 관계를 표현하는 대표적 은유였습니다.",
    historicalBackground:
      "고대 근동에서 '목자'는 왕을 가리키는 관용적 칭호이기도 했습니다. 다윗은 이 시에서 자신의 왕권조차 여호와께 속한 목자직에 견주고 있습니다.",
    keyPoints: [
      "부족함이 없다는 고백은 상황이 아니라 관계에 근거함",
      "쉴 곳으로 인도하심과 함께하심이 동시에 나타남",
      "요한복음 10장의 '선한 목자' 주제와 직접 연결됨",
    ],
    discussionQuestions: [
      "현재 나의 삶에서 '푸른 풀밭'과 '사망의 그늘' 중 어디에 더 가깝다고 느끼나요?",
      "목자 되신 하나님을 신뢰한다는 것은 구체적으로 어떤 태도일까요?",
    ],
    isDemo: true,
  },
  [verseKey("EZR", 9, 13)]: {
    contextSummary:
      "바벨론 포로에서 돌아온 공동체가 다시 이방 민족과의 통혼이라는 옛 죄를 반복하려 하자, 에스라가 백성을 대신하여 드리는 공동체적 회개 기도의 일부입니다.",
    historicalBackground:
      "포로 귀환 공동체는 소수의 '남은 자'였기에 신앙적 정체성 유지가 생존의 문제이기도 했습니다. 에스라의 기도는 개인의 죄가 아니라 공동체 전체의 죄를 자신의 것으로 끌어안는 중보기도의 전형입니다.",
    keyPoints: [
      "'주께서 우리의 죄악보다 가볍게 벌하셨다'는 은혜에 대한 인식이 회개의 출발점",
      "회개는 과거 사건을 반복하지 않겠다는 결단을 포함함",
      "지도자가 백성의 죄를 자기 죄처럼 고백하는 중보자적 모델",
    ],
    discussionQuestions: [
      "우리가 속한 공동체가 반복하기 쉬운 '옛 죄'는 무엇일까요?",
      "받은 은혜를 기억하는 것이 왜 회개의 시작이 될까요?",
    ],
    isDemo: true,
  },
};

const YOUTH_SERMONS: Record<string, YouthSermonSketch> = {
  [verseKey("PSA", 23, 1)]: {
    visualMetaphor:
      "GPS 없이도 길을 아는 '내비게이션 친구'처럼, 목자는 양이 보지 못하는 위험까지 미리 알고 이끄는 존재예요.",
    keyTakeaways: [
      "부족함이 없다는 건 다 가졌다는 뜻이 아니라, 필요한 순간 채워주시는 분이 계시다는 뜻이에요.",
      "어두운 골짜기를 지날 때도 '혼자'가 아니라는 게 핵심이에요.",
      "목자를 따라가는 양처럼, 오늘 내가 따라가는 '목소리'는 무엇인지 점검해봐요.",
    ],
    discussionQuestions: [
      "요즘 내 삶에서 가장 어두운 골짜기처럼 느껴지는 순간은 언제인가요?",
      "나는 평소에 어떤 '목소리'(친구, 유튜브, 부모님, 하나님...)를 가장 많이 따라가나요?",
      "이 시를 오늘 나의 언어로 한 문장으로 바꿔본다면?",
    ],
    isDemo: true,
  },
  [verseKey("JHN", 3, 16)]: {
    visualMetaphor:
      "가장 아끼는 걸 조건 없이 내어주는 것 — 용돈을 모아 산 물건을 친구에게 그냥 주는 것과 비슷하지만, 하나님은 '아들'을 내어주셨어요.",
    keyTakeaways: [
      "하나님의 사랑은 감정이 아니라 '행동'으로 증명됐어요 (아들을 보내심).",
      "사랑의 대상은 '착한 사람들'이 아니라 '세상 전체'예요.",
      "믿음의 결과는 두려운 심판이 아니라 영생이라는 선물이에요.",
    ],
    discussionQuestions: [
      "누군가를 조건 없이 사랑해본 적이 있나요? 그때 기분이 어땠나요?",
      "'세상을 이처럼 사랑하사'를 나를 향한 말로 바꿔 읽어본다면?",
    ],
    isDemo: true,
  },
};

/** Simulates network latency so loading states are demoable. */
function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchAIInsight(vKey: string): Promise<AIInsight | null> {
  return delay(AI_INSIGHTS[vKey] ?? null);
}

export async function fetchYouthSermonSketch(
  vKey: string
): Promise<YouthSermonSketch | null> {
  return delay(YOUTH_SERMONS[vKey] ?? null);
}

/**
 * Extremely small "semantic search" stand-in: keyword-maps a couple of
 * known concept queries to relevant passages so the Phase 3 UI has
 * something real to show. Real implementation = pgvector similarity
 * search over bible_verses embeddings.
 */
const CONCEPT_MAP: { keywords: string[]; bookId: string; chapter: number }[] = [
  { keywords: ["회개", "우상숭배", "돌이키는", "돌이킴"], bookId: "EZR", chapter: 9 },
  { keywords: ["사랑", "십자가", "구원"], bookId: "JHN", chapter: 3 },
  { keywords: ["목자", "인도", "위로"], bookId: "PSA", chapter: 23 },
  { keywords: ["창조", "태초"], bookId: "GEN", chapter: 1 },
];

export async function semanticSearch(query: string): Promise<SearchResult[]> {
  const match = CONCEPT_MAP.find((c) =>
    c.keywords.some((k) => query.includes(k))
  );
  if (!match) return delay([], 500);

  const chapters = await fetchBook("KRV", match.bookId);
  const verses = chapters[match.chapter - 1] ?? [];
  const results: SearchResult[] = verses.map((text, i) => ({
    verseKey: verseKey(match.bookId, match.chapter, i + 1),
    bookId: match.bookId,
    chapter: match.chapter,
    verse: i + 1,
    translationCode: "KRV",
    text,
    matchedTerm: query,
  }));

  return delay(results, 900);
}
