export type YearlyGoal = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  year: number;
  smart_statement: string;
  benefits_text: string | null;
  obstacles_text: string | null;
  solutions_text: string | null;
  progress_percent: number;
  status: "active" | "paused" | "completed" | "archived";
  created_at: string;
  updated_at: string;
};

export type MonthlyGoal = {
  id: string;
  yearly_goal_id: string;
  user_id: string;
  month_date: string;
  title: string;
  objective_text: string | null;
  success_metric: string | null;
  review_notes: string | null;
  status: "planned" | "active" | "completed" | "carried_forward";
  progress_percent: number;
  created_at: string;
  updated_at: string;
};

export type WeeklyGoal = {
  id: string;
  monthly_goal_id: string;
  user_id: string;
  week_start_date: string;
  title: string;
  objective_text: string | null;
  obstacle_plan: string | null;
  status: "planned" | "active" | "completed" | "missed";
  progress_percent: number;
  created_at: string;
  updated_at: string;
};

export type BabyStep = {
  id: string;
  weekly_goal_id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  position: number;
  created_at: string;
  updated_at: string;
};
