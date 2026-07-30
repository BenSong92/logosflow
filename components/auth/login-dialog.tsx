"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

function AuthForm({ mode, onDone }: { mode: "signin" | "signup"; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setConfirmNotice(false);

    const supabase = getSupabaseClient();
    const { data, error: authError } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setPending(false);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않아요."
          : authError.message
      );
      return;
    }

    if (mode === "signup" && !data.session) {
      setConfirmNotice(true);
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">이메일</label>
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted">비밀번호</label>
        <Input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상"
        />
      </div>

      {error && <p className="text-xs leading-relaxed text-red-500">{error}</p>}
      {confirmNotice && (
        <p className="text-xs leading-relaxed text-accent">
          가입 확인 메일을 보냈어요. 메일함에서 링크를 눌러 인증을 마치면 로그인할 수 있어요.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {mode === "signin" ? "로그인" : "회원가입"}
      </Button>
    </form>
  );
}

export function LoginDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const configured = isSupabaseConfigured();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm p-5">
        <DialogTitle>노트를 쓰려면 로그인이 필요해요</DialogTitle>
        <DialogDescription className="mt-1">
          노트는 계정별로 저장되어, 로그인하면 다른 기기에서도 이어서 볼 수 있어요.
        </DialogDescription>

        {!configured ? (
          <p className="mt-4 rounded-md bg-paper-raised p-3 text-xs leading-relaxed text-ink-muted">
            아직 로그인 기능이 설정되지 않았어요. .env.local에 NEXT_PUBLIC_SUPABASE_URL과
            NEXT_PUBLIC_SUPABASE_ANON_KEY를 채워주세요.
          </p>
        ) : (
          <Tabs defaultValue="signin" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <AuthForm mode="signin" onDone={() => setOpen(false)} />
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm mode="signup" onDone={() => setOpen(false)} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
