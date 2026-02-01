// components/stats/stats-card.tsx

"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  delay?: number;
}

export function StatsCard({
  label,
  value,
  icon,
  color,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ color: color }}
            >
              {value}
            </p>
          </div>
          {icon && (
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
