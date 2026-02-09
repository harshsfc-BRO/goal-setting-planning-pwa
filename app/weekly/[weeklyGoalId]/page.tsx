"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { WeeklyGoal } from "@/lib/supabase/types";

export default function WeeklyGoalDetailPage() {
  const params = useParams<{ weeklyGoalId: string }>();
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [objective, setObjective] = useState("");
  const [obstaclePlan, setObstaclePlan] = useState("");
  const [status, setStatus] = useState<WeeklyGoal["status"]>("planned");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const weeklyGoalId = params.weeklyGoalId;
      if (!weeklyGoalId) {
        setError("Missing weekly goal id.");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("weekly_goals")
        .select("*")
        .eq("id", weeklyGoalId)
        .single();
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      const typed = data as WeeklyGoal;
      setWeeklyGoal(typed);
      setObjective(typed.objective_text ?? "");
      setObstaclePlan(typed.obstacle_plan ?? "");
      setStatus(typed.status);
      setProgress(typed.progress_percent);
      setLoading(false);
    }
    loadData();
  }, [params.weeklyGoalId]);

  async function saveWeeklyGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!weeklyGoal) {
      return;
    }
    setError(null);
    const { error: updateError } = await supabase
      .from("weekly_goals")
      .update({
        objective_text: objective,
        obstacle_plan: obstaclePlan,
        status,
        progress_percent: progress
      })
      .eq("id", weeklyGoal.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
  }

  if (loading) {
    return <p className="text-sm text-[#6b655d]">Loading weekly goal...</p>;
  }

  if (!weeklyGoal) {
    return <p className="text-sm text-red-700">{error ?? "Weekly goal not found."}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{weeklyGoal.title}</h1>
        <Link className="text-sm underline" href="/weekly">
          Back to Weekly
        </Link>
      </div>

      <form className="space-y-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4" onSubmit={saveWeeklyGoal}>
        <label className="block text-sm">
          Weekly Objective
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          Obstacles and Mitigation Plan
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-[#d8cab1] px-3 py-2"
            value={obstaclePlan}
            onChange={(event) => setObstaclePlan(event.target.value)}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-sm">
            Status
            <select
              className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
              value={status}
              onChange={(event) => setStatus(event.target.value as WeeklyGoal["status"])}
            >
              <option value="planned">planned</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
              <option value="missed">missed</option>
            </select>
          </label>
          <label className="block text-sm">
            Progress (%)
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-[#d8cab1] px-3 py-2"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand">
              Save Weekly Goal
            </button>
          </div>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>

      <section className="rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4">
        <h2 className="text-lg font-medium">Baby Steps</h2>
        <p className="text-sm text-[#6b655d]">Manage task-level actions for this week.</p>
        <Link className="mt-2 inline-flex rounded-md px-4 py-2 text-sm button-brand" href={`/weekly/${weeklyGoal.id}/baby-steps`}>
          Open Baby Steps Master List
        </Link>
      </section>
    </section>
  );
}
