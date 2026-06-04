"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Clock, X, Keyboard, Check, ChevronDown } from "lucide-react";
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
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
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
                  onClick={() => setIsTimeDialogOpen(true)}
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
                <PopoverContent className="w-auto p-4 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl" align="start">
                  <MaterialTimePicker
                    selectedHour={selectedHour}
                    selectedMinute={selectedMinute}
                    onHourSelect={handleHourSelect}
                    onMinuteSelect={handleMinuteSelect}
                    showActions={false}
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

      {/* Material Time Picker Dialog Overlay */}
      {isTimeDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsTimeDialogOpen(false)}
          />
          <div className="relative w-[280px] bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl z-[70]">
            <MaterialTimePicker
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onHourSelect={handleHourSelect}
              onMinuteSelect={handleMinuteSelect}
              showActions={true}
              onCancel={() => setIsTimeDialogOpen(false)}
              onOk={() => setIsTimeDialogOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialTimePicker({
  selectedHour,
  selectedMinute,
  onHourSelect,
  onMinuteSelect,
  showActions,
  onCancel,
  onOk,
}: {
  selectedHour: number;
  selectedMinute: number;
  onHourSelect: (hour: number) => void;
  onMinuteSelect: (minute: number) => void;
  showActions: boolean;
  onCancel?: () => void;
  onOk?: () => void;
}) {
  const [selectionMode, setSelectionMode] = useState<"hours" | "minutes">("hours");
  const [isManualInput, setIsManualInput] = useState(false);

  // Convert 24h to 12h format
  const isPm = selectedHour >= 12;
  const displayHour = selectedHour % 12 === 0 ? 12 : selectedHour % 12;
  const amPm = isPm ? "PM" : "AM";

  const displayMinuteStr = String(selectedMinute).padStart(2, "0");
  const displayHourStr = String(displayHour).padStart(2, "0");

  function handleAmPmChange(target: "AM" | "PM") {
    if (target === "AM" && isPm) {
      onHourSelect(selectedHour - 12);
    } else if (target === "PM" && !isPm) {
      onHourSelect(selectedHour + 12);
    }
  }

  function handleHourClick(hour12: number) {
    let nextHour24 = hour12;
    if (isPm) {
      nextHour24 = hour12 === 12 ? 12 : hour12 + 12;
    } else {
      nextHour24 = hour12 === 12 ? 0 : hour12;
    }
    onHourSelect(nextHour24);
    setSelectionMode("minutes");
  }

  function handleMinuteClick(minute: number) {
    onMinuteSelect(minute);
  }

  // Temporary state for manual input typing
  const [typedHour, setTypedHour] = useState(displayHourStr);
  const [typedMinute, setTypedMinute] = useState(displayMinuteStr);

  useEffect(() => {
    if (!isManualInput) {
      setTypedHour(displayHourStr);
      setTypedMinute(displayMinuteStr);
    }
  }, [selectedHour, selectedMinute, isManualInput, displayHourStr, displayMinuteStr]);

  function handleManualSubmit() {
    let hh = parseInt(typedHour, 10);
    let mm = parseInt(typedMinute, 10);
    if (isNaN(hh)) hh = displayHour;
    if (isNaN(mm)) mm = selectedMinute;

    hh = Math.max(1, Math.min(12, hh));
    mm = Math.max(0, Math.min(59, mm));

    let hour24 = hh;
    if (isPm) {
      hour24 = hh === 12 ? 12 : hh + 12;
    } else {
      hour24 = hh === 12 ? 0 : hh;
    }

    onHourSelect(hour24);
    onMinuteSelect(mm);
    setIsManualInput(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* digital readout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center text-5xl font-light tracking-tight">
          <span
            onClick={() => {
              setIsManualInput(false);
              setSelectionMode("hours");
            }}
            className={`cursor-pointer transition-colors select-none ${
              selectionMode === "hours" && !isManualInput
                ? "text-indigo-400 font-medium"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            {displayHourStr}
          </span>
          <span className="text-zinc-650 mx-1.5 select-none">:</span>
          <span
            onClick={() => {
              setIsManualInput(false);
              setSelectionMode("minutes");
            }}
            className={`cursor-pointer transition-colors select-none ${
              selectionMode === "minutes" && !isManualInput
                ? "text-indigo-400 font-medium"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            {displayMinuteStr}
          </span>
        </div>

        {/* AM/PM toggle */}
        <div className="flex flex-col text-xs font-semibold gap-1 select-none">
          <button
            type="button"
            onClick={() => handleAmPmChange("AM")}
            className={`transition-colors cursor-pointer ${
              amPm === "AM" ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handleAmPmChange("PM")}
            className={`transition-colors cursor-pointer ${
              amPm === "PM" ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* selection grid or manual input */}
      <div className="w-full flex items-center justify-center min-h-[190px]">
        {isManualInput ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={2}
                value={typedHour}
                onChange={(e) => setTypedHour(e.target.value.replace(/\D/g, ""))}
                placeholder="HH"
                className="w-14 h-12 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-lg text-zinc-100 outline-none focus:border-indigo-500/50"
              />
              <span className="text-zinc-500 font-bold">:</span>
              <input
                type="text"
                maxLength={2}
                value={typedMinute}
                onChange={(e) => setTypedMinute(e.target.value.replace(/\D/g, ""))}
                placeholder="MM"
                className="w-14 h-12 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-lg text-zinc-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <button
              type="button"
              onClick={handleManualSubmit}
              className="px-3 py-1 text-xs font-medium text-indigo-400 hover:bg-zinc-800 rounded-md border border-zinc-800 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        ) : selectionMode === "hours" ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
              const isActive = displayHour === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourClick(h)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-500 text-white font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
              const isActive = selectedMinute === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteClick(m)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-500 text-white font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {String(m).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="w-full flex items-center justify-between border-t border-zinc-800/60 pt-3.5 mt-2 select-none">
        <button
          type="button"
          onClick={() => setIsManualInput(!isManualInput)}
          className="text-zinc-400 hover:text-zinc-200 rounded-md p-1 cursor-pointer transition-colors"
          aria-label="Toggle keyboard"
        >
          <Keyboard size={16} />
        </button>

        {showActions && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onOk}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
