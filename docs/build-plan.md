# 6-Week Build Plan (MVP -> Launch Ready)

## Week 1: Project Foundation

Goals:
1. Scaffold Next.js + TypeScript project.
2. Configure Tailwind and base UI layout.
3. Configure Supabase project and environment keys.
4. Set up auth flows (sign up, login, logout, forgot password).

Definition of done:
- User can log in and reach protected dashboard route.
- Basic shell loads on desktop and mobile.

## Week 2: Goals Core (Yearly + Goal Tracker)

Goals:
1. Build Goals Master List page.
2. Build Create/Edit Yearly Goal form.
3. Build Goal Tracker detail page:
   - SMART statement
   - Benefits
   - Obstacles
   - Solutions
   - Milestones

Definition of done:
- Full CRUD on yearly goals + milestones with cloud persistence.

## Week 3: Monthly + Weekly Layers

Goals:
1. Build monthly goals list/detail pages.
2. Build weekly goals list/detail pages.
3. Implement parent-child navigation:
   - Yearly -> Monthly -> Weekly

Definition of done:
- User can create complete planning chain from yearly to weekly.

## Week 4: Baby Steps + Review Experience

Goals:
1. Build baby steps master list under weekly goal.
2. Add task ordering, due dates, and completion states.
3. Build Monthly Review and Weekly Review summary views.
4. Add Monday session summary card on dashboard.

Definition of done:
- End-to-end weekly execution path is functional.

## Week 5: Wheel of Life + PWA + AADAT Link

Goals:
1. Build Wheel of Life page with scoring + radar chart.
2. Add PWA manifest, icons, install prompt, service worker caching.
3. Add Habits page deep-link to AADAT app/group.
4. Improve mobile responsiveness for all major pages.

Definition of done:
- App is installable and usable offline for recently cached screens.

## Week 6: Security, QA, and Launch

Goals:
1. Validate Row Level Security policies and permissions.
2. Add autosave, optimistic UI, and retry for failed sync.
3. Write core tests:
   - auth guard
   - goal CRUD
   - hierarchy navigation
4. Deploy production frontend and backend.

Definition of done:
- Production deployment with basic monitoring and backup confidence.

## MVP Backlog (Prioritized)

P0:
1. Login/auth
2. Yearly goal CRUD
3. Monthly/weekly/baby-step hierarchy
4. Review screens
5. AADAT habits handoff

P1:
1. Wheel of life
2. PWA offline queue improvements
3. Coach comments

P2:
1. Analytics and insights
2. AI suggestions
3. Template goal packs

## Risks and Mitigations

Risk: Long-form reflection fields may overwhelm users.
Mitigation: Add guided prompts and section templates.

Risk: Offline/online sync conflicts.
Mitigation: Last-write-wins in MVP + activity log.

Risk: Scope creep with advanced coaching features.
Mitigation: Strict weekly scope freeze and backlog discipline.

## Immediate Execution Checklist

1. Confirm stack choice (Next.js + Supabase).
2. Create Supabase project.
3. Scaffold app and commit base layout.
4. Implement Week 1 auth and protected routes.
