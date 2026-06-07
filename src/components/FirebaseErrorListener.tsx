'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn('[Firestore] Permission error:', error.message);
    };

    const unsubscribe = errorEmitter.on('permission-error', handleError);

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
