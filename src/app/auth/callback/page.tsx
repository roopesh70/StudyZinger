// This page is necessary to handle the client-side redirect from Firebase's
// getRedirectResult() method. It allows the app to complete the sign-in
// flow and then redirect the user to the page they were originally trying
// to access.
'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { getRedirectResult } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthCallbackPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    async function handleAuth() {
      if (!auth) return;
      
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // New user from redirect
          const { user } = result;
           const userRef = doc(db, 'users', user.uid);
           await setDoc(userRef, {
             displayName: user.displayName,
             email: user.email,
             photoURL: user.photoURL,
             lastLogin: serverTimestamp()
           }, { merge: true });
        }
      } catch (error) {
         // This can happen if the page is reloaded, it's usually not a critical error.
        console.log("getRedirectResult error, probably page reload:", error);
      }
      
      // Now handle redirection
      const returnTo = sessionStorage.getItem('returnTo') || searchParams.get('returnTo') || '/';
      if (!loading && user) {
         sessionStorage.removeItem('returnTo');
         router.replace(returnTo);
      }
      if (!loading && !user) {
        // If auth process is complete and there's no user, go to login.
        router.replace('/login');
      }
    }
    
    handleAuth();

  }, [user, loading, auth, router, searchParams]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">
        Please wait while we sign you in...
      </p>
    </div>
  );
}

    