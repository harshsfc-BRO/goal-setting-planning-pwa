"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password first.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      try {
        await ensureProfile(data.user);
      } catch (profileError) {
        setError(
          `${(profileError as Error).message}. If this mentions RLS/policy, run docs/database-schema.sql and docs/supabase-rls-fix.sql in Supabase SQL Editor.`
        );
        setLoading(false);
        return;
      }
    }
    router.replace("/");
    setLoading(false);
  }

  async function onSignUp() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password first.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session?.user) {
      try {
        await ensureProfile(data.session.user);
      } catch (profileError) {
        setError((profileError as Error).message);
        setLoading(false);
        return;
      }
    }
    setMessage(
      "Account created. If email confirmation is ON in Supabase, confirm email first, then sign in."
    );
    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-sm text-[#6b655d]">
        Sign in or create account. Data sync and backup are tied to this login.
      </p>
      <form className="space-y-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4" onSubmit={onSignIn}>
        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        <div className="flex gap-2">
          <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand" disabled={loading}>
            {loading ? "Please wait..." : "Sign In"}
          </button>
          <button
            type="button"
            className="rounded-md border border-[#cdbda5] px-4 py-2 text-sm hover:bg-[#f2e5cf]"
            onClick={onSignUp}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
    </section>
  );
}
