// This page is necessary to handle the client-side redirect from Firebase's
// getRedirectResult() method. It allows the app to complete the sign-in
// flow and then redirect the user to the page they were originally trying
// to access.
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    // If the user is loaded and authenticated, redirect them.
    if (!loading && user) {
      router.replace(returnTo);
    }
    // If the user is not authenticated after the check,
    // something went wrong, so send them to the login page.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, returnTo]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">
        Please wait while we sign you in...
      </p>
    </div>
  );
}
