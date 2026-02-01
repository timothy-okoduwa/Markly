// components/heatmap/heatmap-grid.tsx

"use client";

import React from "react";
import { HeatmapWeek } from "@/lib/types";
import { HeatmapCell } from "./heatmap-cell";
import { DAYS_OF_WEEK, MONTHS } from "@/lib/constants";
import { format, parseISO, getMonth, startOfWeek, subWeeks } from "date-fns";

interface HeatmapGridProps {
  weeks: HeatmapWeek[];
  color: string;
  shape: "square" | "circle" | "diamond";
  onCellClick: (date: string) => void;
}

export function HeatmapGrid({
  weeks,
  color,
  shape,
  onCellClick,
}: HeatmapGridProps) {
  // Calculate month labels
  const monthLabels = React.useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      const firstDay = week.days[0];
      if (!firstDay) return;

      const date = parseISO(firstDay.date);
      const currentMonth = getMonth(date);

      if (currentMonth !== lastMonth && index % 4 === 0) {
        labels.push({
          month: MONTHS[currentMonth],
          weekIndex: index,
        });
        lastMonth = currentMonth;
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2 pl-8">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-muted-foreground font-mono"
              style={{
                marginLeft:
                  weekIndex === 0
                    ? 0
                    : `${(weekIndex - (monthLabels.findIndex((l) => l.weekIndex === weekIndex) > 0 ? monthLabels[monthLabels.findIndex((l) => l.weekIndex === weekIndex) - 1].weekIndex : 0)) * 14}px`,
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="h-[12px] flex items-center justify-end">
                {index % 2 === 1 && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.days.map((day, dayIndex) => (
                  <HeatmapCell
                    key={`${weekIndex}-${dayIndex}`}
                    date={day.date}
                    isMarked={day.isMarked}
                    color={color}
                    shape={shape}
                    onClick={() => onCellClick(day.date)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
