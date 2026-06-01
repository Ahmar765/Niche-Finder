import { adminFirestore } from '@/backend/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Niche Finder',
  description: 'Articles, insights, and guides on finding and building profitable niche businesses.',
};

async function getPublishedPosts() {
    try {
        if (!adminFirestore) {
            return [];
        }

        const postsRef = adminFirestore.collection('blog_posts');
        const q = postsRef.where('status', '==', 'published').orderBy('publishedAt', 'desc');
        
        // NextJS 15: Handle infrastructure connectivity errors without crashing the component
        const snapshot = await q.get().catch(err => {
            // Log as warning to avoid Next.js Error Overlay in non-critical scenarios
            console.warn("[BlogPage] Metadata Sync Note:", err.message);
            return null;
        });
        
        if (!snapshot || snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                slug: data.slug,
                seoDescription: data.seoDescription,
                publishedAt: data.publishedAt?.toDate() ? format(data.publishedAt.toDate(), 'PPP') : null,
            };
        });
    } catch (error: any) {
        // Silently fail to empty list if environment credentials are not yet synced
        return [];
    }
}


export default async function BlogPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="bg-[#040b16] text-white min-h-screen">
            <main className="container mx-auto px-6 py-16">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
                        Niche Finder Insights
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-300 max-w-3xl mx-auto">
                        Articles, guides, and analysis on discovering and validating profitable business ideas around the world.
                    </p>
                </header>

                {posts.length > 0 ? (
                     <div className="grid gap-8 max-w-4xl mx-auto">
                        {posts.map(post => (
                             <Link key={post.id} href={`/blog/${post.slug}`} passHref>
                                <Card className="bg-white/[0.03] border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                                    <CardHeader>
                                        <CardTitle className="text-2xl group-hover:text-primary transition-colors text-white">{post.title}</CardTitle>
                                         {post.publishedAt && (
                                            <CardDescription className="text-slate-400">{`Published on ${post.publishedAt}`}</CardDescription>
                                         )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-300">{post.seoDescription}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <p className="text-slate-400">Intelligence feed is temporarily initializing. Check back shortly for fresh venture analysis.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
