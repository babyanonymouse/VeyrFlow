"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, X, Download } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone mode
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Check if dismissed previously
    const isDismissed = localStorage.getItem("veyrflow_install_prompt_dismissed") === "true";
    if (isDismissed) return;

    // 3. Detect iOS Safari/other browsers
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    if (iOS) {
      // Show instructional tip card for iOS users
      setShowPrompt(true);
      return;
    }

    // 4. Listen for native browser PWA install prompt event (Chrome/Android/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If app installed successfully, hide the prompt
    const installedHandler = () => {
      setShowPrompt(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("veyrflow_install_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-teal-500/20 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4">
      {/* VeyrFlow Dynamic Logo Graphic background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 blur-2xl rounded-full pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10 flex-1 min-w-0">
        <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
          <Download size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-zinc-100 tracking-wide">Install VeyrFlow</h3>
          {isIOS ? (
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed flex flex-wrap items-center gap-1">
              To install, tap <Share size={14} className="inline text-teal-400 mx-0.5" /> below, then select &apos;Add to Home Screen&apos; <PlusSquare size={14} className="inline text-teal-400 mx-0.5" />.
            </p>
          ) : (
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Install VeyrFlow on your home screen for a fast, tactile app experience.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10 shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-75 shadow-[0_0_15px_-3px_rgba(45,212,191,0.5)]"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer active:scale-[0.98] transition-transform duration-75"
          aria-label="Dismiss install prompt"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
