"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudyStore } from "@/lib/store/study-store";
import { useAuth } from "@/lib/auth/auth-provider";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAddNote, useDeleteNote, useNotes } from "@/lib/notes/hooks";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/types/bible";

const HIGHLIGHT_LABEL: Record<HighlightColor, string> = {
  yellow: "노랑",
  green: "초록",
  blue: "파랑",
  pink: "분홍",
  purple: "보라",
};

const HIGHLIGHT_SWATCH: Record<HighlightColor, string> = {
  yellow: "bg-highlight-yellow",
  green: "bg-highlight-green",
  blue: "bg-highlight-blue",
  pink: "bg-highlight-pink",
  purple: "bg-highlight-purple",
};

function NotesSection({ verseKey }: { verseKey: string }) {
  const { data: notes, isLoading } = useNotes(verseKey);
  const addNote = useAddNote(verseKey);
  const deleteNote = useDeleteNote(verseKey);

  const [draft, setDraft] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink">노트 ({notes?.length ?? 0})</p>

      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />}

      <div className="space-y-2">
        {notes?.map((note) => (
          <div key={note.id} className="rounded-lg border border-border p-3">
            <p className="whitespace-pre-wrap text-sm text-ink">{note.content}</p>
            {note.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-ink-muted">
                {new Date(note.createdAt).toLocaleString("ko-KR")}
              </span>
              <button
                onClick={() => deleteNote.mutate(note.id)}
                className="text-[11px] text-ink-muted hover:text-red-500"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이 구절에 대한 묵상, 설교 아이디어를 적어보세요..."
          className="min-h-20 w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        <input
          value={tagsDraft}
          onChange={(e) => setTagsDraft(e.target.value)}
          placeholder="태그 (쉼표로 구분, 예: 설교재료, 구속사)"
          className="h-8 w-full rounded-md border border-border bg-paper px-3 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        {addNote.isError && (
          <p className="text-xs text-red-500">노트 저장에 실패했어요. 다시 시도해주세요.</p>
        )}
        <Button
          size="sm"
          disabled={!draft.trim() || addNote.isPending}
          onClick={() => {
            const tags = tagsDraft
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            addNote.mutate(
              { content: draft.trim(), tags },
              {
                onSuccess: () => {
                  setDraft("");
                  setTagsDraft("");
                },
              }
            );
          }}
        >
          {addNote.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          노트 추가
        </Button>
      </div>
    </div>
  );
}

export function NotesTab({ verseKey }: { verseKey: string }) {
  const highlight = useStudyStore((s) => s.highlights.find((h) => h.verseKey === verseKey));
  const setHighlight = useStudyStore((s) => s.setHighlight);
  const clearHighlight = useStudyStore((s) => s.clearHighlight);
  const { user, loading } = useAuth();

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium text-ink">하이라이트</p>
        <div className="flex items-center gap-2">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setHighlight(verseKey, color)}
              aria-label={HIGHLIGHT_LABEL[color]}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform",
                HIGHLIGHT_SWATCH[color],
                highlight?.color === color ? "scale-110 border-ink" : "border-transparent"
              )}
            />
          ))}
          {highlight && (
            <button
              onClick={() => clearHighlight(verseKey)}
              className="ml-1 text-[11px] text-ink-muted hover:text-ink"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
      ) : user ? (
        <NotesSection verseKey={verseKey} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="mb-3 text-xs leading-relaxed text-ink-muted">
            노트는 계정에 저장돼요. 로그인하면 이 구절에 대한 묵상을 남길 수 있어요.
          </p>
          <LoginDialog>
            <Button size="sm" variant="outline">
              <LogIn className="h-3.5 w-3.5" />
              로그인하고 노트 쓰기
            </Button>
          </LoginDialog>
        </div>
      )}
    </div>
  );
}
