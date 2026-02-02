// hooks/use-auth.ts

"use client";

import { useState, useEffect, useRef } from "react";
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
  const redirectCheckCompleted = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Only check redirect result once
      if (!redirectCheckCompleted.current) {
        redirectCheckCompleted.current = true;

        try {
          console.log("Initializing auth...");
          const redirectUser = await checkRedirectResult();

          if (redirectUser && mounted) {
            console.log("✓ User from redirect:", redirectUser.email);
            setUser(redirectUser);
          }
        } catch (err) {
          console.error("❌ Redirect check error:", err);
          if (mounted) {
            setError(
              err instanceof Error ? err.message : "Authentication failed",
            );
          }
        }
      }

      // Set up auth state listener
      const unsubscribe = onAuthChange((user) => {
        if (mounted) {
          console.log(
            "Auth state change:",
            user ? `✓ ${user.email}` : "✗ No user",
          );
          setUser(user);
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = initialize();

    return () => {
      mounted = false;
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  const login = async () => {
    try {
      console.log("Login initiated");
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log("Logout initiated");
      setError(null);
      await signOut();
    } catch (err) {
      console.error("❌ Logout error:", err);
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
