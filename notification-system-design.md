# Current Pipeline Bugs & Required Fixes

## Verified repository state (important)
- Current checked-out branch in this workspace is `copilot/user-notification-bug-analysis` (not `feat/PushNotification`).
- The following files referenced in the task are **not present** in this checkout:
  - `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/lib/webPush.ts`
  - `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/hooks/usePushNotifications.ts`
  - `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/components/settings/PushNotificationToggle.tsx`
  - `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/api/cron/reminders/route.ts`
- Because these files are missing here, findings below are based on the actual files that do exist in this working tree.

## 1) Service worker notification asset path bug
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/sw.ts`
- **Lines:** 75-76
- **Issue:** `showNotification` uses:
  - `icon: "/icon-192x192.png"`
  - `badge: "/icon-192x192.png"`
  but this repository does not contain a `/public/icon-192x192.png` file.
- **Why this breaks notifications:** browsers can fail to render notification assets or show degraded notifications when icon/badge URLs are invalid.
- **Required fix:** change icon/badge to valid existing asset routes (consistent with manifest/icon routes in this repo) or add the missing file to `/public`.

## 2) Push payload parsing is fragile and can throw
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/sw.ts`
- **Line:** 68
- **Issue:** `const data = event.data?.json() ?? {};` assumes payload is always valid JSON.
- **Why this breaks notifications:** if the push sender sends text, empty payload, or malformed JSON, `.json()` throws and the push event handler aborts before `showNotification`.
- **Required fix:** add defensive parsing/fallback logic around `event.data` so non-JSON payloads still result in a notification instead of hard failure.

## 3) Push click action does not respect payload deep-link
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/sw.ts`
- **Lines:** 93-94
- **Issue:** notification click always opens `/`.
- **Why this is a pipeline correctness bug:** even if reminders fire, user cannot be routed to the intended task/habit destination from notification payload data.
- **Required fix:** pass and read a URL in notification data and open/focus that URL on click.

## 4) Missing API route for reminder dispatch in this checkout
- **Expected by task statement:** `/app/api/cron/reminders/route.ts`
- **Actual state:** file is absent.
- **Why this blocks runtime reminders:** there is no current route in this checkout that dispatches reminder pushes, so no runtime trigger path exists from scheduled invocations.
- **Required fix:** ensure the reminders cron endpoint exists on this branch and is wired into deployment/runtime.

## 5) Missing client subscription pipeline files in this checkout
- **Expected by task statement:** `lib/webPush.ts`, `hooks/usePushNotifications.ts`, `components/settings/PushNotificationToggle.tsx`
- **Actual state:** all absent in this checkout.
- **Why this blocks subscription lifecycle:** without client permission/subscription orchestration, `/api/notifications/subscribe` and `/api/notifications/unsubscribe` are not reachable from current UI code.
- **Required fix:** ensure those files are present on the working branch and imported into active UI routes/components.

## 6) Existing subscribe/unsubscribe routes: auth and request-shape checks

### Subscribe route
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/api/notifications/subscribe/route.ts`
- **Lines:** 8-9, 12-15
- **Behavior:** requires authenticated Clerk user and payload shape `{ endpoint, keys: { p256dh, auth } }`.
- **Risk to verify on client side:** if client sends raw `PushSubscription` with mismatched field names/shape, route returns `400 Invalid subscription data`.
- **Required fix:** ensure client body shape exactly matches route validation contract.

### Unsubscribe route
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/api/notifications/unsubscribe/route.ts`
- **Lines:** 8-9, 11-16
- **Behavior:** requires authenticated Clerk user and JSON body containing `endpoint`.
- **Risk to verify on client side:** missing `Content-Type: application/json` or absent `endpoint` causes server-side failure/unsubscribe no-op.
- **Required fix:** ensure client sends JSON body with endpoint and authenticated session cookies.

## 7) Local development behavior that can look like “push not firing”
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/serwist/SerwistRegistrar.tsx`
- **Line:** 13
- **Issue:** `disable={process.env.NODE_ENV === "development"}` disables service worker in dev mode.
- **Why this causes confusion:** local testing in `next dev` will not register active SW push handlers.
- **Required fix:** test push on production build/runtime or add an explicit non-dev debug path for SW testing.

## 8) Build blocker currently observed in this workspace
- **File:** `/home/runner/work/VeyrFlow/VeyrFlow/babyanonymouse/VeyrFlow/app/layout.tsx`
- **Lines:** 2, 11-19
- **Issue observed during build:** `next build` fails fetching Google Fonts (`Geist`, `Geist Mono`) in this environment.
- **Why this matters for notifications:** deployment/build failure prevents updated SW/API code from shipping, making push debugging appear broken at runtime.
- **Required fix:** make font loading resilient for CI/deploy environment (or ensure network access during build).
