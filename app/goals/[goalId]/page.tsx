"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MonthlyGoal, YearlyGoal } from "@/lib/supabase/types";

type GoalTrackerFields = Pick<
  YearlyGoal,
  "smart_statement" | "benefits_text" | "obstacles_text" | "solutions_text" | "title" | "category" | "year"
>;

export default function GoalTrackerPage() {
  const params = useParams<{ goalId: string }>();
  const [goal, setGoal] = useState<YearlyGoal | null>(null);
  const [form, setForm] = useState<GoalTrackerFields | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [newMonthlyTitle, setNewMonthlyTitle] = useState("");
  const [newMonthlyDate, setNewMonthlyDate] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`
  );

  useEffect(() => {
    const goalId = params.goalId;
    if (!goalId) {
      setError("Goal id missing.");
      setLoading(false);
      return;
    }
    supabase
      .from("yearly_goals")
      .select("*")
      .eq("id", goalId)
      .single()
      .then(async ({ data, error: queryError }) => {
        if (queryError) {
          setError(queryError.message);
          setLoading(false);
          return;
        }
        const typed = data as YearlyGoal;
        setGoal(typed);
        setForm({
          title: typed.title,
          category: typed.category,
          year: typed.year,
          smart_statement: typed.smart_statement,
          benefits_text: typed.benefits_text,
          obstacles_text: typed.obstacles_text,
          solutions_text: typed.solutions_text
        });
        const { data: monthlyData, error: monthlyError } = await supabase
          .from("monthly_goals")
          .select("*")
          .eq("yearly_goal_id", typed.id)
          .order("month_date", { ascending: false });

        if (monthlyError) {
          setError(monthlyError.message);
        } else {
          setMonthlyGoals((monthlyData as MonthlyGoal[]) ?? []);
        }

        setLoading(false);
      });
  }, [params.goalId]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || !goal) {
      return;
    }
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("yearly_goals")
      .update({
        title: form.title,
        category: form.category,
        year: form.year,
        smart_statement: form.smart_statement,
        benefits_text: form.benefits_text,
        obstacles_text: form.obstacles_text,
        solutions_text: form.solutions_text
      })
      .eq("id", goal.id);
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  async function createMonthlyGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal || !newMonthlyTitle.trim()) {
      return;
    }
    setError(null);
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) {
      setError("Missing user session.");
      return;
    }
    const payload = {
      yearly_goal_id: goal.id,
      user_id: userId,
      month_date: newMonthlyDate,
      title: newMonthlyTitle.trim(),
      status: "planned",
      progress_percent: 0
    };
    const { error: insertError } = await supabase.from("monthly_goals").insert(payload);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewMonthlyTitle("");
    const { data, error: queryError } = await supabase
      .from("monthly_goals")
      .select("*")
      .eq("yearly_goal_id", goal.id)
      .order("month_date", { ascending: false });
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setMonthlyGoals((data as MonthlyGoal[]) ?? []);
  }

  if (loading) {
    return <p className="text-sm text-[#6b655d]">Loading goal tracker...</p>;
  }

  if (!goal || !form) {
    return <p className="text-sm text-red-700">{error ?? "Goal not found."}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goal Tracker Sheet</h1>
        <Link className="text-sm underline" href="/goals">
          Back to Goals
        </Link>
      </div>
      <p className="text-sm text-[#6b655d]">Last updated: {new Date(goal.updated_at).toLocaleString()}</p>
      <form className="space-y-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4" onSubmit={onSave}>
        <label className="block text-sm">
          Goal Title
          <input
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.title}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
            required
          />
        </label>
        <label className="block text-sm">
          SMART Goal Statement (one-liner)
          <input
            className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.smart_statement}
            onChange={(event) =>
              setForm((prev) => (prev ? { ...prev, smart_statement: event.target.value } : prev))
            }
            required
          />
        </label>
        <label className="block text-sm">
          Benefits of the Goal (10+ lines)
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.benefits_text ?? ""}
            onChange={(event) =>
              setForm((prev) => (prev ? { ...prev, benefits_text: event.target.value } : prev))
            }
          />
        </label>
        <label className="block text-sm">
          Obstacles of the Goal (10+ lines)
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.obstacles_text ?? ""}
            onChange={(event) =>
              setForm((prev) => (prev ? { ...prev, obstacles_text: event.target.value } : prev))
            }
          />
        </label>
        <label className="block text-sm">
          Solutions of Obstacles (10+ lines)
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={form.solutions_text ?? ""}
            onChange={(event) =>
              setForm((prev) => (prev ? { ...prev, solutions_text: event.target.value } : prev))
            }
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand" disabled={saving}>
          {saving ? "Saving..." : "Save Goal Tracker"}
        </button>
      </form>

      <section className="space-y-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4">
        <h2 className="text-lg font-medium">Monthly Goals for this Goal</h2>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={createMonthlyGoal}>
          <input
            className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
            placeholder="Monthly goal title"
            value={newMonthlyTitle}
            onChange={(event) => setNewMonthlyTitle(event.target.value)}
            required
          />
          <input
            className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
            type="date"
            value={newMonthlyDate}
            onChange={(event) => setNewMonthlyDate(event.target.value)}
            required
          />
          <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand">
            Add Month
          </button>
        </form>
        <div className="grid gap-2">
          {monthlyGoals.length === 0 ? (
            <p className="text-sm text-[#6b655d]">No monthly goals yet.</p>
          ) : (
            monthlyGoals.map((monthlyGoal) => (
              <article key={monthlyGoal.id} className="rounded-md border border-[#e1d5bf] p-3">
                <Link href={`/monthly/${monthlyGoal.id}`} className="font-medium underline">
                  {monthlyGoal.title}
                </Link>
                <p className="text-sm text-[#6b655d]">
                  {monthlyGoal.month_date} | {monthlyGoal.progress_percent}% | {monthlyGoal.status}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
