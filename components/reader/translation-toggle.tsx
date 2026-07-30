"use client";

import { Lock } from "lucide-react";
import { TRANSLATIONS } from "@/lib/data/translations";
import { useReaderStore } from "@/lib/store/reader-store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TranslationToggle() {
  const activeTranslations = useReaderStore((s) => s.activeTranslations);
  const toggleTranslation = useReaderStore((s) => s.toggleTranslation);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-paper-raised p-1">
      {TRANSLATIONS.map((t) => {
        const active = activeTranslations.includes(t.code);
        const pending = t.licenseStatus === "pending-license";
        return (
          <Tooltip key={t.code}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleTranslation(t.code)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-paper text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink",
                  pending && "italic"
                )}
              >
                {pending && <Lock className="h-3 w-3" />}
                {t.code}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              <p className="font-medium">
                {t.nameKo}
                {t.attribution && (
                  <span className="ml-1 font-normal text-ink-muted">{t.attribution}</span>
                )}
              </p>
              <p className="mt-0.5 text-ink-muted">{t.licenseNote}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
