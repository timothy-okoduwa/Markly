// services/entry.service.ts

import {
  createDocument,
  deleteDocument,
  queryDocuments,
  COLLECTIONS,
} from "@/lib/firebase/firestore";
import { Entry } from "@/lib/types";
import { format } from "date-fns";

export class EntryService {
  static async createEntry(
    userId: string,
    trackerId: string,
    date: Date,
  ): Promise<string> {
    const dateString = format(date, "yyyy-MM-dd");

    const entryId = await createDocument<Entry>(COLLECTIONS.ENTRIES, {
      userId,
      trackerId,
      date: dateString,
    } as Omit<Entry, "id">);

    return entryId;
  }

  static async getTrackerEntries(trackerId: string): Promise<Entry[]> {
    return await queryDocuments<Entry>(
      COLLECTIONS.ENTRIES,
      [{ field: "trackerId", operator: "==", value: trackerId }],
      "date",
      "desc",
    );
  }

  static async getEntriesByDateRange(
    trackerId: string,
    startDate: string,
    endDate: string,
  ): Promise<Entry[]> {
    const entries = await this.getTrackerEntries(trackerId);
    return entries.filter(
      (entry) => entry.date >= startDate && entry.date <= endDate,
    );
  }

  static async getEntryByDate(
    trackerId: string,
    date: string,
  ): Promise<Entry | null> {
    const entries = await queryDocuments<Entry>(COLLECTIONS.ENTRIES, [
      { field: "trackerId", operator: "==", value: trackerId },
      { field: "date", operator: "==", value: date },
    ]);

    return entries.length > 0 ? entries[0] : null;
  }

  static async deleteEntry(entryId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.ENTRIES, entryId);
  }

  static async toggleEntry(
    userId: string,
    trackerId: string,
    date: Date,
  ): Promise<void> {
    const dateString = format(date, "yyyy-MM-dd");
    const existingEntry = await this.getEntryByDate(trackerId, dateString);

    if (existingEntry) {
      await this.deleteEntry(existingEntry.id);
    } else {
      await this.createEntry(userId, trackerId, date);
    }
  }

  static async deleteTrackerEntries(trackerId: string): Promise<void> {
    const entries = await this.getTrackerEntries(trackerId);
    await Promise.all(entries.map((entry) => this.deleteEntry(entry.id)));
  }
}
