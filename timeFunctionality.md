# Time & Date Handling Design for Tasks and Habits

This document describes how to implement time and date functionality for tasks and habits in HabitFlow using MongoDB/Mongoose and Next.js. It covers what you want to track, how to shape your schemas, and how to use dates in the UI.

---

## 1. What You Want to Track

For both **tasks** and **habits**, four time‑related concepts matter:

- **Tasks**  
  - `dueAt` – a specific day + time (e.g., “Finish blog post – May 15 18:00”).
- **Habits**  
  - `targetTime` – “I want to do this at 7:30 AM every day.”
  - `frequency` – daily, weekdays, weekly, custom days.
- **Tracking**  
  - `completedAt` – timestamp when the user checked it off.
  - `createdAt` / `updatedAt` – for analytics and your 7‑day velocity chart.

This matches patterns used in existing habit/task apps (e.g., TimePlanner, RoutineTracker).[web:77][web:81]

---

## 2. Schema Design (MongoDB + Mongoose)

### Task schema (`models/Task.ts`)

Add a `dueAt` Date field and keep `completed`, `createdAt`, `updatedAt`:

```ts
import { Schema, model } from "mongoose";

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  dueAt: { type: Date },      // exact time this task is due
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

- Store `dueAt` as a `Date`; avoid strings because you’ll want to sort and query (e.g., overdue tasks).
- If you want to keep it minimal at first, you can skip `dueAt` and only add it later.

### Habit schema (`models/Habit.ts`)

Use timezone-safe habit fields: `targetTime` as `"HH:mm"` string and `completedDates` as local date strings:

```ts
import { Schema, model } from "mongoose";

const HabitSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },

  // Stored as local wall-clock time, e.g. "07:30"
  targetTime: { type: String, default: null },

  // Array of local dates, e.g. ["2026-05-14", "2026-05-15"]
  completedDates: { type: [String], default: [] },
});
```

- Do **not** store local habit times as MongoDB `Date`; MongoDB stores dates in UTC and can shift local wall-clock intent.
- Keep absolute task moments as `Date`; keep relative daily habit time as `"HH:mm"` string.

---

## 3. Frontend UX for Tasks and Habits

### Task form

For each task:

- **Due date + time picker**  
  - Offer a date picker and an optional time picker.
  - If `dueAt` is set, show it in the UI like:
    - “Due: May 15 at 18:00”.
- **Sorting and coloring**  
  - Sort tasks by `dueAt` (with `null` dates last) so overdue tasks rise to the top.
  - Use colors:
    - Overdue (red/amber),  
    - Due today (amber/white),  
    - Upcoming (light gray/neutral).

Most habit/task apps use similar patterns for due dates.[web:77][web:78]

### Habit form

For each habit:

- **Target time**  
  - Show a time picker (e.g., 7:30 AM) for `targetTime`.
  - Display this in the habit card: “Do at 7:30 AM”.
- **Completion tracking**  
  - On the dashboard, for each habit:
    - Check if `completedDates` contains an entry for today (`YYYY-MM-DD`).
    - Show “✅ Today” or “🕒 Do this now” if the current time is near `targetTime`.

This pattern is common in habit‑tracking apps like TimePlanner and RoutineTracker.[web:77][web:81]

---

## 4. Using Dates in the UI and Logic

### Task list

- **Sorting**  
  - Sort tasks by `dueAt` (ascending, with `null` last).
- **Status tags**  
  - Use helper logic:
    - `overdue`: `dueAt < now && completed === false`
    - `due today`: `same day as dueAt && completed === false`
    - `completed`: `completed === true`

This lets you visually group and highlight tasks in the dashboard.

### Habit card

- **Today’s status**  
  - Compute:
    - Is today a valid day for `frequency`? (e.g., weekends not allowed if `frequency === "weekdays"`).
    - Is there a `completedAt` entry for `startOfDay(today)`?
  - Show:
    - “✅ Today” (completed)
    - “🕒 Do at 7:30 AM” (not yet done)
    - “🔒 Not today” (if today isn’t in `frequency`).
- **Analytics**  
  - Your 7‑day task velocity chart already uses `createdAt`/`completedAt`; extend it to habits by:
    - Grouping `completedAt` entries by day.
    - Showing “Habits completed / total” each day.

This matches how many habit apps visualize progress over time.[web:78][web:82]

---

## 5. Optional: Keep Nudges Out of MVP

For now:

- Use native UI state only (surface habits in dashboard when app is opened).
- Avoid web push/background notification complexity in this phase.

---

## 6. Next Steps in Your Codebase

To adopt this in HabitFlow:

1. Update your Mongoose schemas:
   - Keep task absolute time fields as `Date`.
   - Add `targetTime` (`HH:mm` string) to `Habit`.
   - Keep habit completion history in `completedDates[]` (`YYYY-MM-DD` strings).
2. Extend your Server Actions:
   - Accept `targetTime` for habits.
3. Update the UI forms:
   - Use native `<input type="time">` for habit `targetTime`.
4. Enhance the dashboard:
   - Sort tasks by `dueAt`.
   - Show habit status and “Do this at 7:30 AM” reminders.

This design keeps your data model **simple and queryable**, while giving you rich time‑based UX for tasks and habits.[web:80][web:83]
