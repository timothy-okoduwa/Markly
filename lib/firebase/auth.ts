// lib/firebase/auth.ts

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence,
  AuthError,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// Create a new GoogleAuthProvider instance each time
const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  provider.addScope("profile");
  provider.addScope("email");

  return provider;
};

// Detect Safari specifically (both desktop and mobile)
const isSafari = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafariBrowser =
    ua.indexOf("safari") !== -1 &&
    ua.indexOf("chrome") === -1 &&
    ua.indexOf("android") === -1;
  console.log("Is Safari:", isSafariBrowser);
  return isSafariBrowser;
};

// Detect if user is on mobile
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

// Handle user document creation/update
const handleUserDocument = async (user: FirebaseUser) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  } catch (error) {
    console.error("Error handling user document:", error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    console.log("=== SIGN IN DEBUG ===");
    console.log("User agent:", navigator.userAgent);
    console.log("Current URL:", window.location.href);
    console.log("Is Safari:", isSafari());
    console.log("Is Mobile:", isMobile());

    // Set persistence
    await setPersistence(auth, browserLocalPersistence);
    console.log("✓ Persistence set to LOCAL");

    const provider = createGoogleProvider();

    // ALWAYS use popup for Safari (both desktop and mobile)
    if (isSafari()) {
      console.log("Safari detected - using popup method");
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("✓ Popup sign-in successful!");
        const user = result.user;
        await handleUserDocument(user);
        return user;
      } catch (popupError) {
        console.error("Popup error:", popupError);

        if (
          popupError &&
          typeof popupError === "object" &&
          "code" in popupError
        ) {
          const authError = popupError as AuthError;
          console.error("Error code:", authError.code);

          // If popup is blocked, try redirect as last resort
          if (
            authError.code === "auth/popup-blocked" ||
            authError.code === "auth/cancelled-popup-request"
          ) {
            console.log("Popup blocked, trying redirect...");
            localStorage.setItem("pendingSignIn", Date.now().toString());
            await signInWithRedirect(auth, provider);
            return null;
          }
        }

        throw popupError;
      }
    }
    // For non-Safari mobile, use redirect
    else if (isMobile()) {
      console.log("Non-Safari mobile detected - using redirect");
      localStorage.setItem("pendingSignIn", Date.now().toString());
      await signInWithRedirect(auth, provider);
      return null;
    }
    // For desktop non-Safari, use popup
    else {
      console.log("Desktop non-Safari - using popup");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await handleUserDocument(user);
      return user;
    }
  } catch (error) {
    console.error("=== SIGN IN ERROR ===");
    console.error("Error:", error);
    localStorage.removeItem("pendingSignIn");

    if (error && typeof error === "object" && "code" in error) {
      const authError = error as AuthError;
      console.error("Auth error code:", authError.code);
      console.error("Auth error message:", authError.message);
    }

    throw error;
  }
};

// Check for redirect result when app loads
export const checkRedirectResult = async (): Promise<FirebaseUser | null> => {
  const pendingSignIn = localStorage.getItem("pendingSignIn");

  console.log("=== REDIRECT CHECK ===");
  console.log("Pending sign in:", pendingSignIn);

  if (!pendingSignIn) {
    console.log("No pending sign in, skipping");
    return null;
  }

  try {
    console.log("Calling getRedirectResult...");

    // Wait a bit for the redirect to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await getRedirectResult(auth);

    console.log("Redirect result:", result);

    if (result?.user) {
      console.log("✓✓✓ Redirect SUCCESS! User:", result.user.email);
      localStorage.removeItem("pendingSignIn");
      await handleUserDocument(result.user);
      return result.user;
    } else {
      console.log("❌ No redirect result");

      if (pendingSignIn) {
        const timestamp = parseInt(pendingSignIn);
        const elapsed = Date.now() - timestamp;
        console.log(`Time elapsed: ${elapsed}ms`);

        if (elapsed > 30000) {
          console.warn("Timeout - clearing pending flag");
          localStorage.removeItem("pendingSignIn");
        }
      }
    }

    return null;
  } catch (error) {
    console.error("=== REDIRECT ERROR ===");
    console.error("Error:", error);
    localStorage.removeItem("pendingSignIn");
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    localStorage.removeItem("pendingSignIn");
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
