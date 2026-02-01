// app/(protected)/stats/page.tsx

"use client";

import { useMemo, useState } from "react";
import { useTrackers } from "@/hooks/use-trackers";
import { useAllEntries } from "@/hooks/use-all-entries";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval,
  format,
  addYears,
  subYears,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  isSameDay,
  getYear,
  getMonth,
} from "date-fns";

type TimePeriod = "Week" | "Month" | "Year" | "All";

// ─── Circular Progress Ring ───────────────────────────────────────
interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({
  percent,
  size = 160,
  strokeWidth = 12,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
          opacity={0.3}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-foreground"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}

// ─── Year View: 12 Months Bar Chart ────────────────────────────────────
interface YearViewProps {
  data: { month: string; count: number; monthIndex: number }[];
}

function YearView({ data }: YearViewProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-32 px-1">
      {data.map((item, i) => {
        const barHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
          >
            <div
              className="w-full flex flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              <motion.div
                initial={{ height: "0%" }}
                animate={{
                  height: `${Math.max(barHeight, item.count > 0 ? 4 : 0)}%`,
                }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="w-full rounded-t-sm bg-foreground opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">
              {item.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Month View: Weeks with specific days ────────────────────────────────────
interface MonthViewProps {
  data: { week: string; days: { date: Date; count: number }[] }[];
}

function MonthView({ data }: MonthViewProps) {
  return (
    <div className="space-y-3">
      {data.map((week, weekIdx) => {
        const totalCount = week.days.reduce((sum, d) => sum + d.count, 0);
        const maxInWeek = Math.max(...week.days.map((d) => d.count), 1);

        return (
          <div key={weekIdx} className="bg-card border rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">{week.week}</span>
              <span className="text-[10px] text-muted-foreground">
                {totalCount} completions
              </span>
            </div>
            <div className="flex gap-1">
              {week.days.map((day, dayIdx) => {
                const height =
                  maxInWeek > 0 ? (day.count / maxInWeek) * 100 : 0;
                const isToday = isSameDay(day.date, new Date());

                return (
                  <div
                    key={dayIdx}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="w-full h-20 flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max(height, day.count > 0 ? 8 : 0)}%`,
                        }}
                        transition={{ duration: 0.4, delay: dayIdx * 0.05 }}
                        className={`w-full rounded-t ${
                          day.count > 0
                            ? "bg-foreground"
                            : "bg-muted opacity-30"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-[10px] font-semibold ${
                          isToday
                            ? "bg-foreground text-background rounded-full h-5 w-5 flex items-center justify-center mx-auto"
                            : ""
                        }`}
                      >
                        {format(day.date, "d")}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {format(day.date, "EEE")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Week View: 7 Days with exact counts ────────────────────────────────────
interface WeekViewProps {
  data: { date: Date; count: number; dayName: string }[];
}

function WeekView({ data }: WeekViewProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((day, i) => {
        const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
        const isToday = isSameDay(day.date, new Date());

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-xl p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-16">
                <div
                  className={`text-sm font-semibold ${isToday ? "text-foreground" : ""}`}
                >
                  {day.dayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(day.date, "MMM d")}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-8 bg-muted/30 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="h-full bg-foreground"
                  />
                </div>
              </div>
              <div className="flex-shrink-0 w-12 text-right">
                <span className="text-lg font-bold tabular-nums">
                  {day.count}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Stats Page ───────────────────────────────────────────────
export default function StatsPage() {
  const { trackers, loading: trackersLoading } = useTrackers();
  const {
    allTrackerEntries,
    globalStats,
    loading: entriesLoading,
  } = useAllEntries(trackers);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Year");
  const [currentDate, setCurrentDate] = useState(new Date());

  const loading = trackersLoading || entriesLoading;

  // Navigation handlers
  const goBack = () => {
    if (timePeriod === "Year") setCurrentDate(subYears(currentDate, 1));
    else if (timePeriod === "Month") setCurrentDate(subMonths(currentDate, 1));
    else if (timePeriod === "Week") setCurrentDate(subWeeks(currentDate, 1));
  };

  const goForward = () => {
    if (timePeriod === "Year") setCurrentDate(addYears(currentDate, 1));
    else if (timePeriod === "Month") setCurrentDate(addMonths(currentDate, 1));
    else if (timePeriod === "Week") setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const isCurrentPeriod =
    timePeriod === "All" ||
    (timePeriod === "Year" && getYear(currentDate) === getYear(new Date())) ||
    (timePeriod === "Month" &&
      getYear(currentDate) === getYear(new Date()) &&
      getMonth(currentDate) === getMonth(new Date())) ||
    (timePeriod === "Week" &&
      isSameDay(
        startOfWeek(currentDate, { weekStartsOn: 0 }),
        startOfWeek(new Date(), { weekStartsOn: 0 }),
      ));

  // Period label for navigation
  const periodLabel = useMemo(() => {
    if (timePeriod === "All") return "All Time";
    if (timePeriod === "Year") return format(currentDate, "yyyy");
    if (timePeriod === "Month") return format(currentDate, "MMMM yyyy");
    if (timePeriod === "Week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return "";
  }, [timePeriod, currentDate]);

  // Calculate period-specific data and stats
  const periodData = useMemo(() => {
    if (loading) return null;

    let startDate: Date;
    let endDate: Date;

    // Determine date range
    if (timePeriod === "All") {
      return {
        stats: {
          completionPercent: globalStats.completionPercent,
          activeStreak: globalStats.activeStreak,
          longestStreak: globalStats.longestStreak,
          totalCompleted: globalStats.allTime,
        },
        chartData: globalStats.monthlyData,
        chartType: "year" as const,
      };
    }

    if (timePeriod === "Year") {
      startDate = startOfYear(currentDate);
      endDate = endOfYear(currentDate);
    } else if (timePeriod === "Month") {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else {
      // Week
      startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    }

    // Get all entries in this period
    const entriesInPeriod = new Map<string, number>(); // date -> count
    allTrackerEntries.forEach(({ entries }) => {
      entries.forEach((entry) => {
        const entryDate = parseISO(entry.date);
        if (isWithinInterval(entryDate, { start: startDate, end: endDate })) {
          const dateStr = entry.date;
          entriesInPeriod.set(dateStr, (entriesInPeriod.get(dateStr) || 0) + 1);
        }
      });
    });

    const totalCompleted = Array.from(entriesInPeriod.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    // Calculate completion percentage (today within period)
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const todayInPeriod = isWithinInterval(today, {
      start: startDate,
      end: endDate,
    });
    const totalTrackers = trackers.length;

    let completedToday = 0;
    if (todayInPeriod) {
      allTrackerEntries.forEach(({ entries }) => {
        if (entries.some((e) => e.date === todayStr)) completedToday++;
      });
    }

    const completionPercent =
      todayInPeriod && totalTrackers > 0
        ? Math.round((completedToday / totalTrackers) * 100)
        : 0;

    // Calculate streaks
    const allDates = Array.from(entriesInPeriod.keys()).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = allDates.length > 0 ? 1 : 0;

    for (let i = 1; i < allDates.length; i++) {
      const prev = parseISO(allDates[i - 1]);
      const curr = parseISO(allDates[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak (from today backwards)
    if (todayInPeriod) {
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = format(d, "yyyy-MM-dd");

        if (!isWithinInterval(d, { start: startDate, end: endDate })) break;

        if (entriesInPeriod.has(ds)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Generate chart data based on period
    let chartData: any;
    let chartType: "year" | "month" | "week";

    if (timePeriod === "Year") {
      // Show 12 months
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      chartData = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        let count = 0;

        entriesInPeriod.forEach((entryCount, dateStr) => {
          const date = parseISO(dateStr);
          if (isWithinInterval(date, { start: monthStart, end: monthEnd })) {
            count += entryCount;
          }
        });

        return {
          month: format(month, "MMM"),
          count,
          monthIndex: getMonth(month),
        };
      });
      chartType = "year";
    } else if (timePeriod === "Month") {
      // Show weeks of month with days
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 0 },
      );

      chartData = weeks.map((weekStart, idx) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return {
          week: `Week ${idx + 1}`,
          days: days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            return {
              date: day,
              count: entriesInPeriod.get(dateStr) || 0,
            };
          }),
        };
      });
      chartType = "month";
    } else {
      // Show 7 days of week
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      chartData = days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return {
          date: day,
          count: entriesInPeriod.get(dateStr) || 0,
          dayName: format(day, "EEEE"),
        };
      });
      chartType = "week";
    }

    return {
      stats: {
        completionPercent,
        activeStreak: currentStreak,
        longestStreak,
        totalCompleted,
      },
      chartData,
      chartType,
    };
  }, [
    timePeriod,
    currentDate,
    loading,
    globalStats,
    allTrackerEntries,
    trackers,
  ]);

  if (loading) {
    return (
      <div className="space-y-6 px-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!periodData) return null;

  return (
    <div className="space-y-6 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
      </motion.div>

      {/* View scope tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {(["Week", "Month", "Year", "All"] as TimePeriod[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setTimePeriod(tab);
              if (tab !== "All") setCurrentDate(new Date()); // Reset to current when switching
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              timePeriod === tab
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Navigation (hide for "All") */}
      {timePeriod !== "All" && (
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{periodLabel}</span>
            {!isCurrentPeriod && (
              <button
                onClick={goToday}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
              >
                Today
              </button>
            )}
          </div>
          <button
            onClick={goForward}
            disabled={isCurrentPeriod}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Progress Ring */}
      <motion.div
        key={`${timePeriod}-${periodLabel}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <ProgressRing percent={periodData.stats.completionPercent} />
      </motion.div>

      {/* Stats Grid */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          {timePeriod === "All" ? "All Time" : periodLabel}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            key={`active-${timePeriod}-${periodLabel}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border rounded-2xl p-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Current Streak
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {periodData.stats.activeStreak}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">days</p>
          </motion.div>

          <motion.div
            key={`longest-${timePeriod}-${periodLabel}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-2xl p-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Longest Streak
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {periodData.stats.longestStreak}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">days</p>
          </motion.div>

          <motion.div
            key={`completed-${timePeriod}-${periodLabel}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border rounded-2xl p-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Total Completed
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {periodData.stats.totalCompleted}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {timePeriod === "All" ? "all time" : "this period"}
            </p>
          </motion.div>

          <motion.div
            key={`completion-${timePeriod}-${periodLabel}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-2xl p-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Today's Progress
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {periodData.stats.completionPercent}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              completed
            </p>
          </motion.div>
        </div>
      </div>

      {/* Activity Visualization */}
      <motion.div
        key={`chart-${timePeriod}-${periodLabel}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Activity</p>
          <p className="text-[10px] text-muted-foreground">
            {periodData.stats.totalCompleted} completions
          </p>
        </div>

        {periodData.chartType === "year" && (
          <YearView data={periodData.chartData} />
        )}
        {periodData.chartType === "month" && (
          <MonthView data={periodData.chartData} />
        )}
        {periodData.chartType === "week" && (
          <WeekView data={periodData.chartData} />
        )}
      </motion.div>
    </div>
  );
}
