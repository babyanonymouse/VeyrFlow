# HabitFlow User Guide

This guide documents what is currently implemented in HabitFlow based on the app code.

## 1. What HabitFlow Does

HabitFlow is a productivity app for:

- Tracking **tasks**
- Tracking **habits**
- Monitoring momentum through a dashboard with:
  - pending habits
  - priority tasks
  - weekly snapshot metrics

## 2. Sign In & Access

- Public routes:
  - `/` (landing page)
  - `/sign-in`
  - `/sign-up`
- All dashboard routes require authentication:
  - `/dashboard`
  - `/dashboard/tasks`
  - `/dashboard/habits`

If you are not signed in, protected routes redirect to Clerk sign-in.

## 3. Navigation

### Desktop

- Left sidebar:
  - Overview
  - Tasks
  - Habits
  - Settings (link exists, but the page is not currently implemented)

### Mobile

- Bottom navigation bar with the same links.

### Global Header

- **Docs** link in the top header (`/docs`)
- Sign-in button (when signed out)
- User button/avatar (when signed in)

## 4. Overview Dashboard (`/dashboard`)

The dashboard (“Nerve Center”) shows:

1. **Greeting** with your first name
2. **Weekly Snapshot**:
   - Tasks Done (this week)
   - Habit Rate (today)
   - Best Streak (active days)
3. **Pending Habits**
   - habits that are active and not yet checked off today
4. **Priority Tasks**
   - incomplete tasks that are high priority or due today
5. **Intelligence slot**
   - currently a placeholder UI message

If both pending habits and priority tasks are empty, you’ll see an “All caught up!” state.

## 5. Tasks (`/dashboard/tasks`)

### Create a Task

Use **New Task** and fill:

- **Title** (required, max 100 chars)
- **Description** (optional, max 500 chars)
- **Priority**: low / medium / high
- **Deadline** (optional date)
- **Privacy mode** checkbox

### Edit a Task

- Click the pencil icon on a task card.
- Same fields as create.

### Complete / Reopen a Task

- Click the square check button on a task card.
- Completed tasks are visually marked with strike-through.
- Completion timestamp is stored for weekly analytics.

### Delete a Task

- Click the trash icon.

### Task Velocity Chart

At the top of Tasks page:

- 7-day trend for **Created** vs **Completed**
- Shows “No activity yet” state when there is no recent activity.

## 6. Habits (`/dashboard/habits`)

### Create a Habit

Use **New Habit** and fill:

- **Title** (required, max 100 chars)
- **Description** (optional, max 500 chars)
- **Frequency** (currently UI exposes Daily)

### Complete a Habit for Today

- Click **Complete Habit** on the habit card.
- A habit can be checked off once per day.
- Check-off is saved using your local date (`YYYY-MM-DD`).

### Habit Tracking Visuals

Each habit shows:

- **Current streak** in days
- **35-day consistency heatmap** (7 rows x 5 columns)
- Last completed date text

### Delete a Habit

- Delete icon appears on habit cards (desktop hover behavior).

## 7. Weekly Snapshot Metrics Explained

- **Tasks Done (this week):** count of tasks completed since start of current week.
- **Habit Rate (today):** percentage of active habits completed today.
- **Best Streak:** highest current streak among active habits.

## 8. Privacy & AI Notes

- Task-level **Privacy mode** exists and is persisted.
- Habit model includes AI suggestion fields in storage.
- The dashboard intelligence panel is currently a placeholder message.
- AI suggestion generation is not currently exposed as a user workflow in the implemented UI.

## 9. Docs Site (`/docs`)

HabitFlow includes an in-app docs experience using Fumadocs:

- left docs navigation
- searchable docs UI
- keyboard search hint includes `Ctrl + K`

## 10. Progressive Web App (PWA)

HabitFlow includes PWA essentials:

- Web manifest
- Service worker registration (disabled in development)
- Standalone display mode

Install behavior depends on browser/platform support (desktop Chromium, Android, iOS Safari behavior differs by platform).

## 11. Current Known Gaps

- `/dashboard/settings` is linked in navigation but not implemented yet.
- AI insights are displayed as a placeholder, not full interactive intelligence output yet.
