"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import * as chrono from "chrono-node";
import { format, isToday, isTomorrow } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Drawer } from "vaul";
import { z } from "zod";
import { taskFormSchema, type TaskFormInput } from "@/lib/validators/task";
import { toLocalDateTimeInputValue } from "@/lib/utils/task-deadline";

export type TaskModalValues = TaskFormInput;

export type TaskModalValuesWithDefaults = Required<
  Pick<TaskModalValues, "title" | "description" | "priority" | "deadline" | "privacyMode">
>;

export default function TaskModal({
  busy,
  initialValues,
  onClose,
  onSubmit,
}: {
  busy?: boolean;
  initialValues?: TaskModalValuesWithDefaults;
  onClose: () => void;
  onSubmit: (values: TaskModalValues) => void;
}) {
  const defaults = useMemo<TaskModalValuesWithDefaults>(
    () =>
      initialValues ?? {
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        privacyMode: false,
      },
    [initialValues]
  );

  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [priority, setPriority] = useState<TaskModalValuesWithDefaults["priority"]>(
    defaults.priority
  );
  const [deadline, setDeadline] = useState(defaults.deadline);
  const [privacyMode, setPrivacyMode] = useState(defaults.privacyMode);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [parsedDateText, setParsedDateText] = useState<string | null>(null);
  const [ignoredMatches, setIgnoredMatches] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedDate = useMemo(() => {
    if (!deadline) return undefined;
    return new Date(deadline);
  }, [deadline]);

  const deadlinePillLabel = useMemo(() => {
    if (!selectedDate) return "";
    const dateLabel = isToday(selectedDate)
      ? "Today"
      : isTomorrow(selectedDate)
        ? "Tomorrow"
        : format(selectedDate, "EEE, d MMM");
    return `${dateLabel}, ${format(selectedDate, "HH:mm")}`;
  }, [selectedDate]);

  const timeValue = useMemo(() => {
    if (!selectedDate) return "09:00";
    return format(selectedDate, "HH:mm");
  }, [selectedDate]);

  const selectedHour = useMemo(() => {
    if (!selectedDate) return 9;
    return selectedDate.getHours();
  }, [selectedDate]);

  const selectedMinute = useMemo(() => {
    if (!selectedDate) return 0;
    return selectedDate.getMinutes();
  }, [selectedDate]);

  function handleHourSelect(hour: number) {
    const next = selectedDate ? new Date(selectedDate) : new Date();
    next.setHours(hour, selectedMinute, 0, 0);
    setDeadline(toLocalDateTimeInputValue(next));
    setParsedDateText(null);
  }

  function handleMinuteSelect(minute: number) {
    const next = selectedDate ? new Date(selectedDate) : new Date();
    next.setHours(selectedHour, minute, 0, 0);
    setDeadline(toLocalDateTimeInputValue(next));
    setParsedDateText(null);
  }

  function applyDate(nextDate: Date, closeDrawer = false) {
    const base = new Date(nextDate);
    const current = selectedDate ?? new Date();
    base.setHours(current.getHours(), current.getMinutes(), 0, 0);
    setDeadline(toLocalDateTimeInputValue(base));
    setParsedDateText(null);
    if (closeDrawer) {
      setDrawerOpen(false);
      setPopoverOpen(false);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);

    // Keep ignoredMatches up-to-date: remove phrases that are no longer in the input
    const cleanIgnored = ignoredMatches.filter((phrase) =>
      nextTitle.toLowerCase().includes(phrase.toLowerCase())
    );
    if (cleanIgnored.length !== ignoredMatches.length) {
      setIgnoredMatches(cleanIgnored);
    }

    const parsed = chrono.parse(nextTitle, new Date(), { forwardDate: true });
    
    // Find the first match that isn't ignored
    const activeMatch = parsed.find((match) => {
      const matchText = match.text.trim().toLowerCase();
      return !cleanIgnored.some((ignored) => ignored.toLowerCase() === matchText);
    });

    if (!activeMatch) {
      if (parsedDateText) {
        setDeadline("");
        setParsedDateText(null);
      }
      return;
    }

    const matchText = activeMatch.text.trim();
    if (parsedDateText !== matchText) {
      setDeadline(toLocalDateTimeInputValue(activeMatch.start.date()));
      setParsedDateText(matchText);
    }
    setErrors((prev) => ({ ...prev, title: "" }));
  }

  function clearParsedDate() {
    if (!parsedDateText) return;
    setIgnoredMatches((prev) => [...prev, parsedDateText]);
    setDeadline("");
    setParsedDateText(null);
  }

  function validate(): TaskModalValues | null {
    const payload = {
      title,
      description,
      priority,
      privacyMode,
      deadline,
    };

    const result = taskFormSchema.safeParse(payload);
    if (result.success) {
      setErrors({});
      return {
        title: result.data.title,
        description: result.data.description ?? "",
        priority: result.data.priority,
        privacyMode: result.data.privacyMode,
        deadline: result.data.deadline,
      };
    }

    const fieldErrors: Record<string, string> = {};
    if (result.error instanceof z.ZodError) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return null;
  }

  function submit() {
    const parsed = validate();
    if (!parsed) return;

    onSubmit({
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      privacyMode: parsed.privacyMode,
      deadline: parsed.deadline,
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-zinc-100">
              {initialValues ? "Edit task" : "Create task"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Description is optional (max 500 characters).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-800 bg-zinc-950 p-2 text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Title
            </label>
            <div className="relative mt-1 flex items-center">
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full rounded-md border border-zinc-800 bg-zinc-950 pl-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 ${
                  deadline && parsedDateText ? "pr-40" : "pr-3"
                }`}
                placeholder="e.g. Implement task CRUD"
                maxLength={100}
                autoFocus
              />
              {deadline && parsedDateText ? (
                <div className="absolute right-2 flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/20 pr-1 text-xs font-medium text-indigo-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (isMobile) {
                        setDrawerOpen(true);
                      } else {
                        setPopoverOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors hover:bg-indigo-500/20 rounded-l-full cursor-pointer"
                  >
                    <CalendarDays size={12} />
                    <span>{deadlinePillLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearParsedDate}
                    className="rounded-full p-0.5 transition-colors hover:bg-indigo-500/40"
                    aria-label="Remove parsed date"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}
            </div>
            {errors.title ? (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-zinc-200">
                Description
              </label>
              <span className="text-xs text-zinc-500">
                {description.length}/500
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-24 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="Optional details (max 500 chars)"
              maxLength={500}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-400">{errors.description}</p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-200">
                Priority
              </label>
              <select
              title="Priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskModalValuesWithDefaults["priority"])
                }
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-200">
                Deadline
              </label>
              {!isMounted ? (
                <button
                  type="button"
                  disabled
                  className="mt-1 inline-flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 opacity-60 cursor-not-allowed"
                >
                  <span>{deadline ? deadlinePillLabel : "Set deadline"}</span>
                  <CalendarDays size={16} />
                </button>
              ) : isMobile ? (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mt-1 inline-flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors hover:bg-zinc-900 cursor-pointer"
                >
                  <span>{deadline ? deadlinePillLabel : "Set deadline"}</span>
                  <CalendarDays size={16} />
                </button>
              ) : (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 inline-flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors hover:bg-zinc-900 cursor-pointer"
                    >
                      <span>{deadline ? deadlinePillLabel : "Set deadline"}</span>
                      <CalendarDays size={16} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[320px] p-4 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl max-h-[calc(var(--radix-popover-content-available-height)_-_24px)] overflow-y-auto scrollbar-thin"
                    align="start"
                    side="bottom"
                    collisionPadding={12}
                  >
                    <DatePickerContent
                      selectedDate={selectedDate}
                      timeValue={timeValue}
                      selectedHour={selectedHour}
                      selectedMinute={selectedMinute}
                      applyDate={applyDate}
                      handleHourSelect={handleHourSelect}
                      handleMinuteSelect={handleMinuteSelect}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
            />
            Privacy mode (exclude from AI context)
          </label>

          {errors.form ? (
            <p className="text-xs text-red-400">{errors.form}</p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-75"
          >
            {initialValues ? "Save" : "Create"}
          </button>
        </div>
      </div>

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-70 bg-black/60" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-80 rounded-t-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <Drawer.Title className="sr-only">Set Deadline</Drawer.Title>
            <Drawer.Description className="sr-only">Choose a date and time preset for the task</Drawer.Description>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
            <DatePickerContent
              selectedDate={selectedDate}
              timeValue={timeValue}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              applyDate={applyDate}
              handleHourSelect={handleHourSelect}
              handleMinuteSelect={handleMinuteSelect}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function DatePickerContent({
  selectedDate,
  selectedHour,
  selectedMinute,
  applyDate,
  handleHourSelect,
  handleMinuteSelect,
}: {
  selectedDate: Date | undefined;
  timeValue: string;
  selectedHour: number;
  selectedMinute: number;
  applyDate: (nextDate: Date, closeDrawer?: boolean) => void;
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
    <div className="flex flex-col gap-4">
      {/* Calendar Component */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            applyDate(date);
          }}
          className="rounded-xl border border-zinc-800/70 bg-zinc-950/50"
        />
      </div>

      {/* Horizontal Separator */}
      <hr className="border-border" />

      {/* Time Picker */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-400">Time</label>
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 h-[200px]">
          {/* Hours Column */}
          <div className="flex-1 text-center p-1 flex flex-col h-full min-h-0">
            <div className="text-xs font-semibold text-zinc-500 mb-2">Hour</div>
            <div
              ref={hourContainerRef}
              className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-1"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const isSelected = selectedHour === i;
                return (
                  <button
                    key={i}
                    id={`hour-opt-${i}`}
                    type="button"
                    onClick={() => handleHourSelect(i)}
                    className={`h-8 w-full flex items-center justify-center text-center text-sm rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/20 text-indigo-300 font-medium rounded-md"
                        : "text-zinc-400 hover:bg-zinc-800/50"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutes Column */}
          <div className="flex-1 text-center p-1 flex flex-col h-full min-h-0">
            <div className="text-xs font-semibold text-zinc-500 mb-2">Minute</div>
            <div
              ref={minuteContainerRef}
              className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-1"
            >
              {Array.from({ length: 60 }).map((_, i) => {
                const isSelected = selectedMinute === i;
                return (
                  <button
                    key={i}
                    id={`minute-opt-${i}`}
                    type="button"
                    onClick={() => handleMinuteSelect(i)}
                    className={`h-8 w-full flex items-center justify-center text-center text-sm rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/20 text-indigo-300 font-medium rounded-md"
                        : "text-zinc-400 hover:bg-zinc-800/50"
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
    </div>
  );
}
