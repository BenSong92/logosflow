"use client";

import { BookOpen, Lock } from "lucide-react";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { TRANSLATIONS, TRANSLATIONS_BY_CODE } from "@/lib/data/translations";
import { useReaderStore } from "@/lib/store/reader-store";
import { Button } from "@/components/ui/button";

export function EmptyChapterState({ bookId, chapter }: { bookId: string; chapter: number }) {
  const activeTranslations = useReaderStore((s) => s.activeTranslations);
  const toggleTranslation = useReaderStore((s) => s.toggleTranslation);
  const book = BOOKS_BY_ID[bookId];

  const allPending = activeTranslations.every(
    (code) => TRANSLATIONS_BY_CODE[code]?.licenseStatus === "pending-license"
  );
  const loadableTranslations = TRANSLATIONS.filter((t) => t.licenseStatus !== "pending-license");

  if (allPending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <Lock className="h-8 w-8 text-ink-muted" />
        <div>
          <p className="text-sm font-medium text-ink">
            선택한 번역은 아직 라이선스 확보 전이에요
          </p>
          <p className="mt-1 max-w-sm text-xs text-ink-muted">
            {activeTranslations
              .map((c) => TRANSLATIONS_BY_CODE[c]?.nameKo)
              .filter(Boolean)
              .join(", ")}
            은(는) 사용허가를 받는 대로 본문이 채워집니다. 지금 바로 읽을 수 있는 번역을
            추가해보세요.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {loadableTranslations.map((t) => (
            <Button key={t.code} variant="subtle" size="sm" onClick={() => toggleTranslation(t.code)}>
              {t.nameKo} 추가
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <BookOpen className="h-8 w-8 text-ink-muted" />
      <div>
        <p className="text-sm font-medium text-ink">
          {book?.nameKo} {chapter}장을 불러오지 못했어요
        </p>
        <p className="mt-1 max-w-sm text-xs text-ink-muted">
          네트워크 상태를 확인하고 다시 시도해주세요.
        </p>
      </div>
    </div>
  );
}
