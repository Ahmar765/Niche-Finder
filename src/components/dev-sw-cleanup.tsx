'use client';

import { useEffect } from 'react';

/**
 * Unregister stale service workers in local dev so they do not cache
 * outdated Next.js chunks and cause ChunkLoadError timeouts.
 */
export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });

    if ('caches' in window) {
      void caches.keys().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
  }, []);

  return null;
}
