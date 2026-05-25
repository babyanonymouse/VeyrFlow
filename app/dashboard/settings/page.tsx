"use client";

import { useEffect, useState } from "react";
import { Shield, Sparkles, Monitor, ArrowUpFromLine, Download, CheckCircle2, Sliders } from "lucide-react";

export default function SettingsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect standalone PWA mode
    const isPwa = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPwa);

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(ua) && !(/crios|fxios|opios|ucbrowser/.test(ua));
    setIsIOS(isIphoneOrIpad);

    // 3. Listen for browser install prompt (Android/Chrome/Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your preferences, security modes, and device installations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: App Settings & Privacy */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Shield size={18} className="text-indigo-400" />
            Privacy & Guardrails
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Zero-Leak Privacy Mode</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                Tasks created with Privacy Mode checked are permanently excluded from LLM parsing pools. Calculations and caching occur strictly in-memory.
              </p>
            </div>

            <div className="border-t border-zinc-800/60 pt-4">
              <h3 className="text-sm font-semibold text-zinc-200">Free-Tier Gemini Caching</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                To stay within Google Gemini's limits, suggestions are cached directly inside the MongoDB schema and refresh on a 24-hour cycle.
              </p>
            </div>
          </div>
        </section>

        {/* Card 2: Device Integration & PWA */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Monitor size={18} className="text-emerald-400" />
            Device Installation
          </h2>

          {/* Standalone PWA already installed */}
          {isStandalone ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">PWA Running</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  HabitFlow is running as an installed standalone app. Background assets are managed automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Programmatic trigger for Android/Chrome/Windows */}
              {isInstallable && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 flex flex-col items-center text-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-200">Install HabitFlow App</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Add HabitFlow to your desktop or home screen for quick launch and offline performance.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 rounded-xl bg-white text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    Install App
                  </button>
                </div>
              )}

              {/* Static Instruction Box for iOS Safari */}
              {isIOS && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                    <ArrowUpFromLine size={16} className="text-indigo-400" />
                    Install on iOS Safari
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Add HabitFlow to your home screen to experience it as a native standalone PWA:
                  </p>
                  <ol className="mt-3 space-y-1.5 text-xs text-zinc-300 list-decimal list-inside">
                    <li>Tap the <span className="font-semibold text-white">Share</span> button at the bottom of Safari.</li>
                    <li>Scroll down and select <span className="font-semibold text-white">"Add to Home Screen"</span>.</li>
                    <li>Tap <span className="font-semibold text-indigo-400">Add</span> in the top-right corner.</li>
                  </ol>
                </div>
              )}

              {/* Standard status message if not on Safari and not installable */}
              {!isInstallable && !isIOS && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 text-center">
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Browser installation is not available. To install, ensure you are using Google Chrome or Microsoft Edge on an compatible OS.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
