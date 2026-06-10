/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist, NetworkFirst, NetworkOnly, BackgroundSyncPlugin } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: Array<
      string | { url: string; revision?: string | null; integrity?: string }
    >;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => ["POST", "PUT", "DELETE"].includes(request.method),
      handler: new NetworkOnly({
        plugins: [
          new BackgroundSyncPlugin("veyrflow-mutations", {
            maxRetentionTime: 24 * 60, // 24 hours in minutes
          }),
          {
            handlerDidError: async ({ request }) => {
              // Invisibly swallow the network error and return a mock successful response
              // so the application's optimistic UI doesn't crash with "Failed to fetch".
              if (request.headers.has("next-action") || request.headers.has("Next-Action")) {
                return new Response(
                  `0:["$@1",["action-result",{"data":null}]]\n`,
                  {
                    status: 200,
                    headers: { "Content-Type": "text/x-component" },
                  }
                );
              }
              return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            },
          },
        ],
      }),
    },
    {
      matcher: ({ request, url }) => {
        const isDocument = request.destination === "document";
        const isRSC = request.headers.get("RSC") === "1" || request.headers.get("rsc") === "1";
        const isNextData = url.pathname.startsWith("/_next/data/");
        return isDocument || isRSC || isNextData;
      },
      handler: new NetworkFirst({
        cacheName: "veyrflow-read-cache",
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  let data: { title?: string; body?: string; url?: string } = {};

  // FIX 2: Defensive parsing (prevent .json() crash)
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.warn("Failed to parse push payload as JSON, falling back to default notification", err);
    let fallbackBody = "You have a new reminder.";
    if (event.data) {
      try {
        fallbackBody = event.data.text() || fallbackBody;
      } catch (_textErr) {}
    }
    // Fallback if payload is just a raw string
    data = {
      title: "VeyrFlow",
      body: fallbackBody,
    };
  }

  const title = data.title || "VeyrFlow";
  const body = data.body || "Check your habits!";
  // FIX 3: Extract deep link URL from payload
  const url = data.url || "/";

  // FIX 1: Ensure icons match the actual manifest assets.
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon1",
      badge: "/icon1",
      data: { url }, // Pass URL to the click handler
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // FIX 3: Respect the deep link URL
  const targetUrl = event.notification.data?.url || "/";
  let safeTargetUrl = new URL("/", self.location.origin).href;
  try {
    const candidateUrl = new URL(targetUrl, self.location.origin);
    if (
      (candidateUrl.protocol === "http:" || candidateUrl.protocol === "https:") &&
      candidateUrl.origin === self.location.origin
    ) {
      safeTargetUrl = candidateUrl.href;
    }
  } catch (_err) {
    console.warn("Invalid notification URL, using default:", targetUrl);
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if the app is already open to the target URL
      for (const client of clientList) {
        if (client.url === safeTargetUrl && "focus" in client) {
          return client.focus();
        }
      }
      // If not open, launch a new window to the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(safeTargetUrl);
      }
    })
  );
});
