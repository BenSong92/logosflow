"use client";

import { BookOpen, ChevronLeft, ChevronRight, Maximize2, PanelLeft, PanelRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { DisplaySettingsPopover } from "@/components/reader/display-settings-popover";
import { TranslationToggle } from "@/components/reader/translation-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { BOOKS_BY_ID } from "@/lib/data/books";
import { useReaderStore } from "@/lib/store/reader-store";

export function Header() {
  const currentBookId = useReaderStore((s) => s.currentBookId);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const nextChapter = useReaderStore((s) => s.nextChapter);
  const prevChapter = useReaderStore((s) => s.prevChapter);
  const toggleLeftPanel = useReaderStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useReaderStore((s) => s.toggleRightPanel);
  const setFocusMode = useReaderStore((s) => s.setFocusMode);
  const setCommandPaletteOpen = useReaderStore((s) => s.setCommandPaletteOpen);

  const book = BOOKS_BY_ID[currentBookId];

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border bg-paper px-2 sm:gap-2 sm:px-3">
      <div className="flex shrink-0 items-center gap-1.5 pr-1 sm:pr-2">
        <BookOpen className="h-4.5 w-4.5 text-accent" />
        <span className="hidden font-scripture text-sm font-semibold text-ink sm:inline">
          LogosFlow
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleLeftPanel} aria-label="왼쪽 패널 토글">
            <PanelLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>성경 목차 (책·장)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <Button variant="ghost" size="icon-sm" onClick={prevChapter} aria-label="이전 장">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[4.5rem] truncate text-center text-sm font-medium text-ink sm:min-w-[6.5rem]">
          {book?.nameKo} {currentChapter}장
        </span>
        <Button variant="ghost" size="icon-sm" onClick={nextChapter} aria-label="다음 장">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-paper-raised px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink sm:px-3"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">구절, 책, 개념으로 검색...</span>
          <kbd className="hidden rounded border border-border bg-paper px-1 text-[10px] sm:inline-block">
            Ctrl K
          </kbd>
        </button>

        <div className="shrink-0">
          <TranslationToggle />
        </div>

        <div className="hidden shrink-0 md:block">
          <DisplaySettingsPopover />
        </div>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <div className="shrink-0">
          <UserMenu />
        </div>

        <div className="hidden shrink-0 md:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setFocusMode(true)} aria-label="집중 모드">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>집중 모드 (사이드바 숨기기)</TooltipContent>
          </Tooltip>
        </div>

        <div className="shrink-0">
          <ThemeSwitch />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRightPanel}
              aria-label="오른쪽 패널 토글"
              className="shrink-0"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>연구 패널 (원어·관주·인물·노트·AI)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
