// components/trackers/tracker-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRACKER_COLORS, TRACKER_SHAPES } from "@/lib/constants";
import { TrackerShape } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrackerFormProps {
  initialTitle?: string;
  initialColor?: string;
  initialShape?: TrackerShape;
  onSubmit: (title: string, color: string, shape: TrackerShape) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function TrackerForm({
  initialTitle = "",
  initialColor = TRACKER_COLORS[0].value,
  initialShape = "square",
  onSubmit,
  onCancel,
  submitLabel = "Create Tracker",
}: TrackerFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);
  const [shape, setShape] = useState<TrackerShape>(initialShape);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), color, shape);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tracker Name</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Morning Workout, Reading, Meditation"
          maxLength={50}
          required
        />
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label>Color</Label>
        <div className="grid grid-cols-4 gap-2">
          {TRACKER_COLORS.map((colorOption, index) => (
            <motion.button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              className={cn(
                "relative h-12 rounded-lg border-2 transition-all",
                color === colorOption.value
                  ? "border-foreground scale-105"
                  : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: colorOption.value }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              {color === colorOption.value && (
                <motion.div
                  layoutId="selected-color"
                  className="absolute inset-0 rounded-lg border-2 border-foreground"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="sr-only">{colorOption.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Shape Selection */}
      <div className="space-y-3">
        <Label>Shape</Label>
        <div className="grid grid-cols-3 gap-2">
          {TRACKER_SHAPES.map((shapeOption, index) => (
            <motion.button
              key={shapeOption.value}
              type="button"
              onClick={() => setShape(shapeOption.value)}
              className={cn(
                "relative h-16 rounded-lg border-2 transition-all",
                "flex flex-col items-center justify-center gap-1",
                shape === shapeOption.value
                  ? "border-foreground bg-muted"
                  : "border-muted hover:border-muted-foreground",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-2xl" style={{ color }}>
                {shapeOption.icon}
              </span>
              <span className="text-xs font-mono">{shapeOption.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={!title.trim()}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
