'use client';

import { useState, useEffect } from 'react';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
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
        const permissionError = new FirestorePermissionError({
            path: (query as any)._query.path.segments.join('/'),
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setCollectionState({ data: [], isLoading: false, error: permissionError });
      }
    );

    return () => unsubscribe();
  }, [query]);

  return collectionState;
};
