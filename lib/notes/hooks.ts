"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";

export interface DbNote {
  id: string;
  verseKey: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NoteRow {
  id: string;
  verse_key: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function fromRow(row: NoteRow): DbNote {
  return {
    id: row.id,
    verseKey: row.verse_key,
    content: row.content,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useNotes(verseKey: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id, verseKey],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("verse_key", verseKey)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as NoteRow[]).map(fromRow);
    },
    enabled: !!user,
  });
}

export function useAddNote(verseKey: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, tags }: { content: string; tags: string[] }) => {
      if (!user) throw new Error("로그인이 필요해요");
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, verse_key: verseKey, content, tags });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id, verseKey] });
    },
  });
}

export function useDeleteNote(verseKey: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id, verseKey] });
    },
  });
}
