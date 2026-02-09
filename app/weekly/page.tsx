"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { WeeklyGoal } from "@/lib/supabase/types";

export default function WeeklyPage() {
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeeklyGoals() {
      setLoading(true);
      setError(null);
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;
      if (!userId) {
        setError("Session not found. Please login.");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("weekly_goals")
        .select("*")
        .eq("user_id", userId)
        .order("week_start_date", { ascending: false });
      if (queryError) {
        setError(queryError.message);
      } else {
        setWeeklyGoals((data as WeeklyGoal[]) ?? []);
      }
      setLoading(false);
    }
    loadWeeklyGoals();
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Weekly Goals and Review</h1>
      <p className="text-sm text-[#6b655d]">
        Weekly planning, execution, and review across all goals.
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-[#6b655d]">Loading weekly goals...</p> : null}
      <div className="grid gap-2">
        {weeklyGoals.length === 0 ? (
          <p className="text-sm text-[#6b655d]">No weekly goals yet. Create from a monthly goal.</p>
        ) : (
          weeklyGoals.map((goal) => (
            <article key={goal.id} className="rounded-md border border-[#e1d5bf] bg-[#fffaf0] p-3">
              <Link href={`/weekly/${goal.id}`} className="font-medium underline">
                {goal.title}
              </Link>
              <p className="text-sm text-[#6b655d]">
                {goal.week_start_date} | {goal.progress_percent}% | {goal.status}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
