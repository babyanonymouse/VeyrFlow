import { useState, useEffect, useCallback } from "react";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/webPush";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error("Error checking push subscription status:", err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setPermission(Notification.permission);
    } catch (err: any) {
      setError(err.message || "Failed to subscribe.");
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
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe.");
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
