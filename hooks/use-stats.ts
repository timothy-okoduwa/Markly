// hooks/use-stats.ts

"use client";

import { useMemo } from "react";
import { Entry, Stats } from "@/lib/types";
import { StatsService } from "@/services/stats.service";

export function useStats(entries: Entry[]): Stats {
  const stats = useMemo(() => {
    return StatsService.calculateStats(entries);
  }, [entries]);

  return stats;
}
