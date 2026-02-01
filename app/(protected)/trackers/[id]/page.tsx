// app/(protected)/trackers/[id]/page.tsx

"use client";

import { use, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTrackers } from "@/hooks/use-trackers";
import { useEntries } from "@/hooks/use-entries";
import { useStats } from "@/hooks/use-stats";
import { StatsCard } from "@/components/stats/stats-card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  getMonth,
  getYear,
  addMonths,
  subMonths,
  isToday,
  startOfDay,
} from "date-fns";
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

// ─── Icon resolver (same pattern used across the app) ────────────────────────
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

// ─── Counter Modal ──────────────────────────────────────────────────────────
interface CounterModalProps {
  date: Date;
  currentCount: number;
  color: string;
  onClose: () => void;
  onUpdate: (newCount: number) => void;
}

function CounterModal({
  date,
  currentCount,
  color,
  onClose,
  onUpdate,
}: CounterModalProps) {
  const [count, setCount] = useState(currentCount);

  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleDecrement = () => setCount((prev) => Math.max(0, prev - 1));

  const handleSave = () => {
    onUpdate(count);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background border rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-1">
          {format(date, "MMMM d, yyyy")}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          How many times did you complete this habit?
        </p>

        {/* Counter */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleDecrement}
            className="h-12 w-12 rounded-full border-2 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            style={{ borderColor: color }}
          >
            <Minus className="h-5 w-5" />
          </button>

          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {count}
          </div>

          <button
            onClick={handleIncrement}
            className="h-12 w-12 rounded-full flex items-center justify-center transition-colors active:scale-95"
            style={{ backgroundColor: color }}
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-white transition-colors text-sm font-medium active:scale-95"
            style={{ backgroundColor: color }}
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface TrackerPageProps {
  params: Promise<{ id: string }>;
}

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function TrackerPage({ params }: TrackerPageProps) {
  const resolvedParams = use(params);
  const trackerId = resolvedParams.id;
  const router = useRouter();
  const { trackers, loading: trackersLoading } = useTrackers();
  const {
    entries,
    loading: entriesLoading,
    addEntry,
    removeEntry,
  } = useEntries(trackerId);
  const stats = useStats(entries);

  // The month the calendar is currently displaying
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Counter modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Optimistic local override: dates with pending operations
  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  const tracker = trackers.find((t) => t.id === trackerId);
  const loading = trackersLoading || entriesLoading;

  // ─── Count entries per date ─────────────────────────────────────────────
  const dateCountMap = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((entry) => {
      map.set(entry.date, (map.get(entry.date) || 0) + 1);
    });
    return map;
  }, [entries]);

  // ─── Get count for a date ──────────────────────────────────────────────
  const getCountForDate = useCallback(
    (dateStr: string): number => {
      return dateCountMap.get(dateStr) || 0;
    },
    [dateCountMap],
  );

  // ─── Handle day click ──────────────────────────────────────────────────
  const handleDayClick = async (day: Date) => {
    // Block future dates
    if (startOfDay(day) > startOfDay(new Date())) return;

    const dateStr = format(day, "yyyy-MM-dd");
    const currentCount = getCountForDate(dateStr);

    // If already has entries, open counter modal
    if (currentCount > 0) {
      setSelectedDate(day);
    } else {
      // If no entries, add one
      await handleUpdateCount(day, 1);
    }
  };

  // ─── Handle count update from modal ────────────────────────────────────
  const handleUpdateCount = async (day: Date, newCount: number) => {
    if (!tracker) return;

    const dateStr = format(day, "yyyy-MM-dd");
    const currentCount = getCountForDate(dateStr);

    // Mark as pending
    setPendingOps((prev) => new Set(prev).add(dateStr));

    try {
      // Calculate difference
      const diff = newCount - currentCount;

      if (diff > 0) {
        // Add entries
        for (let i = 0; i < diff; i++) {
          await addEntry(day);
        }
      } else if (diff < 0) {
        // Remove entries
        const entriesToRemove = entries.filter((e) => e.date === dateStr);
        for (let i = 0; i < Math.abs(diff); i++) {
          if (entriesToRemove[i]) {
            await removeEntry(entriesToRemove[i].id);
          }
        }
      }

      // Wait a bit for onSnapshot to update
      setTimeout(() => {
        setPendingOps((prev) => {
          const next = new Set(prev);
          next.delete(dateStr);
          return next;
        });
      }, 500);
    } catch (error) {
      console.error("Error updating count:", error);
      setPendingOps((prev) => {
        const next = new Set(prev);
        next.delete(dateStr);
        return next;
      });
    }
  };

  // ─── Calendar grid data for the displayed month ─────────────────────────
  const calendarDays = useMemo(() => {
    const mStart = startOfMonth(calendarMonth);
    const mEnd = endOfMonth(calendarMonth);
    // Expand to full weeks so the grid is always 6 rows × 7 cols
    const gridStart = startOfWeek(mStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(mEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [calendarMonth]);

  const currentMonthLabel = format(calendarMonth, "MMMM yyyy");
  const isCurrentMonth =
    getMonth(calendarMonth) === getMonth(new Date()) &&
    getYear(calendarMonth) === getYear(new Date());

  // ─── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5 px-1">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  // ─── Not found ───────────────────────────────────────────────────────────
  if (!tracker) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <h2 className="text-xl font-semibold mb-2">Habit not found</h2>
        <p className="text-muted-foreground text-sm mb-5">
          This habit doesn't exist or you don't have access to it.
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const Icon = getIconForTitle(tracker.title);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-5 px-1">
        {/* Back + Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${tracker.color}15` }}
            >
              <Icon
                className="h-5.5 w-5.5"
                style={{ color: tracker.color } as any}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {tracker.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                🔥 {stats.currentStreak} day streak
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats — 2×2 grid on mobile, 4 cols on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard
            label="This Month"
            value={stats.monthlyCount}
            icon={
              <Calendar className="h-4 w-4" style={{ color: tracker.color }} />
            }
            color={tracker.color}
            delay={0.05}
          />
          <StatsCard
            label="Current Streak"
            value={stats.currentStreak}
            icon={
              <Flame className="h-4 w-4" style={{ color: tracker.color }} />
            }
            color={tracker.color}
            delay={0.1}
          />
          <StatsCard
            label="Best Streak"
            value={stats.longestStreak}
            icon={
              <Trophy className="h-4 w-4" style={{ color: tracker.color }} />
            }
            color={tracker.color}
            delay={0.15}
          />
          <StatsCard
            label="Total Days"
            value={stats.totalDays}
            icon={
              <TrendingUp
                className="h-4 w-4"
                style={{ color: tracker.color }}
              />
            }
            color={tracker.color}
            delay={0.2}
          />
        </div>

        {/* Monthly Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border rounded-2xl p-4"
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-semibold">{currentMonthLabel}</span>

            <button
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
              disabled={isCurrentMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_HEADER.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-muted-foreground uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const inCurrentMonth = getMonth(day) === getMonth(calendarMonth);
              const isFutureDay = startOfDay(day) > startOfDay(new Date());
              const count = getCountForDate(dateStr);
              const today = isToday(day);
              const isPending = pendingOps.has(dateStr);

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isFutureDay || !inCurrentMonth || isPending}
                  onClick={() => handleDayClick(day)}
                  className={[
                    "relative h-9 w-full rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150",
                    "focus:outline-none",
                    !inCurrentMonth
                      ? "opacity-0 pointer-events-none"
                      : isFutureDay
                        ? "opacity-25 cursor-not-allowed"
                        : "hover:bg-muted active:scale-95 cursor-pointer",
                    isPending ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {/* Filled background when marked */}
                  {count > 0 && inCurrentMonth && (
                    <span
                      className="absolute inset-0.5 rounded-md"
                      style={{ backgroundColor: tracker.color }}
                    />
                  )}

                  {/* Today ring (shows even when marked) */}
                  {today && (
                    <span
                      className="absolute inset-0.5 rounded-md border-2"
                      style={{ borderColor: tracker.color }}
                    />
                  )}

                  {/* Day number with count badge */}
                  <span className="relative z-10 flex items-center gap-0.5">
                    <span
                      className={[
                        count > 0 && inCurrentMonth
                          ? "text-white font-semibold"
                          : "",
                        today && count === 0 ? "font-bold" : "",
                      ].join(" ")}
                    >
                      {format(day, "d")}
                    </span>
                    {count > 1 && inCurrentMonth && (
                      <span className="text-[8px] font-bold text-white bg-black/20 rounded-full h-3.5 w-3.5 flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <div
                className="h-3.5 w-3.5 rounded-sm"
                style={{ backgroundColor: tracker.color }}
              />
              <span className="text-[10px] text-muted-foreground">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3.5 w-3.5 rounded-sm border-2"
                style={{ borderColor: tracker.color }}
              />
              <span className="text-[10px] text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3.5 w-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: tracker.color }}
              >
                2
              </div>
              <span className="text-[10px] text-muted-foreground">
                Multiple times
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Counter Modal */}
      <AnimatePresence>
        {selectedDate && (
          <CounterModal
            date={selectedDate}
            currentCount={getCountForDate(format(selectedDate, "yyyy-MM-dd"))}
            color={tracker.color}
            onClose={() => setSelectedDate(null)}
            onUpdate={(count) => handleUpdateCount(selectedDate, count)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
