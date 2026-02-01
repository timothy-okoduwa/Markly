// components/trackers/tracker-card.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tracker } from "@/lib/types";
import { MoreVertical, Edit, Trash2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  "book-open": BookOpen,
  phone: Phone,
  globe: Globe,
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
  pill: ({ className }) => <span className={className}>💊</span>,
};

function getIconForTitle(
  title: string,
): React.ComponentType<{ className?: string }> {
  const lower = title.toLowerCase();
  for (const { keywords, icon } of HABIT_ICON_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw)))
      return ICON_MAP[icon] || ICON_MAP[DEFAULT_HABIT_ICON];
  }
  return ICON_MAP[DEFAULT_HABIT_ICON];
}

interface TrackerCardProps {
  tracker: Tracker;
  onEdit: () => void;
  onDelete: () => void;
  delay?: number;
}

export function TrackerCard({
  tracker,
  onEdit,
  onDelete,
  delay = 0,
}: TrackerCardProps) {
  const Icon = getIconForTitle(tracker.title);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/trackers/${tracker.id}`}>
        <div className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer">
          {/* Color accent strip */}
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: tracker.color }}
          />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tracker.color}15` }}
                >
                  <div style={{ color: tracker.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{tracker.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BarChart3 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      View heatmap
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.preventDefault()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit();
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete();
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
