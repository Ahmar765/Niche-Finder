'use client';

import { useState, useEffect } from 'react';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

interface CollectionState<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

export const useCollection = <T extends DocumentData>(query: Query<T> | null) => {
  const [collectionState, setCollectionState] = useState<CollectionState<T>>({
    data: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setCollectionState({ data: [], isLoading: false, error: null });
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ ...(doc.data() as T), id: doc.id }));
        setCollectionState({ data, isLoading: false, error: null });
      },
      (err) => {
        const path = (query as { _query?: { path?: { segments: string[] } } })._query?.path?.segments?.join('/') ?? 'unknown';
        const isPermissionDenied =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code?: string }).code === 'permission-denied';

        if (isPermissionDenied) {
          const permissionError = new FirestorePermissionError({ path, operation: 'list' });
          console.warn('[Firestore] Permission denied:', path);
          setCollectionState({ data: [], isLoading: false, error: permissionError });
          return;
        }

        setCollectionState({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    );

    return () => unsubscribe();
  }, [query]);

  return collectionState;
};
