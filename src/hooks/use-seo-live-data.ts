'use client';

import { useMemo } from 'react';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { SeoArticle, SocialAmplificationTask } from '@nichefinder/domain-types';
import {
  buildSeoCommandCenterView,
  type SeoCommandCenterView,
} from '@/lib/seo/aggregate-analytics';

export function useSeoLiveData(enabled: boolean): {
  data: SeoCommandCenterView | null;
  isLoading: boolean;
} {
  const firestore = useFirestore();

  const articlesQuery = useMemo(
    () =>
      enabled && firestore
        ? query(collection(firestore, 'seo_articles'), orderBy('updatedAt', 'desc'), limit(50))
        : null,
    [enabled, firestore],
  );

  const tasksQuery = useMemo(
    () =>
      enabled && firestore
        ? query(collection(firestore, 'seo_amplification_tasks'), limit(50))
        : null,
    [enabled, firestore],
  );

  const eventsQuery = useMemo(
    () =>
      enabled && firestore
        ? query(collection(firestore, 'platform_events'), orderBy('createdAt', 'desc'), limit(30))
        : null,
    [enabled, firestore],
  );

  const { data: articles, isLoading: articlesLoading } = useCollection(articlesQuery);
  const { data: tasks, isLoading: tasksLoading } = useCollection(tasksQuery);
  const { data: events, isLoading: eventsLoading } = useCollection(eventsQuery);

  const data = useMemo(() => {
    if (!enabled) return null;
    return buildSeoCommandCenterView(
      articles as SeoArticle[],
      tasks as Array<SocialAmplificationTask & { articleTitle?: string }>,
      events,
    );
  }, [enabled, articles, tasks, events]);

  return {
    data,
    isLoading: enabled && (articlesLoading || tasksLoading || eventsLoading),
  };
}
