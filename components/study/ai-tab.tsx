"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAIInsight, fetchYouthSermonSketch } from "@/lib/data/ai-mock";
import { fetchRealInsight, fetchRealSermon } from "@/lib/ai/client";
import { verseKey } from "@/lib/data/verses";
import type { AIInsight, YouthSermonSketch } from "@/types/bible";

async function getInsight(bookId: string, chapter: number, verse: number): Promise<AIInsight | null> {
  const real = await fetchRealInsight(bookId, chapter, verse);
  if (real.status === "ok") return { ...real.data, isDemo: false };
  if (real.status === "error") throw new Error("AI 배경 설명 생성에 실패했어요");
  const demo = await fetchAIInsight(verseKey(bookId, chapter, verse));
  return demo ? { ...demo, isDemo: true } : null;
}

async function getSermon(
  bookId: string,
  chapter: number,
  verse: number
): Promise<YouthSermonSketch | null> {
  const real = await fetchRealSermon(bookId, chapter, verse);
  if (real.status === "ok") {
    const keyTakeaways = real.data.keyTakeaways.slice(0, 3);
    while (keyTakeaways.length < 3) keyTakeaways.push("");
    return { ...real.data, keyTakeaways, isDemo: false };
  }
  if (real.status === "error") throw new Error("설교 스케치 생성에 실패했어요");
  const demo = await fetchYouthSermonSketch(verseKey(bookId, chapter, verse));
  return demo ? { ...demo, isDemo: true } : null;
}

export function AITab({
  bookId,
  chapter,
  verse,
}: {
  bookId: string;
  chapter: number;
  verse: number;
}) {
  const insight = useMutation({ mutationFn: () => getInsight(bookId, chapter, verse) });
  const sermon = useMutation({ mutationFn: () => getSermon(bookId, chapter, verse) });

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            맥락 및 배경 해설
          </p>
          {insight.data?.isDemo !== false && <Badge variant="demo">데모 응답</Badge>}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => insight.mutate()}
          disabled={insight.isPending}
        >
          {insight.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {insight.data !== undefined ? "다시 생성" : "AI 배경 설명 생성"}
        </Button>

        {insight.isError && (
          <p className="mt-2 text-xs leading-relaxed text-red-500">
            {(insight.error as Error).message}
          </p>
        )}

        {insight.data === null && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            이 구절에 대한 데모 응답이 아직 준비되지 않았어요. Gemini API 키를
            설정하면 모든 구절에 대해 실시간으로 생성됩니다.
          </p>
        )}

        {insight.data && (
          <div className="mt-3 space-y-3 text-sm text-ink">
            <p className="leading-relaxed">{insight.data.contextSummary}</p>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">역사적 배경</p>
              <p className="leading-relaxed">{insight.data.historicalBackground}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">핵심 포인트</p>
              <ul className="list-disc space-y-1 pl-4">
                {insight.data.keyPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">묵상 질문</p>
              <ul className="list-disc space-y-1 pl-4">
                {insight.data.discussionQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <Separator />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <Users2 className="h-3.5 w-3.5 text-accent" />
            청소년 설교·소그룹 스케치
          </p>
          {sermon.data?.isDemo !== false && <Badge variant="demo">데모 응답</Badge>}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => sermon.mutate()}
          disabled={sermon.isPending}
        >
          {sermon.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {sermon.data !== undefined ? "다시 생성" : "스케치 생성"}
        </Button>

        {sermon.isError && (
          <p className="mt-2 text-xs leading-relaxed text-red-500">
            {(sermon.error as Error).message}
          </p>
        )}

        {sermon.data === null && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            이 구절에 대한 데모 응답이 아직 준비되지 않았어요. Gemini API 키를
            설정하면 모든 구절에 대해 실시간으로 생성됩니다.
          </p>
        )}

        {sermon.data && (
          <div className="mt-3 space-y-3 text-sm text-ink">
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">1. 도입 아이스브레이커</p>
              <p className="leading-relaxed">{sermon.data.icebreaker}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">2. 비주얼 메타포</p>
              <p className="leading-relaxed">{sermon.data.visualMetaphor}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">3. 핵심 메시지 3가지</p>
              <ul className="list-disc space-y-1 pl-4">
                {sermon.data.keyTakeaways.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">4. 삶 적용 질문</p>
              <ul className="list-disc space-y-1 pl-4">
                {sermon.data.applicationQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-muted">5. 마무리 기도 제목</p>
              <p className="leading-relaxed">{sermon.data.prayerPoint}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
