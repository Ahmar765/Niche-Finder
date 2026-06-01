'use client';
import { useEffect } from 'react';
import { incrementBlogPostView } from '@/backend/actions';

/**
 * A client component that increments the view count of a blog post.
 * This should be used once on a blog post page. It fires and forgets.
 */
export function BlogPostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (postId) {
      incrementBlogPostView(postId);
    }
  }, [postId]);

  return null;
}
