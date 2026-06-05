/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist, NetworkFirst, NetworkOnly, BackgroundSyncPlugin } from "serwist";

import { BackgroundSyncQueue } from "serwist";

const mutationQueue = new BackgroundSyncQueue("veyrflow-mutations", {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    await queue.replayRequests();
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: "SYNC_COMPLETE" });
    }
  },
});

const bgSyncPlugin = {
  fetchDidFail: async ({ request }: { request: Request }) => {
    // Proactively inject the Origin header for Next.js CSRF protection
    const headers = new Headers(request.headers);
    if (!headers.has("Origin") || headers.get("Origin") === "null") {
      headers.set("Origin", self.location.origin);
    }
    const safeRequest = new Request(request, { headers });
    await mutationQueue.pushRequest({ request: safeRequest });
  },
};

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
          bgSyncPlugin,
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
        matchOptions: {
          ignoreSearch: true,
        },
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "VeyrFlow";
  const body = data.body || "New notification";
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList.find((c) => "focus" in c) || clientList[0];
        if (client && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "REPLAY_MUTATIONS") {
    mutationQueue.replayRequests().then(() => {
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "SYNC_COMPLETE" });
        }
      });
    });
  }
});
