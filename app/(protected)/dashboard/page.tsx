// app/(protected)/dashboard/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useTrackers } from "@/hooks/use-trackers";
import { useAuth } from "@/hooks/use-auth";
import { EntryService } from "@/services/entry.service";
import { StatsService } from "@/services/stats.service";
import { subscribeToDocuments, COLLECTIONS } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Droplets,
  BookOpen,
  Phone,
  Globe,
  Dumbbell,
  Footprints,
  Sparkles,
  Pencil,
  Leaf,
  Moon,
  Sparkle,
  DollarSign,
  Music,
  Code,
  Activity,
  CheckCircle,
} from "lucide-react";
import { HABIT_ICON_KEYWORDS, DEFAULT_HABIT_ICON } from "@/lib/constants";
import { Tracker, Entry } from "@/lib/types";

// Icon component resolver
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  "book-open": BookOpen,
  phone: Phone,
  globe: Globe,
  pill: ({ className }) => (
    <span
      className={className}
      style={{
        fontSize: "inherit",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      💊
    </span>
  ),
  dumbbell: Dumbbell,
  footprints: Footprints,
  sparkles: Sparkles,
  pencil: Pencil,
  leaf: Leaf,
  moon: Moon,
  sparkle: Sparkle,
  "dollar-sign": DollarSign,
  music: Music,
  code: Code,
  activity: Activity,
  "check-circle": CheckCircle,
};

function getIconForTitle(
  title: string,
): React.ComponentType<{ className?: string }> {
  const lower = title.toLowerCase();
  for (const { keywords, icon } of HABIT_ICON_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return ICON_MAP[icon] || ICON_MAP[DEFAULT_HABIT_ICON];
    }
  }
  return ICON_MAP[DEFAULT_HABIT_ICON];
}

interface HabitItemData {
  tracker: Tracker;
  isCompletedToday: boolean;
  currentStreak: number;
  entryId: string | null;
}

export default function DashboardPage() {
  const { trackers, loading: trackersLoading } = useTrackers();
  const { user } = useAuth();
  const router = useRouter();
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Subscribe to all entries for this user in real-time
  useEffect(() => {
    if (!user) {
      setAllEntries([]);
      setEntriesLoading(false);
      return;
    }

    setEntriesLoading(true);

    // Subscribe to all entries for this user
    const unsubscribe = subscribeToDocuments<Entry>(
      COLLECTIONS.ENTRIES,
      [{ field: "userId", operator: "==", value: user.uid }],
      (data) => {
        setAllEntries(data);
        setEntriesLoading(false);
      },
      "date",
      "desc",
    );

    return () => unsubscribe();
  }, [user]);

  // Calculate habit data from trackers and entries
  const habits = useMemo<HabitItemData[]>(() => {
    if (trackersLoading || entriesLoading) return [];

    return trackers.map((tracker) => {
      // Get entries for this specific tracker
      const trackerEntries = allEntries.filter(
        (e) => e.trackerId === tracker.id,
      );

      // Check if completed today
      const todayEntry = trackerEntries.find((e) => e.date === todayStr);

      // Calculate stats
      const stats = StatsService.calculateStats(trackerEntries);

      return {
        tracker,
        isCompletedToday: !!todayEntry,
        currentStreak: stats.currentStreak,
        entryId: todayEntry?.id || null,
      };
    });
  }, [trackers, allEntries, trackersLoading, entriesLoading, todayStr]);

  const handleToggle = async (habit: HabitItemData) => {
    if (!user || toggling.has(habit.tracker.id)) return;

    setToggling((prev) => new Set(prev).add(habit.tracker.id));

    try {
      await EntryService.toggleEntry(user.uid, habit.tracker.id, new Date());
      // Real-time listener will automatically update the UI
    } catch (e) {
      console.error("Error toggling entry:", e);
    } finally {
      setTimeout(() => {
        setToggling((prev) => {
          const n = new Set(prev);
          n.delete(habit.tracker.id);
          return n;
        });
      }, 300);
    }
  };

  const loading = trackersLoading || entriesLoading;

  if (loading) {
    return (
      <div className="space-y-3 px-1">
        <Skeleton className="h-7 w-24 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-1"
      >
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/trackers")}
          className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Habit List */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 p-4 rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No habits yet</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            Tap the + button to create your first habit and start building
            consistency
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {habits.map((habit, index) => {
              const Icon = getIconForTitle(habit.tracker.title);
              return (
                <motion.div
                  key={habit.tracker.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="flex items-center gap-3 bg-card border rounded-2xl px-4 py-3 cursor-pointer active:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/trackers/${habit.tracker.id}`)}
                >
                  {/* Icon */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${habit.tracker.color}15` }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: habit.tracker.color } as any}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {habit.tracker.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {habit.currentStreak}d
                      </span>
                    </div>
                  </div>

                  {/* Toggle Circle */}
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(habit);
                    }}
                    whileTap={{ scale: 0.85 }}
                    disabled={toggling.has(habit.tracker.id)}
                    className="shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    style={{
                      borderColor: habit.isCompletedToday
                        ? habit.tracker.color
                        : undefined,
                      backgroundColor: habit.isCompletedToday
                        ? habit.tracker.color
                        : "transparent",
                    }}
                  >
                    {habit.isCompletedToday && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </motion.svg>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
