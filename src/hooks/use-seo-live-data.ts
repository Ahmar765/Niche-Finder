'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SeoCommandCenterView } from '@/lib/seo/aggregate-analytics';

async function fetchSeoDashboard(): Promise<SeoCommandCenterView> {
  const response = await fetch('/api/seo/dashboard', { credentials: 'include' });
  const rawBody = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new Error('SEO dashboard returned an unexpected response.');
  }

  const result = JSON.parse(rawBody) as SeoCommandCenterView & { error?: string };
  if (!response.ok || result.error) {
    throw new Error(result.error ?? 'Failed to load SEO dashboard.');
  }

  return result;
}

export function useSeoLiveData(enabled: boolean): {
  data: SeoCommandCenterView | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<SeoCommandCenterView | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const view = await fetchSeoDashboard();
      setData(view);
    } catch (loadError: unknown) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load SEO dashboard';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
