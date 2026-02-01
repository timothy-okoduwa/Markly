// lib/firebase/firestore.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";

export const COLLECTIONS = {
  USERS: "users",
  TRACKERS: "trackers",
  ENTRIES: "entries",
};

// Generic Firestore operations
export const createDocument = async <T>(
  collectionName: string,
  data: Omit<T, "id">,
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getDocument = async <T>(
  collectionName: string,
  documentId: string,
): Promise<T | null> => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: Partial<any>,
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (
  collectionName: string,
  documentId: string,
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

export const queryDocuments = async <T>(
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "asc",
): Promise<T[]> => {
  let q = query(collection(db, collectionName));

  conditions.forEach(({ field, operator, value }) => {
    q = query(q, where(field, operator, value));
  });

  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
};

// Real-time listener for documents with query conditions
export const subscribeToDocuments = <T>(
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[],
  callback: (documents: T[]) => void,
  orderByField?: string,
  orderDirection: "asc" | "desc" = "asc",
): (() => void) => {
  const constraints: QueryConstraint[] = [];

  conditions.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });

  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }

  const q = query(collection(db, collectionName), ...constraints);

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const documents = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as T,
      );
      callback(documents);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
    },
  );

  return unsubscribe;
};
