// hooks/use-heatmap-data.ts

"use client";

import { useMemo } from "react";
import { Entry, HeatmapWeek, HeatmapCell } from "@/lib/types";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  subWeeks,
  startOfDay,
} from "date-fns";
import { HEATMAP_WEEKS_VISIBLE } from "@/lib/constants";

export function useHeatmapData(entries: Entry[]): HeatmapWeek[] {
  return useMemo(() => {
    const today = startOfDay(new Date());
    const endDate = endOfWeek(today, { weekStartsOn: 0 });
    const startDate = startOfWeek(
      subWeeks(endDate, HEATMAP_WEEKS_VISIBLE - 1),
      {
        weekStartsOn: 0,
      },
    );

    // Create a set of marked dates for O(1) lookup
    const markedDates = new Set(entries.map((e) => e.date));

    // Generate all weeks
    const weeks: HeatmapWeek[] = [];
    let currentWeekStart = startDate;

    for (let weekIndex = 0; weekIndex < HEATMAP_WEEKS_VISIBLE; weekIndex++) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
      const daysInWeek = eachDayOfInterval({
        start: currentWeekStart,
        end: weekEnd,
      });

      const days: HeatmapCell[] = daysInWeek.map((day) => {
        const dateString = format(day, "yyyy-MM-dd");
        const isMarked = markedDates.has(dateString);

        return {
          date: dateString,
          count: isMarked ? 1 : 0,
          isMarked,
        };
      });

      weeks.push({ days });
      currentWeekStart = subWeeks(currentWeekStart, -1);
    }

    return weeks;
  }, [entries]);
}
