import { useState, useEffect } from "react";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/webPush";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function check() {
      if (typeof window === "undefined") return;

      const isDev = process.env.NODE_ENV === "development";
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      let subscribed = false;
      let perm: NotificationPermission = "default";

      // If in development, the Service Worker is disabled by default in SerwistRegistrar.tsx
      // We skip awaiting the ready promise to prevent hanging the hook in loading state.
      if (supported && !isDev) {
        perm = Notification.permission;
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          subscribed = !!subscription;
        } catch (err) {
          console.error("Error checking push subscription status:", err);
        }
      }

      if (active) {
        // We set supported to false in dev to show the disabled/unsupported state gracefully
        setIsSupported(supported && !isDev);
        setPermission(perm);
        setIsSubscribed(subscribed);
        setLoading(false);
      }
    }

    check();

    return () => {
      active = false;
    };
  }, []);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setPermission(Notification.permission);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to subscribe.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unsubscribe.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
}
