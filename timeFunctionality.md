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

Add `targetTime`, `frequency`, and an array of `completedAt` timestamps:

```ts
import { Schema, model } from "mongoose";

const HabitSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },

  // When the user wants to do this habit in the day (e.g., 7:30 AM)
  targetTime: { type: Date },

  // Recurrence pattern (e.g., "daily", "weekdays", "mon,tue,thu", etc.)
  frequency: { type: String, default: "daily" },

  // Array of timestamps when the user completed the habit
  completedAt: [{ type: Date }],
});
```

- Store `targetTime` as a `Date` in the user’s local timezone (e.g., Nairobi time).
- Use `frequency` to control which days the habit is “active” (daily, weekdays, custom).

Storing dates as `Date` fields in MongoDB is standard and works well for queries and sorting.[web:80][web:83]

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
- **Frequency**  
  - A dropdown or buttons:  
    - Daily, Weekdays, Weekly, Custom days.
  - Later you can use this to decide when the habit shows up as “due today.”
- **Completion tracking**  
  - On the dashboard, for each habit:
    - Check if `completedAt` contains an entry for today.
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

## 5. Optional: “Do This at That Time” Nudges

You can keep this as a **nice‑to‑have** for later:

- **Near‑time indicators**  
  - Compare `targetTime` with the current time (in user’s timezone).
  - If current time is near `targetTime` (e.g., ±1 hour), show:
    - “Do this now” or “Almost time for your habit”.
- **Notifications**  
  - In future versions, you could:
    - Trigger local browser notifications.
    - Or use scheduled emails/Webhooks at `targetTime`.

This “nudge‑at‑time” pattern is used by habit‑tracking apps to keep users on track instead of just showing “you missed it.”[web:77][web:81]

---

## 6. Next Steps in Your Codebase

To adopt this in HabitFlow:

1. Update your Mongoose schemas:
   - Add `dueAt` to `Task`.
   - Add `targetTime`, `frequency`, and `completedAt[]` to `Habit`.
2. Extend your Server Actions:
   - Accept `dueAt` for tasks, `targetTime` and `frequency` for habits.
3. Update the UI forms:
   - Add date/time pickers for `dueAt` and `targetTime`.
4. Enhance the dashboard:
   - Sort tasks by `dueAt`.
   - Show habit status and “Do this at 7:30 AM” reminders.

This design keeps your data model **simple and queryable**, while giving you rich time‑based UX for tasks and habits.[web:80][web:83]
