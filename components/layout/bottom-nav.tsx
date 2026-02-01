// components/layout/bottom-nav.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Calendar, BarChart3, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackerForm } from "@/components/trackers/tracker-form";
import { useTrackers } from "@/hooks/use-trackers";
import { TrackerShape } from "@/lib/types";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  // "Add" is handled separately as a centered floating button
  {
    href: "/stats",
    label: "Stats",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { createTracker } = useTrackers();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleCreate = async (
    title: string,
    color: string,
    shape: TrackerShape,
  ) => {
    await createTracker(title, color, shape);
    setIsAddOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                  "transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Center Add Button */}
          <div className="flex-1 flex items-center justify-center h-full">
            <motion.button
              type="button"
              onClick={() => setIsAddOpen(true)}
              whileTap={{ scale: 0.9 }}
              className="relative -mt-5 h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>

          {navItems.slice(2).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                  "transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add Tracker Dialog (triggered by center + button) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Habit</DialogTitle>
          </DialogHeader>
          <TrackerForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddOpen(false)}
            submitLabel="Add Habit"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
