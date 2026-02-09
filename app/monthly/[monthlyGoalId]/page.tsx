"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MonthlyGoal, WeeklyGoal } from "@/lib/supabase/types";

export default function MonthlyGoalDetailPage() {
  const params = useParams<{ monthlyGoalId: string }>();
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [newWeeklyTitle, setNewWeeklyTitle] = useState("");
  const [newWeekStartDate, setNewWeekStartDate] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
      new Date().getDate()
    ).padStart(2, "0")}`
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const monthlyGoalId = params.monthlyGoalId;
      if (!monthlyGoalId) {
        setError("Missing monthly goal id.");
        setLoading(false);
        return;
      }
      const { data, error: goalError } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("id", monthlyGoalId)
        .single();
      if (goalError) {
        setError(goalError.message);
        setLoading(false);
        return;
      }
      const typed = data as MonthlyGoal;
      setMonthlyGoal(typed);
      setReviewNotes(typed.review_notes ?? "");

      const { data: weeklyData, error: weeklyError } = await supabase
        .from("weekly_goals")
        .select("*")
        .eq("monthly_goal_id", monthlyGoalId)
        .order("week_start_date", { ascending: false });
      if (weeklyError) {
        setError(weeklyError.message);
      } else {
        setWeeklyGoals((weeklyData as WeeklyGoal[]) ?? []);
      }
      setLoading(false);
    }
    loadData();
  }, [params.monthlyGoalId]);

  async function saveMonthlyReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!monthlyGoal) {
      return;
    }
    setError(null);
    const { error: updateError } = await supabase
      .from("monthly_goals")
      .update({ review_notes: reviewNotes })
      .eq("id", monthlyGoal.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
  }

  async function createWeeklyGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!monthlyGoal || !newWeeklyTitle.trim()) {
      return;
    }
    setError(null);
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) {
      setError("Missing session.");
      return;
    }
    const { error: insertError } = await supabase.from("weekly_goals").insert({
      monthly_goal_id: monthlyGoal.id,
      user_id: userId,
      week_start_date: newWeekStartDate,
      title: newWeeklyTitle.trim(),
      status: "planned",
      progress_percent: 0
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewWeeklyTitle("");
    const { data, error: queryError } = await supabase
      .from("weekly_goals")
      .select("*")
      .eq("monthly_goal_id", monthlyGoal.id)
      .order("week_start_date", { ascending: false });
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setWeeklyGoals((data as WeeklyGoal[]) ?? []);
  }

  if (loading) {
    return <p className="text-sm text-[#6b655d]">Loading monthly goal...</p>;
  }

  if (!monthlyGoal) {
    return <p className="text-sm text-red-700">{error ?? "Monthly goal not found."}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{monthlyGoal.title}</h1>
        <Link className="text-sm underline" href="/monthly">
          Back to Monthly
        </Link>
      </div>

      <form className="space-y-2 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4" onSubmit={saveMonthlyReview}>
        <h2 className="text-lg font-medium">Monthly Review Notes</h2>
        <textarea
          className="min-h-28 w-full rounded-md border border-[#d8cab1] px-3 py-2"
          value={reviewNotes}
          onChange={(event) => setReviewNotes(event.target.value)}
          placeholder="What worked? What needs carry-forward?"
        />
        <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand">
          Save Review
        </button>
      </form>

      <section className="space-y-2 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4">
        <h2 className="text-lg font-medium">Weekly Goals</h2>
        <form className="grid gap-3 md:grid-cols-[1fr_200px_auto]" onSubmit={createWeeklyGoal}>
          <input
            className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
            placeholder="Weekly goal title"
            value={newWeeklyTitle}
            onChange={(event) => setNewWeeklyTitle(event.target.value)}
            required
          />
          <input
            className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
            type="date"
            value={newWeekStartDate}
            onChange={(event) => setNewWeekStartDate(event.target.value)}
            required
          />
          <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand">
            Add Week
          </button>
        </form>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-2">
          {weeklyGoals.length === 0 ? (
            <p className="text-sm text-[#6b655d]">No weekly goals yet.</p>
          ) : (
            weeklyGoals.map((weeklyGoal) => (
              <article key={weeklyGoal.id} className="rounded-md border border-[#e1d5bf] p-3">
                <Link href={`/weekly/${weeklyGoal.id}`} className="font-medium underline">
                  {weeklyGoal.title}
                </Link>
                <p className="text-sm text-[#6b655d]">
                  {weeklyGoal.week_start_date} | {weeklyGoal.progress_percent}% | {weeklyGoal.status}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
