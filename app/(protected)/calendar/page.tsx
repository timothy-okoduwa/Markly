// app/(protected)/calendar/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useTrackers } from "@/hooks/use-trackers";
import { useAllEntries } from "@/hooks/use-all-entries";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  getMonth,
  getYear,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachWeekOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { DAYS_OF_WEEK_SHORT } from "@/lib/constants";
import {
  Droplets,
  BookOpen,
  Phone,
  Globe,
  Dumbbell,
  Footprints,
  Sparkles,
  Pencil,
  Leaf,
  Moon,
  Sparkle,
  DollarSign,
  Music,
  Code,
  Activity,
  CheckCircle,
} from "lucide-react";
import { HABIT_ICON_KEYWORDS, DEFAULT_HABIT_ICON } from "@/lib/constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  "book-open": BookOpen,
  phone: Phone,
  globe: Globe,
  dumbbell: Dumbbell,
  footprints: Footprints,
  sparkles: Sparkles,
  pencil: Pencil,
  leaf: Leaf,
  moon: Moon,
  sparkle: Sparkle,
  "dollar-sign": DollarSign,
  music: Music,
  code: Code,
  activity: Activity,
  "check-circle": CheckCircle,
  pill: ({ className }) => <span className={className}>💊</span>,
};

function getIconForTitle(
  title: string,
): React.ComponentType<{ className?: string }> {
  const lower = title.toLowerCase();
  for (const { keywords, icon } of HABIT_ICON_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw)))
      return ICON_MAP[icon] || ICON_MAP[DEFAULT_HABIT_ICON];
  }
  return ICON_MAP[DEFAULT_HABIT_ICON];
}

type ViewMode = "week" | "month";

export default function CalendarPage() {
  const { trackers, loading: trackersLoading } = useTrackers();
  const {
    allTrackerEntries,
    loading: entriesLoading,
    isDateMarkedForTracker,
  } = useAllEntries(trackers);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const loading = trackersLoading || entriesLoading;

  // --- WEEK VIEW DATA ---
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days;
  }, [currentDate]);

  const weekLabel = useMemo(() => {
    const s = weekData[0];
    const e = weekData[6];
    if (getMonth(s) === getMonth(e)) {
      return `${format(s, "MMM")} ${format(s, "d")} - ${format(e, "d")}`;
    }
    return `${format(s, "MMM d")} - ${format(e, "MMM d")}`;
  }, [weekData]);

  // --- MONTH VIEW DATA ---
  const monthData = useMemo(() => {
    const mStart = startOfMonth(currentDate);
    const mEnd = endOfMonth(currentDate);
    // Get all weeks that overlap this month
    const firstWeekStart = startOfWeek(mStart, { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(mEnd, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({
      start: firstWeekStart,
      end: lastWeekEnd,
    });

    // chunk into weeks of 7
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  const monthLabel = format(currentDate, "MMMM yyyy");

  // Navigation
  const goBack = () => {
    if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };
  const goForward = () => {
    if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };
  const goToday = () => setCurrentDate(new Date());
  const isCurrentPeriod =
    viewMode === "week"
      ? isSameDay(
          startOfWeek(currentDate, { weekStartsOn: 0 }),
          startOfWeek(new Date(), { weekStartsOn: 0 }),
        )
      : getMonth(currentDate) === getMonth(new Date()) &&
        getYear(currentDate) === getYear(new Date());

  if (loading) {
    return (
      <div className="space-y-4 px-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      </motion.div>

      {/* View Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {(["week", "month"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
              viewMode === mode
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {viewMode === "week" ? weekLabel : monthLabel}
          </span>
          {!isCurrentPeriod && (
            <button
              onClick={goToday}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={goForward}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Day headers */}
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="w-24 shrink-0" /> {/* label column */}
                {weekData.map((day, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                      {DAYS_OF_WEEK_SHORT[i]}
                    </span>
                    <span
                      className={`text-xs font-semibold mt-0.5 h-5 w-5 flex items-center justify-center rounded-full ${
                        isToday(day) ? "bg-foreground text-background" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Habit rows */}
              {allTrackerEntries.map(({ tracker }, tIdx) => {
                const Icon = getIconForTitle(tracker.title);
                return (
                  <div
                    key={tracker.id}
                    className="grid grid-cols-8 gap-1 items-center py-1.5 border-t border-muted/50"
                  >
                    <div className="w-24 shrink-0 flex items-center gap-1.5">
                      <div
                        className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${tracker.color}15` }}
                      >
                        <Icon
                          className="h-3 w-3"
                          style={{ color: tracker.color } as any}
                        />
                      </div>
                      <span className="text-[11px] font-medium truncate">
                        {tracker.title}
                      </span>
                    </div>
                    {weekData.map((day, dIdx) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const marked = isDateMarkedForTracker(
                        tracker.id,
                        dateStr,
                      );
                      return (
                        <div key={dIdx} className="flex justify-center">
                          <div
                            className={`h-6 w-6 rounded-md transition-colors ${
                              marked ? "" : "bg-muted/40"
                            }`}
                            style={
                              marked ? { backgroundColor: tracker.color } : {}
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {allTrackerEntries.map(({ tracker }, tIdx) => {
              const Icon = getIconForTitle(tracker.title);
              // Get the 4-5 weeks of this month for mini heatmap
              const weeks = monthData;
              return (
                <motion.div
                  key={tracker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tIdx * 0.04 }}
                  className="bg-card border rounded-2xl p-3"
                >
                  {/* Habit label */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-6 w-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tracker.color}15` }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: tracker.color } as any}
                      />
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {tracker.title}
                    </span>
                  </div>
                  {/* Day-of-week header */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {DAYS_OF_WEEK_SHORT.map((d) => (
                      <span
                        key={d}
                        className="text-[9px] text-center text-muted-foreground font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  {/* Mini heatmap grid */}
                  <div className="space-y-0.5">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="grid grid-cols-7 gap-0.5">
                        {week.map((day, dIdx) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const inMonth =
                            getMonth(day) === getMonth(currentDate);
                          const marked = isDateMarkedForTracker(
                            tracker.id,
                            dateStr,
                          );
                          return (
                            <div
                              key={dIdx}
                              className={`h-4 w-4 rounded-sm mx-auto transition-colors ${
                                !inMonth
                                  ? "opacity-0"
                                  : marked
                                    ? ""
                                    : "bg-muted/50"
                              }`}
                              style={
                                marked && inMonth
                                  ? { backgroundColor: tracker.color }
                                  : {}
                              }
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {allTrackerEntries.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No habits to display</p>
        </div>
      )}
    </div>
  );
}
