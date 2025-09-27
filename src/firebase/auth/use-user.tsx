
'use client';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';

export const useUser = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);

        // If we get a user and they are on the login page, redirect them.
        if (user && pathname === '/login') {
            const returnTo = sessionStorage.getItem('returnTo') || '/';
            sessionStorage.removeItem('returnTo');
            router.replace(returnTo);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, pathname, router]);

  return { user, loading };
};
