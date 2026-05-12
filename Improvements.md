I need to convert it into a PWA to improve the "dogfooding" experience on mobile.

> **Objective:** Implement a PWA configuration using @serwist/next (the modern successor to next-pwa).
> **Requirements:**
>
> 1.  **Manifest:** Generate a manifest.json in /public with:
>
> - display: "standalone"
> - theme_color: "#09090b" (Zinc-950)
> - start_url: "/dashboard"
>
> 2.  **Metadata:** Update the root layout.tsx to include required PWA metadata (apple-touch-icon, viewport settings, and theme color).
> 3.  **Configuration:** Set up @serwist/next in next.config.mjs to handle basic asset caching.
> 4.  **Service Worker:** Create a standard app/sw.ts entry point for the service worker.
>     **Strict Constraints:**
>
> - **DO NOT** touch Clerk authentication logic or providers.
> - **DO NOT** modify the Doppler environment variable injection process.
> - **DO NOT** implement complex offline-first database syncing (keep it "Zero-Drag").
> - **DO NOT** change the existing Tailwind CSS glassmorphism styling.
> - **Focus:** Only on the plumbing required to make the app "Installable" on iOS and Android.

## 📊 Systems Check Before You Run

| Component           | Responsibility                                                                 | Status              |
| ------------------- | ------------------------------------------------------------------------------ | ------------------- |
| **Icons**           | You need icon-192x192.png and icon-512x512.png in /public.                     | **Pending**         |
| **next.config.mjs** | Copilot might try to rewrite this; ensure it merges with your existing config. | **Review Required** |
| **iOS Handling**    | PWAs on iOS require apple-touch-icon. Ensure Copilot includes this.            | **Critical**        |
