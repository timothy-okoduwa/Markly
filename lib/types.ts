// lib/types.ts

import { Timestamp } from "firebase/firestore";

export type TrackerShape = "square" | "circle" | "diamond";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Tracker {
  id: string;
  userId: string;
  title: string;
  color: string;
  shape: TrackerShape;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Entry {
  id: string;
  trackerId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  timestamp: Timestamp;
}

export interface TrackerWithEntries extends Tracker {
  entries: Entry[];
}

export interface Stats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  monthlyCount: number;
  lastMarkedDate: string | null;
}

export interface HeatmapCell {
  date: string;
  count: number;
  isMarked: boolean;
}

export interface HeatmapWeek {
  days: HeatmapCell[];
}

export interface ColorOption {
  name: string;
  value: string;
  gradient: string;
}

export interface ShapeOption {
  name: string;
  value: TrackerShape;
  icon: string;
}
