// This page is necessary to handle the client-side redirect from Firebase's
// getRedirectResult() method for OAuth providers like Google.
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
      
      const returnTo = sessionStorage.getItem('returnTo') || searchParams.get('returnTo') || '/';
      
      // We wait for the auth state to be confirmed before redirecting.
      // The `useUser` hook will have `loading = false` and a `user` object
      // once the auth state is resolved.
      if (!loading && user) {
         sessionStorage.removeItem('returnTo');
         router.replace(returnTo);
      } else if (!loading && !user) {
        // If auth process is complete and there's no user, go to login.
        // This can happen if the user cancels the sign-in with the provider.
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
