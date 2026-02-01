// hooks/use-trackers.ts

"use client";

import { useState, useEffect } from "react";
import { Tracker, TrackerShape } from "@/lib/types";
import { TrackerService } from "@/services/tracker.service";
import { EntryService } from "@/services/entry.service";
import { subscribeToDocuments, COLLECTIONS } from "@/lib/firebase/firestore";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

export function useTrackers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription to trackers
  useEffect(() => {
    if (!user) {
      setTrackers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates for user's trackers
    const unsubscribe = subscribeToDocuments<Tracker>(
      COLLECTIONS.TRACKERS,
      [{ field: "userId", operator: "==", value: user.uid }],
      (data) => {
        setTrackers(data);
        setLoading(false);
        setError(null);
      },
      "createdAt",
      "asc",
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const createTracker = async (
    title: string,
    color: string,
    shape: TrackerShape,
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const trackerId = await TrackerService.createTracker(
        user.uid,
        title,
        color,
        shape,
      );
      // No need to manually reload - onSnapshot will update automatically
      toast({
        title: "Success",
        description: `"${title}" tracker created!`,
      });
      return trackerId;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create tracker";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTracker = async (
    trackerId: string,
    updates: Partial<Pick<Tracker, "title" | "color" | "shape">>,
  ): Promise<void> => {
    try {
      await TrackerService.updateTracker(trackerId, updates);
      // No need to manually reload - onSnapshot will update automatically
      toast({
        title: "Success",
        description: "Tracker updated!",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update tracker";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteTracker = async (trackerId: string): Promise<void> => {
    try {
      // Delete all entries first
      await EntryService.deleteTrackerEntries(trackerId);
      // Then delete the tracker
      await TrackerService.deleteTracker(trackerId);
      // No need to manually reload - onSnapshot will update automatically
      toast({
        title: "Success",
        description: "Tracker deleted",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete tracker";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const refetch = async () => {
    // With onSnapshot, refetch is not needed as updates are automatic
    // But keeping this for compatibility
    if (!user) return;

    try {
      const data = await TrackerService.getUserTrackers(user.uid);
      setTrackers(data);
    } catch (err) {
      console.error("Error refetching trackers:", err);
    }
  };

  return {
    trackers,
    loading,
    error,
    createTracker,
    updateTracker,
    deleteTracker,
    refetch,
  };
}
