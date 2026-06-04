"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Clock, X } from "lucide-react";
import { Drawer } from "vaul";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { createHabit } from "@/lib/actions/habit.actions";

function formatTargetTime(timeStr: string) {
  if (!timeStr) return "";
  const parts = timeStr.split(":").map(Number);
  const hours = parts[0];
  const minutes = parts[1];
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) return timeStr;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}`;
}

export default function CreateHabitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [targetTime, setTargetTime] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const selectedHour = targetTime ? parseInt(targetTime.split(":")[0] ?? "9", 10) : 9;
  const selectedMinute = targetTime ? parseInt(targetTime.split(":")[1] ?? "0", 10) : 0;

  function handleHourSelect(hour: number) {
    const minStr = String(selectedMinute).padStart(2, "0");
    const hourStr = String(hour).padStart(2, "0");
    setTargetTime(`${hourStr}:${minStr}`);
  }

  function handleMinuteSelect(minute: number) {
    const hourStr = String(selectedHour).padStart(2, "0");
    const minStr = String(minute).padStart(2, "0");
    setTargetTime(`${hourStr}:${minStr}`);
  }

  async function actionCreate(formData: FormData) {
    setIsLoading(true);
    setError("");

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetTime: formData.get("targetTime") as string,
    };

    try {
      await createHabit(data);
      setIsOpen(false);
      setTargetTime(""); // Reset selected time
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create habit";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] transition-transform duration-75 cursor-pointer"
      >
        <Plus size={16} />
        New Habit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold text-white mb-4">Create New Habit</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form action={actionCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={100}
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Drink 2L water"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              maxLength={500}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="Why this habit matters..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Target Time (Optional)
            </label>
            <input type="hidden" name="targetTime" value={targetTime} />

            {!isMounted ? (
              <button
                type="button"
                disabled
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white opacity-60 flex items-center justify-between cursor-not-allowed"
              >
                <span>Set target time</span>
                <Clock size={16} className="text-zinc-500" />
              </button>
            ) : isMobile ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-4 pr-16 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors flex items-center justify-between text-left cursor-pointer"
                >
                  <span>{targetTime ? formatTargetTime(targetTime) : "Set target time"}</span>
                </button>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {targetTime && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetTime("");
                      }}
                      className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                      aria-label="Clear time"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <Clock size={16} className="text-zinc-500 pointer-events-none" />
                </div>
              </div>
            ) : (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <div className="relative">
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-4 pr-16 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <span>{targetTime ? formatTargetTime(targetTime) : "Set target time"}</span>
                    </button>
                  </PopoverTrigger>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {targetTime && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetTime("");
                        }}
                        className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        aria-label="Clear time"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <Clock size={16} className="text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <PopoverContent className="w-[320px] p-4 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl" align="start">
                  <TimePickerContent
                    selectedHour={selectedHour}
                    selectedMinute={selectedMinute}
                    handleHourSelect={handleHourSelect}
                    handleMinuteSelect={handleMinuteSelect}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTargetTime("");
              }}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors active:scale-[0.98] transition-transform duration-75 cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 active:scale-[0.98] transition-transform duration-75 cursor-pointer"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Create Habit
            </button>
          </div>
        </form>
      </div>

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-70 bg-black/60" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-80 rounded-t-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <Drawer.Title className="sr-only">Set Target Time</Drawer.Title>
            <Drawer.Description className="sr-only">Choose a target time for the habit</Drawer.Description>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
            <TimePickerContent
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              handleHourSelect={handleHourSelect}
              handleMinuteSelect={handleMinuteSelect}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function TimePickerContent({
  selectedHour,
  selectedMinute,
  handleHourSelect,
  handleMinuteSelect,
}: {
  selectedHour: number;
  selectedMinute: number;
  handleHourSelect: (hour: number) => void;
  handleMinuteSelect: (minute: number) => void;
}) {
  const hourContainerRef = useRef<HTMLDivElement>(null);
  const minuteContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected hour and minute into view immediately
    const hourEl = hourContainerRef.current?.querySelector(`#hour-opt-${selectedHour}`);
    if (hourEl) {
      hourEl.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
    const minuteEl = minuteContainerRef.current?.querySelector(`#minute-opt-${selectedMinute}`);
    if (minuteEl) {
      minuteEl.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [selectedHour, selectedMinute]);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        {/* Hours Column */}
        <div>
          <div className="text-center text-xs font-semibold text-zinc-500 mb-2">Hour</div>
          <div
            ref={hourContainerRef}
            className="h-44 overflow-y-auto scrollbar-none flex flex-col gap-1.5 pr-1"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const isSelected = selectedHour === i;
              return (
                <button
                  key={i}
                  id={`hour-opt-${i}`}
                  type="button"
                  onClick={() => handleHourSelect(i)}
                  className={`h-11 w-full flex items-center justify-center text-sm rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  {String(i).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minutes Column */}
        <div>
          <div className="text-center text-xs font-semibold text-zinc-500 mb-2">Minute</div>
          <div
            ref={minuteContainerRef}
            className="h-44 overflow-y-auto scrollbar-none flex flex-col gap-1.5 pr-1"
          >
            {Array.from({ length: 60 }).map((_, i) => {
              const isSelected = selectedMinute === i;
              return (
                <button
                  key={i}
                  id={`minute-opt-${i}`}
                  type="button"
                  onClick={() => handleMinuteSelect(i)}
                  className={`h-11 w-full flex items-center justify-center text-sm rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  {String(i).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
