# 📝 VeyrFlow – Production-Grade To-Do & Habits App

## Overview

VeyrFlow is a full-stack, Next.js application designed to track tasks, habits, and recurring goals. It leverages a modern monolithic architecture, strict TypeScript typing, and edge-optimized AI to provide intelligent daily focus suggestions.

This is a production-ready build designed to demonstrate systems thinking, zero-drag deployment, and scalable database design.

### Primary Goals

- **Modern Architecture:** Build a monolithic full-stack app using Next.js 16 (App Router) and React 19.
- **Data Integrity:** Manage persistent data with MongoDB (Mongoose) using strict schema validation and caching patterns.
- **Cost-Effective AI:** Integrate Google Gemini 1.5 Flash for intelligent suggestions, utilizing database caching to stay well within free-tier limits.
- **DevOps & Discipline:** Enforce strict GitHub branch protection (squash merging, required PRs) and deploy seamlessly to Vercel.

---

## Learning Outcomes

| Area           | Skills Demonstrated                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Frontend       | React 19 Server Components vs. Client Components, Tailwind CSS 4 utility styling, `clsx`/`tailwind-merge` dynamic UI. |
| Backend        | Next.js Server Actions (replacing legacy API routes), Singleton DB connection patterns.                               |
| Database       | MongoDB integration via Mongoose, strict typing with interfaces, query optimization (indexing).                       |
| AI Integration | Google Gemini API integration, prompt constraint design, AI response caching to prevent rate-limiting.                |
| DevOps         | GitHub branch protection rules, environment variable management, Vercel Hobby Tier deployment.                        |

---

## Tech Stack

| Layer      | Technology               | Purpose                                                    |
| ---------- | ------------------------ | ---------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)  | Monolithic routing, Server Actions, SSR/SSG                |
| Language   | TypeScript (Strict Mode) | Type safety, error prevention (`noUncheckedIndexedAccess`) |
| Styling    | Tailwind CSS 4           | Zero-drag responsive UI design                             |
| Database   | MongoDB + Mongoose       | Persistent storage with strict schemas                     |
| AI Engine  | Google Gemini 1.5 Flash  | Fast, free-tier intelligent insights                       |
| Icons & UI | Lucide React             | Standardized, lightweight iconography                      |
| Deployment | Vercel                   | CI/CD and edge network hosting                             |

---

## Architecture & Data Flow

### The "Hybrid Intelligence" Model

> AI is a dependent service, not a core state manager.

1. **Rules First:** The system fetches tasks and habits from MongoDB.
2. **Privacy Check:** Tasks marked with `privacyMode: true` are filtered out.
3. **Cache Check:** If `Habit.aiSuggestions.generatedAt` is under 24 hours old, the system returns the cached string _(Zero Cost)_.
4. **AI Fallback:** If the cache is stale, the server securely calls Gemini, updates the MongoDB cache, and returns the insight to the UI.

---

## Project Structure

```
VeyrFlow/
├── .github/             # CI workflows and PR templates
├── app/                 # Next.js App Router (Pages, Layouts)
│   ├── (auth)/          # Route group for authentication
│   └── dashboard/       # Protected views
├── components/          # React Components
│   ├── ui/              # Reusable atoms (Buttons, Inputs)
│   └── dashboard/       # Complex blocks
├── lib/                 # Core Logic
│   ├── db.ts            # Singleton MongoDB connection
│   └── actions/         # Server Actions (Backend CRUD)
├── models/              # Mongoose Schemas (Task.ts, Habit.ts)
├── public/              # Static assets
├── .env.example         # Environment variable documentation
├── package.json         # Dependency management
└── tsconfig.json        # Strict TypeScript configuration
```

---

## Execution Milestones

> **Shipping > Optimization.**

- **M1: Foundation** _(Current)_ — Next.js setup, strict TypeScript config, flattened folder structure, GitHub branch protection active.
- **M2: Data Layer** — MongoDB Singleton connection (`lib/db.ts`) and fully typed Mongoose Schemas with AI caching fields.
- **M3: Core CRUD** _(No AI yet)_ — Implement Server Actions to create, read, update, and delete Tasks and Habits.
- **M4: The UI** — Build the Dashboard, TaskCards, and HabitCards using Tailwind 4.
- **M5: AI Activation** — Integrate Gemini API, hook up the caching logic, and display the Insights panel.
- **M6: Production** — Vercel deployment and final environment variable configuration.
