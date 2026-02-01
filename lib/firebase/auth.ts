// lib/firebase/auth.ts

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "../types";

const googleProvider = new GoogleAuthProvider();

// Detect if user is on mobile
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

// Handle user document creation/update
const handleUserDocument = async (user: FirebaseUser) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // First time sign in - create user document
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Update last login
    await setDoc(
      userRef,
      {
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
};

export const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    if (isMobile()) {
      // Use redirect for mobile devices
      await signInWithRedirect(auth, googleProvider);
      // Return null because redirect will reload the page
      return null;
    } else {
      // Use popup for desktop
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await handleUserDocument(user);
      return user;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Check for redirect result when app loads
export const checkRedirectResult = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await handleUserDocument(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
