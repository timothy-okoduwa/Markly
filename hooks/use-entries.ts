// hooks/use-entries.ts

"use client";

import { useState, useEffect } from "react";
import { Entry } from "@/lib/types";
import { EntryService } from "@/services/entry.service";
import { subscribeToDocuments, COLLECTIONS } from "@/lib/firebase/firestore";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

export function useEntries(trackerId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription to entries
  useEffect(() => {
    if (!trackerId || !user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToDocuments<Entry>(
      COLLECTIONS.ENTRIES,
      [
        { field: "userId", operator: "==", value: user.uid },
        { field: "trackerId", operator: "==", value: trackerId },
      ],
      (data) => {
        setEntries(data);
        setLoading(false);
        setError(null);
      },
      "date",
      "asc",
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [trackerId, user]);

  const toggleEntry = async (date: Date): Promise<void> => {
    if (!trackerId || !user) return;

    try {
      await EntryService.toggleEntry(user.uid, trackerId, date);
      // No need to manually reload - onSnapshot will update automatically
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle entry";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err; // Re-throw so the optimistic update can be reverted
    }
  };

  const addEntry = async (date: Date): Promise<void> => {
    if (!trackerId || !user) return;

    try {
      await EntryService.createEntry(user.uid, trackerId, date);
      // No need to manually reload - onSnapshot will update automatically
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add entry";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const removeEntry = async (entryId: string): Promise<void> => {
    if (!trackerId || !user) return;

    try {
      await EntryService.deleteEntry(entryId);
      // No need to manually reload - onSnapshot will update automatically
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove entry";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const isDateMarked = (date: string): boolean => {
    return entries.some((entry) => entry.date === date);
  };

  const refetch = async () => {
    // With onSnapshot, refetch is not needed as updates are automatic
    // But keeping this for compatibility
    if (!trackerId || !user) return;

    try {
      const data = await EntryService.getTrackerEntries(trackerId);
      setEntries(data);
    } catch (err) {
      console.error("Error refetching entries:", err);
    }
  };

  return {
    entries,
    loading,
    error,
    toggleEntry,
    addEntry,
    removeEntry,
    isDateMarked,
    refetch,
  };
}
