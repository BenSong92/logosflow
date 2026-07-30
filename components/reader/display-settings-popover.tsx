"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { READER_LIMITS, useReaderStore } from "@/lib/store/reader-store";

export function DisplaySettingsPopover() {
  const fontSize = useReaderStore((s) => s.fontSize);
  const lineHeight = useReaderStore((s) => s.lineHeight);
  const scriptureFont = useReaderStore((s) => s.scriptureFont);
  const setFontSize = useReaderStore((s) => s.setFontSize);
  const setLineHeight = useReaderStore((s) => s.setLineHeight);
  const setScriptureFont = useReaderStore((s) => s.setScriptureFont);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="읽기 설정">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-ink">글자 크기</span>
              <span className="text-ink-muted">{fontSize}px</span>
            </div>
            <Slider
              min={READER_LIMITS.FONT_SIZE_MIN}
              max={READER_LIMITS.FONT_SIZE_MAX}
              step={1}
              value={[fontSize]}
              onValueChange={([v]) => setFontSize(v)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-ink">줄 간격</span>
              <span className="text-ink-muted">{lineHeight.toFixed(2)}</span>
            </div>
            <Slider
              min={READER_LIMITS.LINE_HEIGHT_MIN}
              max={READER_LIMITS.LINE_HEIGHT_MAX}
              step={0.05}
              value={[lineHeight]}
              onValueChange={([v]) => setLineHeight(v)}
            />
          </div>

          <Separator />

          <div>
            <div className="mb-2 text-xs font-medium text-ink">본문 서체</div>
            <ToggleGroup
              type="single"
              value={scriptureFont}
              onValueChange={(v) => v && setScriptureFont(v as "serif" | "sans")}
              className="w-full"
            >
              <ToggleGroupItem value="serif" className="flex-1 font-scripture">
                명조 (Noto Serif)
              </ToggleGroupItem>
              <ToggleGroupItem value="sans" className="flex-1 font-ui">
                고딕 (Pretendard)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
