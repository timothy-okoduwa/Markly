// services/tracker.service.ts

import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  COLLECTIONS,
} from "@/lib/firebase/firestore";
import { Tracker, TrackerShape } from "@/lib/types";

export class TrackerService {
  static async createTracker(
    userId: string,
    title: string,
    color: string,
    shape: TrackerShape,
  ): Promise<string> {
    const trackerId = await createDocument<Tracker>(COLLECTIONS.TRACKERS, {
      userId,
      title,
      color,
      shape,
    } as Omit<Tracker, "id">);

    return trackerId;
  }

  static async getTracker(trackerId: string): Promise<Tracker | null> {
    return await getDocument<Tracker>(COLLECTIONS.TRACKERS, trackerId);
  }

  static async getUserTrackers(userId: string): Promise<Tracker[]> {
    return await queryDocuments<Tracker>(
      COLLECTIONS.TRACKERS,
      [{ field: "userId", operator: "==", value: userId }],
      "createdAt",
      "desc",
    );
  }

  static async updateTracker(
    trackerId: string,
    updates: Partial<Pick<Tracker, "title" | "color" | "shape">>,
  ): Promise<void> {
    await updateDocument(COLLECTIONS.TRACKERS, trackerId, updates);
  }

  static async deleteTracker(trackerId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.TRACKERS, trackerId);
  }
}
