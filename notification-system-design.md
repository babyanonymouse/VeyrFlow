# VeyrFlow Notification System Design & Architecture

## 1) Bug Identification: Why users are not receiving task/habit notifications

### Confirmed root causes in the current codebase
1. **No client-side push subscription flow exists**
   - There is no usage of `Notification.requestPermission()` or `registration.pushManager.subscribe(...)` in the app.
   - Result: `/api/notifications/subscribe` is never called in normal user flow, so subscription records are usually never created.

2. **No notification delivery pipeline exists**
   - Current backend has subscribe/unsubscribe endpoints and a `PushSubscription` model, but no server process that sends push messages with `web-push`.
   - Result: even with a stored subscription, nothing dispatches task/habit reminder payloads.

3. **No scheduling layer for due reminders**
   - Tasks/habits contain time-related fields (`deadline`, `targetTime`) but there is no cron/queue/worker mechanism to evaluate “what should notify now.”
   - Result: reminders are never triggered automatically.

4. **Notification icon path mismatch in service worker**
   - `app/sw.ts` uses `/icon-192x192.png` for notification icon/badge, while manifest/icons are exposed as `/icon1` and `/icon2`.
   - Result: notification rendering may degrade or fail on some environments.

---

## 2) Target Architecture (No code yet)

## A. High-level components
1. **Client Notification Orchestrator**
   - Runs after meaningful user actions (not on first page load).
   - Handles soft-ask UX, permission request, service-worker readiness, and subscription sync.

2. **Notification Preference Service**
   - Stores per-user channels and reminder preferences (task reminder offsets, habit reminder windows, quiet hours, timezone).

3. **Reminder Scheduler**
   - Periodic job that computes upcoming reminders from task deadlines and habit target times.
   - Writes due reminder jobs into a queue.

4. **Push Delivery Worker**
   - Consumes queue jobs.
   - Sends notifications via `web-push` using VAPID keys.
   - Cleans up invalid subscriptions (HTTP 404/410).

5. **Observability + Retry**
   - Delivery logs, retry policy, dead-letter queue, and metrics.

## B. Data model additions
1. `notification_preferences`
   - `userId`, `enabled`, `timezone`, `quietHours`, `taskReminderOffsets[]`, `habitReminderLeadMinutes`, `updatedAt`.
2. `notification_jobs`
   - `jobId`, `userId`, `entityType` (task/habit), `entityId`, `scheduledFor`, `status`, `attempts`, `lastError`.
3. `notification_delivery_log`
   - `userId`, `endpointHash`, `jobId`, `status`, `providerStatusCode`, `sentAt`.

---

## 3) End-to-end flow

1. User creates/updates task or habit time.
2. Scheduler periodically computes reminders due in next window (e.g., next 5–10 minutes).
3. Scheduler enqueues idempotent reminder jobs.
4. Worker fetches active subscriptions + preferences.
5. Worker sends push payload (`title`, `body`, deep link URL).
6. Worker marks success/failure, retries transient failures, prunes invalid subscriptions.

---

## 4) Let users enable notifications without opening Settings

## A. In-context “soft ask” entry points
1. **After creating first task with deadline**
   - Prompt: “Want reminders before this is due?”
2. **After creating first habit with target time**
   - Prompt: “Enable daily habit reminders?”
3. **Dashboard nudge card**
   - Inline card shown only when notifications are not enabled.
4. **Notification bell in top nav**
   - One-tap entry for permission and reminder preferences.

## B. UX sequence
1. Show in-app explainer (soft ask) with clear value and frequency.
2. If user taps “Enable,” request browser permission.
3. On granted: create subscription + save preferences immediately.
4. On denied/default: show lightweight recovery instructions and “Ask me later.”

## C. Guardrails
1. Never auto-prompt on first page load.
2. Cooldown after dismissal/denial.
3. Respect quiet hours and per-user frequency preferences.

---

## 5) Reliability and security requirements

1. Validate and authenticate subscription mutations by `userId`.
2. Encrypt transport (HTTPS only) and keep VAPID private key server-only.
3. Use idempotency key per notification job (`userId + entityId + scheduledFor`).
4. Handle expired subscriptions with automatic cleanup.
5. Add rate-limits and retry backoff to avoid notification storms.

---

## 6) Suggested rollout plan

1. **Phase 1 (Foundation):** preference model + soft ask UI + client subscription orchestration.
2. **Phase 2 (Delivery):** queue + worker + web-push sending + invalid subscription cleanup.
3. **Phase 3 (Scheduling):** cron/scheduler for task and habit reminders with timezone support.
4. **Phase 4 (Optimization):** analytics, quiet hours tuning, smart nudge timing, A/B opt-in funnel.

---

## 7) External patterns reviewed (internet/other repos)

1. **Client subscribe/unsubscribe pattern with VAPID + `pushManager.subscribe`**
   - Repo: `hoangsonww/Claude-Code-Agent-Monitor`
   - File: `client/src/lib/push.ts`
   - Reference: https://github.com/hoangsonww/Claude-Code-Agent-Monitor/blob/49c6dcbfb6a4281ca5b01cddf4a0146c2d9a7f3a/client/src/lib/push.ts

2. **Server delivery worker pattern using `web-push`, auth guard, cleanup logic**
   - Repo: `Gboyega12/native-app`
   - File: `api/notifications/web-push-send.ts`
   - Reference: https://github.com/Gboyega12/native-app/blob/805d014c0545c976aa81fc08a5f79306304cdb83/api/notifications/web-push-send.ts

3. **Scheduled dispatch pattern (`Cron` + web-push)**
   - Repo: `atolz/Book-Store`
   - File: `src/users/users.service.ts`
   - Reference: https://github.com/atolz/Book-Store/blob/cf44a32fcfb8605681154c3d12e39eb2047fd692/src/users/users.service.ts

