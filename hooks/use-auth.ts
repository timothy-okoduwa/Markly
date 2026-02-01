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
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for redirect result first (for mobile/Safari)
    const handleRedirect = async () => {
      try {
        setCheckingRedirect(true);
        const redirectUser = await checkRedirectResult();
        if (redirectUser && mounted) {
          console.log("User signed in via redirect:", redirectUser.email);
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to complete sign in",
          );
        }
      } finally {
        if (mounted) {
          setCheckingRedirect(false);
        }
      }
    };

    handleRedirect();

    const unsubscribe = onAuthChange((user) => {
      if (mounted) {
        console.log("Auth state changed:", user?.email || "No user");
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Note: On mobile/Safari, this will redirect and the page will reload
      // On desktop, the user will be set via onAuthChange
    } catch (err) {
      console.error("Login error:", err);
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
    loading: loading || checkingRedirect,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
