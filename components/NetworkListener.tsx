"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function NetworkListener() {
  useEffect(() => {
    const handleOffline = () => {
      toast.warning("Offline Mode. Changes will sync later.", {
        duration: Infinity,
        id: "offline-toast",
      });
    };

    const handleOnline = () => {
      toast.dismiss("offline-toast");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
