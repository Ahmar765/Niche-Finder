'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // The Next.js development overlay will catch this uncaught exception
      // and display it.
      throw error;
    };

    const unsubscribe = errorEmitter.on('permission-error', handleError);

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
