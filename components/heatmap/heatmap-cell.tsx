// components/heatmap/heatmap-cell.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, parseISO, isFuture } from "date-fns";

interface HeatmapCellProps {
  date: string;
  isMarked: boolean;
  color: string;
  shape: "square" | "circle" | "diamond";
  onClick: () => void;
}

export function HeatmapCell({
  date,
  isMarked,
  color,
  shape,
  onClick,
}: HeatmapCellProps) {
  const isDisabled = isFuture(parseISO(date));

  const getShapeClass = () => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "diamond":
        return "rotate-45";
      case "square":
      default:
        return "rounded-sm";
    }
  };

  return (
    <motion.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "relative w-[12px] h-[12px] transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "disabled:cursor-not-allowed disabled:hover:scale-100",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        isDisabled && "opacity-20",
      )}
      style={
        {
          // set Tailwind ring color CSS variable
          ["--tw-ring-color" as any]: color,
        } as React.CSSProperties
      }
      whileHover={!isDisabled ? { scale: 1.15 } : {}}
      whileTap={!isDisabled ? { scale: 0.9 } : {}}
      title={format(parseISO(date), "MMM d, yyyy")}
    >
      <div
        className={cn(
          "w-full h-full transition-all duration-200",
          getShapeClass(),
          isMarked ? "opacity-100" : "opacity-0 bg-muted hover:opacity-30",
        )}
        style={{
          backgroundColor: isMarked ? color : undefined,
        }}
      />

      {shape === "diamond" && isMarked && (
        <div
          className="absolute inset-0 rounded-sm"
          style={{
            backgroundColor: color,
          }}
        />
      )}
    </motion.button>
  );
}
