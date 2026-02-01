// lib/constants.ts

import { ColorOption, ShapeOption } from "./types";

export const TRACKER_COLORS: ColorOption[] = [
  {
    name: "Emerald",
    value: "#10b981",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Sky",
    value: "#0ea5e9",
    gradient: "from-sky-400 to-sky-600",
  },
  {
    name: "Violet",
    value: "#8b5cf6",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    name: "Rose",
    value: "#f43f5e",
    gradient: "from-rose-400 to-rose-600",
  },
  {
    name: "Amber",
    value: "#f59e0b",
    gradient: "from-amber-400 to-amber-600",
  },
  {
    name: "Fuchsia",
    value: "#d946ef",
    gradient: "from-fuchsia-400 to-fuchsia-600",
  },
  {
    name: "Cyan",
    value: "#06b6d4",
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    name: "Orange",
    value: "#f97316",
    gradient: "from-orange-400 to-orange-600",
  },
];

export const TRACKER_SHAPES: ShapeOption[] = [
  {
    name: "Square",
    value: "square",
    icon: "▪",
  },
  {
    name: "Circle",
    value: "circle",
    icon: "●",
  },
  {
    name: "Diamond",
    value: "diamond",
    icon: "◆",
  },
];

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_OF_WEEK_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTHS = [
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

export const ANIMATION_DURATION = 200; // ms
export const HEATMAP_WEEKS_VISIBLE = 52;

// Icon keywords mapped to lucide icon names for habit auto-detection
// The dashboard will match tracker titles against these keywords to pick an icon
export const HABIT_ICON_KEYWORDS: { keywords: string[]; icon: string }[] = [
  { keywords: ["water", "drink", "glass", "hydrat"], icon: "droplets" },
  { keywords: ["read", "book", "reading"], icon: "book-open" },
  {
    keywords: ["phone", "call", "family", "mom", "dad", "parent"],
    icon: "phone",
  },
  {
    keywords: ["spanish", "french", "german", "japanese", "language", "learn"],
    icon: "globe",
  },
  { keywords: ["vitamin", "supplement", "pill"], icon: "pill" },
  {
    keywords: ["workout", "gym", "exercise", "fitness", "training"],
    icon: "dumbbell",
  },
  { keywords: ["walk", "step", "walking"], icon: "footprints" },
  { keywords: ["yoga", "stretch", "meditat", "mindful"], icon: "sparkles" },
  { keywords: ["journal", "write", "writing", "diary"], icon: "pencil" },
  {
    keywords: ["sugar", "diet", "eat", "food", "meal", "nutrition"],
    icon: "leaf",
  },
  { keywords: ["sleep", "bed", "rest"], icon: "moon" },
  { keywords: ["skin", "skincare", "beauty"], icon: "sparkle" },
  {
    keywords: ["budget", "money", "finance", "saving", "invest"],
    icon: "dollar-sign",
  },
  {
    keywords: ["guitar", "music", "piano", "instrument", "practice"],
    icon: "music",
  },
  { keywords: ["code", "program", "develop", "coding"], icon: "code" },
  { keywords: ["run", "running", "jog"], icon: "activity" },
];

// Default icon if no keyword matches
export const DEFAULT_HABIT_ICON = "check-circle";
