# 🧠 VeyrFlow Learning Tracker

**Project:** VeyrFlow – Smart To-Do & Habits App

**Goal:** Learn full-stack development, deployment, and optional AI integration through a real, deployable project.

## 1. Frontend Skills

| Concept / Skill       | What to Learn                      | How to Practice in VeyrFlow                   | Status |
| --------------------- | ---------------------------------- | ---------------------------------------------- | ------ |
| React Components      | Functional components, props       | Build TaskCard, HabitCard, TaskForm            | ✅     |
| React Hooks           | useState, useEffect, derived state | Manage task list, form input, API fetch states | ✅     |
| Next.js Pages         | File-based routing                 | Dashboard pages/index.js                       | ✅     |
| Next.js SSR/SSG       | Pre-rendered pages                 | Experiment with task dashboard rendering       | ✅     |
| Event Handling        | Forms, buttons                     | Add/edit/delete task forms                     | ✅     |
| Conditional Rendering | Show/hide completed tasks          | Mark tasks/habits complete/incomplete          | ✅     |
| Tailwind CSS          | Utility-first styling              | Responsive layout, cards, buttons              | ✅     |
| Skeleton Loading      | Loading states                     | Add loading animation for API fetch            | ⬜     |

## 2. Backend Skills

| Concept / Skill    | What to Learn           | How to Practice in VeyrFlow        | Status |
| ------------------ | ----------------------- | ----------------------------------- | ------ |
| Next.js API Routes | Server Actions/Endpoints| Create Server Actions for CRUD      | ✅     |
| RESTful CRUD       | GET, POST, PUT, DELETE  | Implement full task/habit lifecycle | ✅     |
| Validation         | Input validation        | Check form inputs server-side (Zod) | ✅     |
| Error Handling     | Try/catch, status codes | Handle API errors gracefully        | ✅     |

## 3. Database Skills

| Concept / Skill | What to Learn                | How to Practice in VeyrFlow  | Status |
| --------------- | ---------------------------- | ----------------------------- | ------ |
| MongoDB Basics  | Collections, documents       | tasks and habits collections  | ✅     |
| Mongoose        | Schemas, models              | Task.js, Habit.js models      | ✅     |
| CRUD Ops        | Create, Read, Update, Delete | Connect API routes to MongoDB | ✅     |
| Queries         | Filtering, sorting           | Fetch completed tasks, habits | ✅     |

## 4. Integration & Full-Stack Skills

| Concept / Skill | What to Learn                | How to Practice in VeyrFlow      | Status |
| --------------- | ---------------------------- | --------------------------------- | ------ |
| API Consumption | Server Actions fetch         | Call Server Actions from frontend | ✅     |
| State Sync      | React + backend              | Update UI on successful API calls | ✅     |
| Form Management | Controlled components        | Add/edit tasks & habits forms     | ✅     |
| Derived State   | Task stats (completed/total) | Display analytics on dashboard    | ✅     |

## 5. Optional AI/Advanced Features

| Concept / Skill       | What to Learn        | How to Practice in VeyrFlow            | Status |
| --------------------- | -------------------- | --------------------------------------- | ------ |
| OpenAI API            | Fetch AI suggestions | Recommend habit improvements            | ⬜     |
| Asynchronous Requests | async/await          | Call AI API and update task suggestions | ⬜     |
| Conditional AI        | Trigger suggestions  | Only for incomplete/high-priority tasks | ⬜     |

## 6. Deployment & DevOps Skills

| Concept / Skill       | What to Learn         | How to Practice in VeyrFlow    | Status |
| --------------------- | --------------------- | ------------------------------- | ------ |
| Environment Variables | .env.local            | Store MongoDB URI, API keys     | ✅     |
| Hosting               | Vercel / Render / AWS | Deploy full-stack app live      | ✅     |
| CI/CD Basics          | Auto-deploy on push   | Link GitHub repo to Vercel      | ✅     |
| Testing & Debugging   | Console logs, Postman | Test API routes, frontend fetch | ✅     |

## 7. UX / Product Skills

| Concept / Skill   | What to Learn            | How to Practice in VeyrFlow            | Status |
| ----------------- | ------------------------ | --------------------------------------- | ------ |
| User Feedback     | Messages, alerts         | Show success/error notifications        | ⬜     |
| Responsive Design | Mobile + Desktop         | Test on multiple screen sizes           | ✅     |
| Accessibility     | ARIA roles, keyboard nav | Ensure forms and buttons are accessible | ⬜     |
| Skeleton Loading  | Smooth UX                | Show loading states for API calls       | ⬜     |

## 8. Execution Milestones

| Milestone | Goal             | Deliverable                               | Status |
| --------- | ---------------- | ----------------------------------------- | ------ |
| M1        | Project skeleton | Next.js + Tailwind + MongoDB setup        | ✅     |
| M2        | CRUD API         | Tasks CRUD & Server Actions               | ✅     |
| M3        | Frontend forms   | Add/Edit/Delete tasks & habits            | ✅     |
| M4        | Dashboard        | Display tasks/habits, completed stats     | ✅     |
| M5        | Optional AI      | Habit suggestions                         | ⬜     |
| M6        | Polishing        | Skeleton loaders, responsive UI, feedback | ⬜     |
| M7        | Deployment       | Vercel Analytics integration & Push       | ✅     |

## Usage Instructions

- Fill each "Status" checkbox as you complete tasks/skills
- Add notes under each section if you encounter blockers or insights
- Revisit optional AI features after core CRUD is solid
