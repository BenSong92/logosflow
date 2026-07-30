"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useReaderStore, type ThemeMode } from "@/lib/store/reader-store";

const ORDER: ThemeMode[] = ["light", "dark", "system"];
const ICON = { light: Sun, dark: Moon, system: Monitor };
const LABEL = { light: "페이퍼 라이트", dark: "뮤트 다크", system: "시스템 설정 따름" };

export function ThemeSwitch() {
  const theme = useReaderStore((s) => s.theme);
  const setTheme = useReaderStore((s) => s.setTheme);
  const Icon = ICON[theme];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="테마 전환"
          onClick={() => {
            const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
            setTheme(next);
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{LABEL[theme]}</TooltipContent>
    </Tooltip>
  );
}
