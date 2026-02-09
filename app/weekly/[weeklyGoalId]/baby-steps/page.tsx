"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { BabyStep } from "@/lib/supabase/types";

export default function BabyStepsPage() {
  const params = useParams<{ weeklyGoalId: string }>();
  const [babySteps, setBabySteps] = useState<BabyStep[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<BabyStep["priority"]>("medium");
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
        .from("baby_steps")
        .select("*")
        .eq("weekly_goal_id", weeklyGoalId)
        .order("created_at", { ascending: true });
      if (queryError) {
        setError(queryError.message);
      } else {
        setBabySteps((data as BabyStep[]) ?? []);
      }
      setLoading(false);
    }
    loadData();
  }, [params.weeklyGoalId]);

  async function createBabyStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weeklyGoalId = params.weeklyGoalId;
    if (!weeklyGoalId || !newTitle.trim()) {
      return;
    }
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) {
      setError("Session not found.");
      return;
    }
    const { error: insertError } = await supabase.from("baby_steps").insert({
      weekly_goal_id: weeklyGoalId,
      user_id: userId,
      title: newTitle.trim(),
      due_date: newDueDate || null,
      priority: newPriority,
      status: "todo"
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewTitle("");
    setNewDueDate("");
    setNewPriority("medium");
    const { data, error: queryError } = await supabase
      .from("baby_steps")
      .select("*")
      .eq("weekly_goal_id", weeklyGoalId)
      .order("created_at", { ascending: true });
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setBabySteps((data as BabyStep[]) ?? []);
  }

  async function updateStatus(id: string, status: BabyStep["status"]) {
    setError(null);
    const { error: updateError } = await supabase.from("baby_steps").update({ status }).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setBabySteps((prev) => prev.map((step) => (step.id === id ? { ...step, status } : step)));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Baby Steps Master List</h1>
        <Link className="text-sm underline" href={`/weekly/${params.weeklyGoalId}`}>
          Back to Weekly Goal
        </Link>
      </div>
      <p className="text-sm text-[#6b655d]">Task-level execution for this weekly goal.</p>

      <form className="grid gap-3 rounded-lg border border-[#e3d7c3] bg-[#fffaf0] p-4 md:grid-cols-4" onSubmit={createBabyStep}>
        <input
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm md:col-span-2"
          placeholder="Baby step title"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          required
        />
        <input
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
          type="date"
          value={newDueDate}
          onChange={(event) => setNewDueDate(event.target.value)}
        />
        <select
          className="rounded-md border border-[#d8cab1] px-3 py-2 text-sm"
          value={newPriority}
          onChange={(event) => setNewPriority(event.target.value as BabyStep["priority"])}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button type="submit" className="rounded-md px-4 py-2 text-sm button-brand md:col-span-4">
          Add Baby Step
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-[#6b655d]">Loading baby steps...</p> : null}

      <div className="grid gap-2">
        {babySteps.length === 0 ? (
          <p className="text-sm text-[#6b655d]">No baby steps yet.</p>
        ) : (
          babySteps.map((step) => (
            <article key={step.id} className="rounded-md border border-[#e1d5bf] bg-[#fffaf0] p-3">
              <h2 className="font-medium">{step.title}</h2>
              <p className="text-sm text-[#6b655d]">
                due: {step.due_date ?? "not set"} | priority: {step.priority}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-md border border-[#d2c0a5] px-3 py-1 text-sm hover:bg-[#f3e7d2]"
                  onClick={() => updateStatus(step.id, "todo")}
                  type="button"
                >
                  todo
                </button>
                <button
                  className="rounded-md border border-[#d2c0a5] px-3 py-1 text-sm hover:bg-[#f3e7d2]"
                  onClick={() => updateStatus(step.id, "in_progress")}
                  type="button"
                >
                  in progress
                </button>
                <button
                  className="rounded-md border border-[#d2c0a5] px-3 py-1 text-sm hover:bg-[#f3e7d2]"
                  onClick={() => updateStatus(step.id, "done")}
                  type="button"
                >
                  done
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
