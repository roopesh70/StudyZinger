'use client';
import { useEffect } from 'react';
import { useAuth } from '@/firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, GraduationCap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const auth = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!auth) return;

    // After a redirect, the getRedirectResult promise is rejected.
    // This is the intended behavior, so we catch the error to prevent
    // it from being thrown.
    getRedirectResult(auth).catch(() => {});
  }, [auth]);

  const handleLogin = async () => {
    if (!auth) return;

    const provider = new GoogleAuthProvider();
    const returnTo = searchParams.get('returnTo') || '/targets';

    // Store the returnTo path in session storage so the callback page can
    // access it.
    sessionStorage.setItem('returnTo', returnTo);

    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error during sign-in redirect:', error);
    }
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <GraduationCap className="size-10 text-primary" />
        <h1 className="font-script text-6xl text-primary">zinger</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            Sign in to access your personalized study plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            className="w-full"
            variant="default"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 11.8 244 11.8c70.3 0 129.8 27.8 175.3 74.3l-66.2 63.8C321.3 122.3 286.2 101.8 244 101.8c-63.9 0-116.3 52.3-116.3 116.3s52.4 116.3 116.3 116.3c69.1 0 106.3-43.9 111.3-66.9H244v-83.8h235.9c2.3 12.7 3.6 26.4 3.6 40.9z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
