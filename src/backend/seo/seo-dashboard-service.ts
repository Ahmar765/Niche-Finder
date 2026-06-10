import { adminFirestore } from '@/backend/firebase-admin';
import { ADMIN_ROLES } from '@/config/bootstrap-accounts';
import { buildSeoCommandCenterView, type PlatformSeoEvent } from '@/lib/seo/aggregate-analytics';
import { serializeFirestoreDoc } from '@/backend/serialize-firestore';
import type { SeoArticle, SocialAmplificationTask } from '@nichefinder/domain-types';

export async function isSeoDashboardAdmin(userId: string): Promise<boolean> {
  const userDoc = await adminFirestore.collection('users').doc(userId).get();
  if (!userDoc.exists) return false;
  const roles = (userDoc.data()?.roles ?? []) as string[];
  return roles.some((role) => ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

export async function loadSeoDashboardView() {
  const [articlesSnap, tasksSnap, eventsSnap] = await Promise.all([
    adminFirestore.collection('seo_articles').orderBy('updatedAt', 'desc').limit(50).get(),
    adminFirestore.collection('seo_amplification_tasks').limit(50).get(),
    adminFirestore.collection('platform_events').orderBy('createdAt', 'desc').limit(30).get(),
  ]);

  const articles = articlesSnap.docs.map((doc) =>
    serializeFirestoreDoc(doc.id, doc.data() as Record<string, unknown>),
  ) as unknown as SeoArticle[];

  const tasks = tasksSnap.docs.map((doc) =>
    serializeFirestoreDoc(doc.id, doc.data() as Record<string, unknown>),
  ) as unknown as Array<SocialAmplificationTask & { articleTitle?: string }>;

  const events = eventsSnap.docs.map((doc) =>
    serializeFirestoreDoc(doc.id, doc.data() as Record<string, unknown>),
  ) as PlatformSeoEvent[];

  return buildSeoCommandCenterView(articles, tasks, events);
}
