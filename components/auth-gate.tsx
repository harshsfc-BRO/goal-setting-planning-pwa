"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type AuthGateProps = {
  children: ReactNode;
};

const publicPaths = new Set(["/login"]);

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = useMemo(() => publicPaths.has(pathname), [pathname]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user && !isPublicPath) {
      router.replace("/login");
      return;
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [loading, user, isPublicPath, pathname, router]);

  if (loading) {
    return <div className="p-6 text-sm text-[#6b655d]">Checking your session...</div>;
  }

  if (!user && !isPublicPath) {
    return null;
  }

  if (user && pathname !== "/login") {
    return (
      <div className="space-y-4">
        <header className="flex items-center justify-between rounded-lg border border-[#dfd3bf] bg-[#fff4df] px-3 py-2 text-sm">
          <span className="text-[#6b655d]">{user.email}</span>
          <button
            className="rounded-md border border-[#cdbda5] px-3 py-1 hover:bg-[#f2e5cf]"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            type="button"
          >
            Logout
          </button>
        </header>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
