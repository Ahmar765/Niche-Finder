'use client';

import { useState, useEffect } from 'react';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface DocState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export const useDoc = <T extends DocumentData>(docRef: DocumentReference<T> | null) => {
  const [docState, setDocState] = useState<DocState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!docRef) {
      setDocState({ data: null, isLoading: false, error: null });
      return;
    }
    
    setDocState({ data: null, isLoading: true, error: null });

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setDocState({
            data: { id: snapshot.id, ...snapshot.data() } as T,
            isLoading: false,
            error: null,
          });
        } else {
          setDocState({ data: null, isLoading: false, error: null });
        }
      },
      (err) => {
        const isPermissionDenied =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code?: string }).code === 'permission-denied';

        if (isPermissionDenied) {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
          });
          console.warn('[Firestore] Permission denied:', docRef.path);
          setDocState({ data: null, isLoading: false, error: permissionError });
          return;
        }

        setDocState({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return docState;
};
