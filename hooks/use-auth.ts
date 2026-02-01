// hooks/use-auth.ts

"use client";

import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  onAuthChange,
  signInWithGoogle,
  signOut,
  checkRedirectResult,
} from "@/lib/firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result first (for mobile)
    checkRedirectResult().catch((err) => {
      console.error("Redirect result error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete sign in",
      );
    });

    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Note: On mobile, this will redirect and the page will reload
      // On desktop, the user will be set via onAuthChange
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
