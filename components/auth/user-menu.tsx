"use client";

import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth/auth-provider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LoginDialog } from "@/components/auth/login-dialog";

export function UserMenu() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-8 w-16" />;
  }

  if (!user) {
    return (
      <LoginDialog>
        <Button variant="outline" size="sm">
          <UserRound className="h-3.5 w-3.5" />
          로그인
        </Button>
      </LoginDialog>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hidden max-w-32 truncate text-xs text-ink-muted sm:inline">
        {user.email}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="로그아웃"
            onClick={() => getSupabaseClient().auth.signOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>로그아웃</TooltipContent>
      </Tooltip>
    </div>
  );
}
