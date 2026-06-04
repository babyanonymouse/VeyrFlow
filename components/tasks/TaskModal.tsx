"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import * as chrono from "chrono-node";
import { format, addDays, addWeeks, startOfWeek, isToday, isTomorrow } from "date-fns";
import { CalendarDays, X, Calendar as CalendarIcon, Sunrise, Sparkles, CalendarRange, Check, Clock, ChevronDown, Keyboard } from "lucide-react";
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
    base.setHours(0, 0, 0, 0);
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
                    className="w-auto p-4 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl max-h-[calc(var(--radix-popover-content-available-height)_-_24px)] overflow-y-auto scrollbar-thin"
                    align="start"
                    side="bottom"
                    collisionPadding={12}
                  >
                    <DesktopDatePickerContent
                      selectedDate={selectedDate}
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
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-80 rounded-t-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin">
            <Drawer.Title className="sr-only">Set Deadline</Drawer.Title>
            <Drawer.Description className="sr-only">Choose a date and time preset for the task</Drawer.Description>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
            <MobileDatePickerContent
              selectedDate={selectedDate}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              applyDate={applyDate}
              handleHourSelect={handleHourSelect}
              handleMinuteSelect={handleMinuteSelect}
              setDrawerOpen={setDrawerOpen}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function DesktopDatePickerContent({
  selectedDate,
  selectedHour,
  selectedMinute,
  applyDate,
  handleHourSelect,
  handleMinuteSelect,
}: {
  selectedDate: Date | undefined;
  selectedHour: number;
  selectedMinute: number;
  applyDate: (nextDate: Date, closeDrawer?: boolean) => void;
  handleHourSelect: (hour: number) => void;
  handleMinuteSelect: (minute: number) => void;
}) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(selectedDate ?? new Date());

  useEffect(() => {
    if (selectedDate) {
      setCalendarMonth(selectedDate);
    }
  }, [selectedDate]);

  const todayDate = new Date();
  const tomorrowDate = addDays(new Date(), 1);
  const weekendDate = (() => {
    const today = new Date();
    const day = today.getDay();
    const daysUntilSaturday = day === 6 || day === 0 ? 0 : 6 - day;
    return addDays(today, daysUntilSaturday);
  })();
  const nextWeekDate = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });

  const isTodayActive = selectedDate && selectedDate.toDateString() === todayDate.toDateString();
  const isTomorrowActive = selectedDate && selectedDate.toDateString() === tomorrowDate.toDateString();
  const isWeekendActive = selectedDate && selectedDate.toDateString() === weekendDate.toDateString();
  const isNextWeekActive = selectedDate && selectedDate.toDateString() === nextWeekDate.toDateString();

  const getPresetClass = (isActive: boolean | undefined) =>
    `rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-[0.98] cursor-pointer ${
      isActive
        ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-400 font-semibold"
        : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
    }`;

  return (
    <div className="flex flex-row gap-4 items-stretch">
      {/* Left Column: Presets + Calendar */}
      <div className="flex flex-col gap-3">
        {/* Presets Row */}
        <div className="flex gap-1.5 justify-between">
          <button
            type="button"
            onClick={() => {
              applyDate(todayDate, false);
              setCalendarMonth(todayDate);
            }}
            className={getPresetClass(isTodayActive)}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              applyDate(tomorrowDate, false);
              setCalendarMonth(tomorrowDate);
            }}
            className={getPresetClass(isTomorrowActive)}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => {
              applyDate(weekendDate, false);
              setCalendarMonth(weekendDate);
            }}
            className={getPresetClass(isWeekendActive)}
          >
            Weekend
          </button>
          <button
            type="button"
            onClick={() => {
              applyDate(nextWeekDate, false);
              setCalendarMonth(nextWeekDate);
            }}
            className={getPresetClass(isNextWeekActive)}
          >
            Next Week
          </button>
        </div>

        {/* Calendar */}
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(new Date(selectedDate).setHours(0, 0, 0, 0)) : undefined}
          onSelect={(date) => {
            if (!date) return;
            applyDate(date, false);
            setCalendarMonth(date);
          }}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-2"
        />
      </div>

      {/* Separator */}
      <div className="w-[1px] bg-zinc-800 self-stretch" />

      {/* Right Column: Material Time Picker */}
      <div className="flex flex-col w-[200px] h-[280px] justify-between">
        <MaterialTimePicker
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          onHourSelect={handleHourSelect}
          onMinuteSelect={handleMinuteSelect}
          showActions={false}
        />
      </div>
    </div>
  );
}

function MobileDatePickerContent({
  selectedDate,
  selectedHour,
  selectedMinute,
  applyDate,
  handleHourSelect,
  handleMinuteSelect,
  setDrawerOpen,
}: {
  selectedDate: Date | undefined;
  selectedHour: number;
  selectedMinute: number;
  applyDate: (nextDate: Date, closeDrawer?: boolean) => void;
  handleHourSelect: (hour: number) => void;
  handleMinuteSelect: (minute: number) => void;
  setDrawerOpen: (open: boolean) => void;
}) {
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(selectedDate ?? new Date());

  useEffect(() => {
    if (selectedDate) {
      setCalendarMonth(selectedDate);
    }
  }, [selectedDate]);

  const todayDate = new Date();
  const tomorrowDate = addDays(new Date(), 1);
  const weekendDate = (() => {
    const today = new Date();
    const day = today.getDay();
    const daysUntilSaturday = day === 6 || day === 0 ? 0 : 6 - day;
    return addDays(today, daysUntilSaturday);
  })();
  const nextWeekDate = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });

  const isTodayActive = selectedDate && selectedDate.toDateString() === todayDate.toDateString();
  const isTomorrowActive = selectedDate && selectedDate.toDateString() === tomorrowDate.toDateString();
  const isWeekendActive = selectedDate && selectedDate.toDateString() === weekendDate.toDateString();
  const isNextWeekActive = selectedDate && selectedDate.toDateString() === nextWeekDate.toDateString();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <span className="text-sm font-semibold text-zinc-200">Date</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="rounded-md p-1.5 text-indigo-400 hover:bg-zinc-900 transition-colors cursor-pointer"
          aria-label="Save"
        >
          <Check size={18} />
        </button>
      </div>

      {/* Section 1: Presets */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            applyDate(todayDate, false);
            setCalendarMonth(todayDate);
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-900/30 transition-colors cursor-pointer"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
            isTodayActive
              ? "border-indigo-500 bg-indigo-650 bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/25"
          }`}>
            <CalendarIcon size={20} />
          </div>
          <span className={`mt-1.5 text-xs transition-colors font-medium ${isTodayActive ? "text-indigo-400" : "text-zinc-400"}`}>Today</span>
        </button>
        <button
          type="button"
          onClick={() => {
            applyDate(tomorrowDate, false);
            setCalendarMonth(tomorrowDate);
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-900/30 transition-colors cursor-pointer"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
            isTomorrowActive
              ? "border-indigo-500 bg-indigo-650 bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/25"
          }`}>
            <Sunrise size={20} />
          </div>
          <span className={`mt-1.5 text-xs transition-colors font-medium ${isTomorrowActive ? "text-indigo-400" : "text-zinc-400"}`}>Tomorrow</span>
        </button>
        <button
          type="button"
          onClick={() => {
            applyDate(weekendDate, false);
            setCalendarMonth(weekendDate);
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-900/30 transition-colors cursor-pointer"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
            isWeekendActive
              ? "border-indigo-500 bg-indigo-650 bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/25"
          }`}>
            <Sparkles size={20} />
          </div>
          <span className={`mt-1.5 text-xs transition-colors font-medium ${isWeekendActive ? "text-indigo-400" : "text-zinc-400"}`}>Weekend</span>
        </button>
        <button
          type="button"
          onClick={() => {
            applyDate(nextWeekDate, false);
            setCalendarMonth(nextWeekDate);
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-900/30 transition-colors cursor-pointer"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
            isNextWeekActive
              ? "border-indigo-500 bg-indigo-650 bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/25"
          }`}>
            <CalendarRange size={20} />
          </div>
          <span className={`mt-1.5 text-xs transition-colors font-medium ${isNextWeekActive ? "text-indigo-400" : "text-zinc-400"}`}>Next Week</span>
        </button>
      </div>

      {/* Section 2: Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(new Date(selectedDate).setHours(0, 0, 0, 0)) : undefined}
          onSelect={(date) => {
            if (!date) return;
            applyDate(date, false);
            setCalendarMonth(date);
          }}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-2"
        />
      </div>

      {/* Section 3: Time Container */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsTimeDialogOpen(true)}
          className="w-full flex items-center justify-between text-zinc-200 text-sm cursor-pointer p-1"
        >
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-zinc-400" />
            <span className="font-medium text-zinc-300">Time</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-xs font-semibold text-indigo-400">
              {selectedDate ? format(selectedDate, "HH:mm") : "None"}
            </span>
            <ChevronDown size={14} className="text-zinc-400" />
          </div>
        </button>
      </div>

      {/* Material Time Picker Dialog Overlay */}
      {isTimeDialogOpen && (
        <div className="fixed inset-0 z-90 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsTimeDialogOpen(false)}
          />
          <div className="relative w-[280px] bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl z-10">
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
