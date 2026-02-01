// hooks/use-all-entries.ts

"use client";

import { useState, useEffect, useMemo } from "react";
import { Entry, Tracker } from "@/lib/types";
import { subscribeToDocuments, COLLECTIONS } from "@/lib/firebase/firestore";
import { useAuth } from "./use-auth";

interface TrackerEntries {
  tracker: Tracker;
  entries: Entry[];
}

export function useAllEntries(trackers: Tracker[]) {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to all user entries in real-time
  useEffect(() => {
    if (!user) {
      setAllEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to all entries for this user
    const unsubscribe = subscribeToDocuments<Entry>(
      COLLECTIONS.ENTRIES,
      [{ field: "userId", operator: "==", value: user.uid }],
      (data) => {
        setAllEntries(data);
        setLoading(false);
      },
      "date",
      "desc",
    );

    return () => unsubscribe();
  }, [user]);

  // Combine trackers with their entries
  const allTrackerEntries = useMemo<TrackerEntries[]>(() => {
    return trackers.map((tracker) => {
      const entries = allEntries.filter((e) => e.trackerId === tracker.id);
      return { tracker, entries };
    });
  }, [trackers, allEntries]);

  // Build a quick lookup: trackerId -> Set of date strings
  const entryDateSets = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allTrackerEntries.forEach(({ tracker, entries }) => {
      map.set(tracker.id, new Set(entries.map((e) => e.date)));
    });
    return map;
  }, [allTrackerEntries]);

  const isDateMarkedForTracker = (
    trackerId: string,
    dateString: string,
  ): boolean => {
    const set = entryDateSets.get(trackerId);
    return set ? set.has(dateString) : false;
  };

  // Global stats across all trackers
  const globalStats = useMemo(() => {
    let totalCompleted = 0;
    let allTime = 0;

    allTrackerEntries.forEach(({ entries }) => {
      totalCompleted += entries.length;
    });
    allTime = totalCompleted;

    // Calculate date ranges
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const last7Days = new Set<string>();
    const last30Days = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.add(d.toISOString().split("T")[0]);
    }
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last30Days.add(d.toISOString().split("T")[0]);
    }

    let weeklyCompletions = 0;
    let monthlyCompletions = 0;
    allTrackerEntries.forEach(({ entries }) => {
      entries.forEach((e) => {
        if (last7Days.has(e.date)) weeklyCompletions++;
        if (last30Days.has(e.date)) monthlyCompletions++;
      });
    });

    // Calculate active streak: number of consecutive days (from today backward)
    // where at least one tracker was completed
    const allDates = new Set<string>();
    allTrackerEntries.forEach(({ entries }) => {
      entries.forEach((e) => allDates.add(e.date));
    });

    let activeStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (allDates.has(ds)) {
        activeStreak++;
      } else {
        break;
      }
    }

    // Longest streak
    const sortedDates = Array.from(allDates).sort();
    let longestStreak = 0;
    let currentStreak = sortedDates.length > 0 ? 1 : 0;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Monthly completions by month for chart (last 12 months)
    const monthlyData: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const nextMonth =
        month === 11
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 2).padStart(2, "0")}-01`;

      let count = 0;
      allTrackerEntries.forEach(({ entries }) => {
        entries.forEach((e) => {
          if (e.date >= monthStart && e.date < nextMonth) count++;
        });
      });

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      monthlyData.push({ month: months[month], count });
    }

    // Completion percentage: today's completion rate
    const totalTrackers = trackers.length;
    let completedToday = 0;
    allTrackerEntries.forEach(({ entries }) => {
      if (entries.some((e) => e.date === todayStr)) completedToday++;
    });
    const completionPercent =
      totalTrackers > 0
        ? Math.round((completedToday / totalTrackers) * 100)
        : 0;

    return {
      totalCompleted,
      allTime,
      activeStreak,
      longestStreak,
      weeklyCompletions,
      monthlyCompletions,
      monthlyData,
      completionPercent,
      completedToday,
      totalTrackers,
    };
  }, [allTrackerEntries, trackers]);

  return {
    allTrackerEntries,
    loading,
    entryDateSets,
    isDateMarkedForTracker,
    globalStats,
  };
}
