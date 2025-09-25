
'use client';

import { useState, useEffect, useMemo } from 'react';
import type {
  Query,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
  CollectionReference,
} from 'firebase/firestore';
import { onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface UseCollectionOptions {
  orderBy?: [string, 'asc' | 'desc'];
  limit?: number;
  where?: [string, any, any];
}

interface CollectionData<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: FirestoreError | FirestorePermissionError | null;
}

export function useCollection<T extends DocumentData>(
  collectionRef: CollectionReference | Query | null,
  options?: UseCollectionOptions
): CollectionData<T> {
  const db = useFirestore();
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | FirestorePermissionError | null>(null);

  // Memoize the query to prevent re-renders
  const finalQuery = useMemo(() => {
    if (!collectionRef) return null;

    let q: Query = collectionRef;

    if (options?.where) {
      q = query(q, where(...options.where));
    }
    if (options?.orderBy) {
      q = query(q, orderBy(...options.orderBy[0], options.orderBy[1]));
    }
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    return q;
  }, [collectionRef, options?.orderBy, options?.limit, options?.where]);


  useEffect(() => {
    if (!db || !finalQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot: QuerySnapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as (T & { id: string })[];
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
            path: finalQuery.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, finalQuery]);

  return { data, loading, error };
}
