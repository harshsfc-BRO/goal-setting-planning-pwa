"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";
import { YearlyGoal } from "@/lib/supabase/types";

type GoalForm = {
  title: string;
  category: string;
  year: number;
  smart_statement: string;
};

const initialForm: GoalForm = {
  title: "",
  category: "",
  year: new Date().getFullYear(),
  smart_statement: ""
};

export default function GoalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [form, setForm] = useState<GoalForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async (targetUser: User) => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("yearly_goals")
      .select("*")
      .eq("user_id", targetUser.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setGoals((data as YearlyGoal[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError || !data.session?.user) {
        setError("Session not found. Please login again.");
        setLoading(false);
        return;
      }
      setUser(data.session.user);
      try {
        await ensureProfile(data.session.user);
      } catch (profileError) {
        setError((profileError as Error).message);
        setLoading(false);
        return;
      }
      await loadGoals(data.session.user);
    });
  }, [loadGoals]);

  async function onCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Missing user session.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      category: form.category.trim() || null,
      year: form.year,
      smart_statement: form.smart_statement.trim(),
      status: "active",
      progress_percent: 0
    };
    const { error: insertError } = await supabase.from("yearly_goals").insert(payload);
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setForm(initialForm);
    await loadGoals(user);
    setSaving(false);
  }

  async function updateProgress(goalId: string, progress: number) {
    setError(null);
    const { error: updateError } = await supabase
      .from("yearly_goals")
      .update({ progress_percent: progress })
      .eq("id", goalId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, progress_percent: progress } : goal)));
  }

  async function deleteGoal(goalId: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("yearly_goals").delete().eq("id", goalId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Goals Master List</h1>
      <p className="text-sm text-[#6b655d]">
        Click any goal to open its detailed Goal Tracker Sheet.
      </p>

      <form className="space-y-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4" onSubmit={onCreateGoal}>
        <h2 className="text-lg font-medium">Create Yearly Goal</h2>
        <label className="block text-sm">
          Goal Title
          <input
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm">
          SMART Goal Statement (one line)
          <input
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.smart_statement}
            onChange={(event) => setForm((prev) => ({ ...prev, smart_statement: event.target.value }))}
            required
          />
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            Category
            <input
              className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Year
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
              value={form.year}
              onChange={(event) => setForm((prev) => ({ ...prev, year: Number(event.target.value) }))}
              required
            />
          </label>
        </div>
        <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand" disabled={saving}>
          {saving ? "Saving..." : "Create Goal"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {loading ? <p className="text-sm text-[#6b655d]">Loading goals...</p> : null}

      <div className="grid gap-3">
        {goals.map((goal) => (
          <article key={goal.id} className="rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4">
            <Link className="text-lg font-medium underline" href={`/goals/${goal.id}`}>
              {goal.title}
            </Link>
            <p className="text-sm text-[#6b655d]">SMART: {goal.smart_statement}</p>
            <p className="text-sm text-[#6b655d]">Year: {goal.year}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-[#6b655d]">Progress:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress_percent}
                onChange={(event) => updateProgress(goal.id, Number(event.target.value))}
              />
              <span className="text-sm">{goal.progress_percent}%</span>
            </div>
            <button
              type="button"
              className="mt-3 rounded-md border border-[#cfbba0] px-3 py-1 text-sm hover:bg-[#f2e5cf]"
              onClick={() => deleteGoal(goal.id)}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
