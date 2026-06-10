
import type { SeoContentType } from '@nichefinder/domain-types';
import {
  executeGenerateSeoArticle,
  executeAmplifySeoContent,
  executePublishSeoArticle,
} from './seo-article-service';

/** @deprecated Prefer POST /api/seo/generate-article from the client. */
export async function generateAutonomousArticle(userId: string, topic: string, type: SeoContentType) {
  return executeGenerateSeoArticle(userId, topic, type);
}

/** @deprecated Prefer POST /api/seo/amplify from the client. */
export async function amplifyContent(userId: string, articleId: string) {
  return executeAmplifySeoContent(userId, articleId);
}

/** @deprecated Prefer POST /api/seo/publish from the client. */
export async function publishArticle(userId: string, articleId: string) {
  return executePublishSeoArticle(userId, articleId);
}
