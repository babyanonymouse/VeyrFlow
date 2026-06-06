"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PushNotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (loading) return;
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Successfully unsubscribed from push notifications.");
      } else {
        await subscribe();
        toast.success("Successfully subscribed to push notifications!");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred updating subscription.");
    }
  };

  if (!isSupported) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <BellOff size={18} className="text-red-400" />
          Push Notifications
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Push notifications are not supported on this browser or device. Ensure you are using a compatible browser like Chrome, Firefox, or Safari, and that your connection is secure (HTTPS).
        </p>
      </section>
    );
  }

  const isBlocked = permission === "denied";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-6 relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Bell size={18} className="text-teal-400" />
            Push Notifications
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Receive reminders and smart summaries of your habits directly on your device.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={loading || isBlocked}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
            isSubscribed ? "bg-teal-500" : "bg-zinc-800"
          } ${loading || isBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Toggle push notifications"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isSubscribed ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {loading && <Loader2 size={12} className="text-zinc-600 animate-spin" />}
          </span>
        </button>
      </div>

      <div className="space-y-2">
        {isBlocked && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
            <strong>Permission Blocked:</strong> Push notifications are blocked by your browser settings. Please reset the notification permission for this site in your browser to enable alerts.
          </div>
        )}

        {!isBlocked && isSubscribed && (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-xs text-teal-300">
            <strong>Subscribed:</strong> Your device is registered to receive system updates and reminders.
          </div>
        )}

        {!isBlocked && !isSubscribed && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 text-xs text-zinc-400">
            Notifications are currently disabled. Toggle the switch above to subscribe.
          </div>
        )}
      </div>
    </section>
  );
}
