// app/(protected)/trackers/page.tsx
// (This file stays mostly the same but renames "Trackers" -> context-aware and keeps the grid)
// The main change: on mobile this is accessible via the + button in bottom nav,
// but we keep it as a standalone page too for desktop. Minor polish only.

"use client";

import { useState } from "react";
import { useTrackers } from "@/hooks/use-trackers";
import { TrackerCard } from "@/components/trackers/tracker-card";
import { TrackerForm } from "@/components/trackers/tracker-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tracker, TrackerShape } from "@/lib/types";

export default function TrackersPage() {
  const { trackers, loading, createTracker, updateTracker, deleteTracker } =
    useTrackers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [deletingTracker, setDeletingTracker] = useState<Tracker | null>(null);

  const handleCreate = async (
    title: string,
    color: string,
    shape: TrackerShape,
  ) => {
    await createTracker(title, color, shape);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (
    title: string,
    color: string,
    shape: TrackerShape,
  ) => {
    if (editingTracker) {
      await updateTracker(editingTracker.id, { title, color, shape });
      setEditingTracker(null);
    }
  };

  const handleDelete = async () => {
    if (deletingTracker) {
      await deleteTracker(deletingTracker.id);
      setDeletingTracker(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-1">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold tracking-tight">My Habits</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="sm"
          className="gap-1.5 rounded-xl"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </motion.div>

      {/* Grid */}
      {trackers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 p-4 rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No habits yet</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            Create your first habit to start building consistency
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="gap-1.5 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Create Habit
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {trackers.map((tracker, index) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onEdit={() => setEditingTracker(tracker)}
              onDelete={() => setDeletingTracker(tracker)}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Habit</DialogTitle>
          </DialogHeader>
          <TrackerForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            submitLabel="Add Habit"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTracker}
        onOpenChange={() => setEditingTracker(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          {editingTracker && (
            <TrackerForm
              initialTitle={editingTracker.title}
              initialColor={editingTracker.color}
              initialShape={editingTracker.shape}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTracker(null)}
              submitLabel="Update Habit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTracker}
        onOpenChange={() => setDeletingTracker(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingTracker?.title}" and all
              its entries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
