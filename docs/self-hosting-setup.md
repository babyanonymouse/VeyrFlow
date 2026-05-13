# HabitFlow Self-Hosting & Setup

This guide explains how to run HabitFlow locally.

## 1. Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB database (Atlas or local)
- Clerk application keys

## 2. Install Dependencies

From repository root:

```bash
npm ci
```

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and set values.

Required keys used by the app:

- `MONGODB_URI`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

Also present in example file:

- `GEMINI_API_KEY` (future/related AI support)
- `NEXT_PUBLIC_APP_URL`

## 4. Run in Development

```bash
npm run dev
```

Open:

- `http://localhost:3000/`

## 5. Production Build Check

```bash
npm run build
```

## 6. Linting

```bash
npm run lint
```

## 7. Main Routes

- `/` landing page
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/dashboard/tasks`
- `/dashboard/habits`
- `/docs`

## 8. PWA Notes

- Manifest: `public/manifest.json`
- Service worker source: `app/sw.ts`
- Registration wrapper: `app/serwist/SerwistRegistrar.tsx`
- Service worker is disabled in development mode.

