// services/stats.service.ts

import { Entry, Stats } from "@/lib/types";
import {
  parseISO,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  format,
  subDays,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

export class StatsService {
  static calculateStats(entries: Entry[]): Stats {
    if (entries.length === 0) {
      return {
        totalDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        monthlyCount: 0,
        lastMarkedDate: null,
      };
    }

    // Sort entries by date ascending
    const sortedEntries = [...entries].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const totalDays = sortedEntries.length;
    const lastMarkedDate = sortedEntries[sortedEntries.length - 1].date;

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(sortedEntries);

    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(sortedEntries);

    // Calculate monthly count (current month)
    const monthlyCount = this.calculateMonthlyCount(sortedEntries);

    return {
      totalDays,
      currentStreak,
      longestStreak,
      monthlyCount,
      lastMarkedDate,
    };
  }

  private static calculateCurrentStreak(entries: Entry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    const yesterday = subDays(today, 1);
    const sortedDates = entries
      .map((e) => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime());

    const latestDate = sortedDates[0];

    // Check if last entry is today or yesterday
    if (!isSameDay(latestDate, today) && !isSameDay(latestDate, yesterday)) {
      return 0;
    }

    let streak = 0;
    let currentDate = latestDate;

    for (const date of sortedDates) {
      if (isSameDay(date, currentDate)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (differenceInDays(currentDate, date) === 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(entries: Entry[]): number {
    if (entries.length === 0) return 0;

    const sortedDates = entries
      .map((e) => parseISO(e.date))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const daysDiff = differenceInDays(sortedDates[i], sortedDates[i - 1]);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (daysDiff > 1) {
        currentStreak = 1;
      }
      // If daysDiff === 0 (same day), keep current streak
    }

    return longestStreak;
  }

  private static calculateMonthlyCount(entries: Entry[]): number {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return (
        (isAfter(entryDate, monthStart) || isSameDay(entryDate, monthStart)) &&
        (isBefore(entryDate, monthEnd) || isSameDay(entryDate, monthEnd))
      );
    }).length;
  }
}
