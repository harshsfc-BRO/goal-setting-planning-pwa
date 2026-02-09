"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MonthlyGoal, YearlyGoal } from "@/lib/supabase/types";

type MonthlyWithGoal = MonthlyGoal & {
  yearly_goal?: Pick<YearlyGoal, "id" | "title">;
};

export default function MonthlyPage() {
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyWithGoal[]>([]);
  const [selectedYearlyGoalId, setSelectedYearlyGoalId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newMonthDate, setNewMonthDate] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;
      if (!userId) {
        setError("Session not found. Please login.");
        setLoading(false);
        return;
      }
      const { data: yearlyData, error: yearlyError } = await supabase
        .from("yearly_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (yearlyError) {
        setError(yearlyError.message);
        setLoading(false);
        return;
      }
      const typedYearly = (yearlyData as YearlyGoal[]) ?? [];
      setYearlyGoals(typedYearly);
      if (typedYearly.length > 0) {
        setSelectedYearlyGoalId((prev) => prev || typedYearly[0].id);
      }

      const { data: monthlyData, error: monthlyError } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("user_id", userId)
        .order("month_date", { ascending: false });
      if (monthlyError) {
        setError(monthlyError.message);
        setLoading(false);
        return;
      }
      const typedMonthly = ((monthlyData as MonthlyGoal[]) ?? []).map((entry) => ({
        ...entry,
        yearly_goal: typedYearly.find((yg) => yg.id === entry.yearly_goal_id)
      }));
      setMonthlyGoals(typedMonthly);
      setLoading(false);
    }
    loadData();
  }, []);

  const grouped = useMemo(() => {
    return monthlyGoals.reduce<Record<string, MonthlyWithGoal[]>>((acc, item) => {
      const key = item.yearly_goal?.title ?? "Unknown Goal";
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
  }, [monthlyGoals]);

  async function createMonthlyGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) {
      setError("Session not found.");
      return;
    }
    const { error: insertError } = await supabase.from("monthly_goals").insert({
      yearly_goal_id: selectedYearlyGoalId,
      user_id: userId,
      month_date: newMonthDate,
      title: newTitle.trim(),
      status: "planned",
      progress_percent: 0
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewTitle("");
    const { data, error: refreshError } = await supabase
      .from("monthly_goals")
      .select("*")
      .eq("user_id", userId)
      .order("month_date", { ascending: false });
    if (refreshError) {
      setError(refreshError.message);
      return;
    }
    const typedMonthly = ((data as MonthlyGoal[]) ?? []).map((entry) => ({
      ...entry,
      yearly_goal: yearlyGoals.find((yg) => yg.id === entry.yearly_goal_id)
    }));
    setMonthlyGoals(typedMonthly);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Monthly Goals and Review</h1>
      <p className="text-sm text-[#6b655d]">
        Structured monthly goals across all yearly goals.
      </p>

      <form className="grid gap-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4 md:grid-cols-4" onSubmit={createMonthlyGoal}>
        <select
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
          value={selectedYearlyGoalId}
          onChange={(event) => setSelectedYearlyGoalId(event.target.value)}
          required
        >
          {yearlyGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
          type="date"
          value={newMonthDate}
          onChange={(event) => setNewMonthDate(event.target.value)}
          required
        />
        <input
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
          placeholder="Monthly goal title"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          required
        />
        <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand">
          Add Monthly Goal
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-[#6b655d]">Loading monthly goals...</p> : null}

      <div className="space-y-4">
        {Object.entries(grouped).map(([goalTitle, items]) => (
          <section key={goalTitle} className="rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4">
            <h2 className="text-lg font-medium">{goalTitle}</h2>
            <div className="mt-2 grid gap-2">
              {items.map((item) => (
                <article key={item.id} className="rounded-md border border-[#e1d5bf] p-3">
                  <Link className="font-medium underline" href={`/monthly/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="text-sm text-[#6b655d]">
                    {item.month_date} | {item.progress_percent}% | {item.status}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
