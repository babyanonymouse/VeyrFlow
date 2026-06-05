"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NetworkListener() {
  const router = useRouter();

  useEffect(() => {
    const handleOffline = () => {
      toast.warning("Offline Mode. Changes will sync later.", {
        duration: Infinity,
        id: "offline-toast",
      });
    };

    const handleOnline = () => {
      toast.dismiss("offline-toast");
      toast.success("Connection restored! Syncing data...");
      navigator.serviceWorker?.controller?.postMessage({ type: "REPLAY_MUTATIONS" });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_COMPLETE") {
        toast.success("All offline changes synced!");
        router.refresh();
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return null;
}
