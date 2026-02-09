# App Blueprint: Goal Setting & Planning PWA

## 1. User Journey (Monday Coaching Flow)

1. User logs in.
2. Opens Index Dashboard.
3. Enters current weekly review status.
4. Opens one yearly goal from Goals Master List.
5. Updates monthly goal progress.
6. Updates weekly goals.
7. Checks baby steps and marks done.
8. Opens Habits (AADAT) to track daily execution.

This flow fits your Monday guided session model and makes coaching repeatable.

## 2. Information Architecture

### Top-Level Navigation

1. `Dashboard` (Index)
2. `Goals Master List`
3. `Wheel of Life`
4. `Monthly Review`
5. `Weekly Review`
6. `Habits (AADAT)`

### Hierarchy

1. Yearly Goal
2. Monthly Goal (belongs to one yearly goal)
3. Weekly Goal (belongs to one monthly goal)
4. Baby Step (belongs to one weekly goal)

## 3. Page-by-Page Blueprint

## 3.1 Index Dashboard (`/`)

Purpose:
- The control center with 5 main cards/buttons:
  1. Goals Master List and Plan
  2. Wheel of Life - Activity
  3. Monthly Goals and Review
  4. Weekly Goals and Review
  5. Habits (opens AADAT)

Widgets:
- This week completion score
- Pending baby steps
- Upcoming weekly review reminder
- Last backup/sync time

## 3.2 Goals Master List (`/goals`)

Purpose:
- Show all yearly goals as clickable cards.

List item fields:
- Goal title
- Category
- Current progress (%)
- Current monthly focus

Actions:
- Open Goal Tracker
- Create Goal
- Archive Goal

## 3.3 Goal Tracker Sheet (`/goals/:goalId`)

Fields:
1. Date (created/updated)
2. SMART Goal Statement (one-liner)
3. Benefits (long rich text; target 10+ lines)
4. Obstacles (long rich text; target 10+ lines)
5. Solutions (long rich text; target 10+ lines)
6. Milestones (checklist with target date)
7. Monthly Goals (list + create button)

Actions:
- Save draft
- Publish update
- Add milestone
- Jump to monthly goals

## 3.4 Monthly Goals View (`/monthly`)

Purpose:
- Show all monthly goals across all yearly goals in a structured layout.

Views:
- Group by Yearly Goal
- Filter by month/year/status

Monthly goal item:
- Parent yearly goal
- Month
- Outcome target
- Progress
- Linked weekly goals

## 3.5 Monthly Goal Detail (`/monthly/:monthlyGoalId`)

Purpose:
- Deep planning and review at monthly level.

Fields:
- Month objective
- Why this month matters
- Success metric
- End-of-month review notes

Actions:
- Create weekly goals
- Check completion
- Carry-forward incomplete items

## 3.6 Weekly Goals View (`/weekly`)

Purpose:
- Show all weekly goals with current week focus.

Views:
- Current week board
- Upcoming week plan
- Overdue actions

## 3.7 Weekly Goal Detail (`/weekly/:weeklyGoalId`)

Purpose:
- Tactical execution for week.

Fields:
- Weekly objective
- Planned time blocks
- Obstacles expected this week
- Mitigation plan
- Baby steps list

Actions:
- Add baby step
- Mark complete
- Reschedule

## 3.8 Baby Steps Master List (`/weekly/:weeklyGoalId/baby-steps`)

Fields:
- Task title
- Due date
- Priority
- Status (todo/in-progress/done)
- Notes

## 3.9 Wheel of Life (`/wheel`)

Purpose:
- Self-assessment activity on life areas.

Areas:
- Health, Career, Finance, Relationships, Growth, etc.

Features:
- Rating sliders (1-10)
- Radar chart
- Reflection notes
- Suggested linked goals

## 3.10 Habits Redirect (`/habits`)

Behavior:
- Opens AADAT group URL with SSO/deep link.
- If not authenticated on AADAT, show guided login handoff.

## 4. Roles and Access

MVP roles:
1. User
2. Coach/Admin (you)

Coach/Admin can:
- View assigned users
- Add review comments
- See Monday session summary

## 5. Responsive Strategy (Desktop First + Mobile Ready)

- Desktop:
  - Sidebar nav + 2-column content layout
  - Rich text fields and multi-panel planning views
- Mobile:
  - Bottom nav
  - Single-column cards
  - Compact editor mode for long reflection text

## 6. Auth and Cloud Backup

Auth:
- Email/password + magic link (Supabase Auth)
- Optional social login later

Cloud backup/sync:
- Every create/update stored in Postgres
- Auto-save drafts every 10 seconds
- Conflict policy for MVP: last write wins
- Soft delete + restore for safety

## 7. PWA Requirements

1. Installable on desktop and mobile.
2. Manifest with app name/icons/theme.
3. Service worker cache for shell and recent pages.
4. Offline mode:
   - Read last synced data
   - Queue writes until online

## 8. Key Product Metrics

1. Weekly review completion rate
2. Baby step completion rate
3. Monthly goal completion rate
4. Retention after 4 weeks
5. Monday session attendance vs completion

## 9. MVP Scope Guardrails

Include:
- Full goal hierarchy
- Review screens
- Login
- Cloud sync
- AADAT handoff link

Exclude (Phase 2):
- AI coaching suggestions
- Advanced analytics dashboards
- Team collaboration beyond coach/admin

