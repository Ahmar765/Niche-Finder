import { adminFirestore } from '@/backend/firebase-admin';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { marked } from 'marked';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogPostViewTracker } from '@/components/blog-post-view-tracker';

type BlogPostPageProps = {
    params: Promise<{
        slug: string;
    }>;
}

async function getPostBySlug(slug: string) {
    try {
        if (!adminFirestore) return null;
        
        const postsRef = adminFirestore.collection('blog_posts');
        const q = postsRef.where('slug', '==', slug).where('status', '==', 'published').limit(1);
        
        const snapshot = await q.get().catch(err => {
            console.warn(`[BlogPostPage] Sync Note for ${slug}:`, err.message);
            return null;
        });

        if (!snapshot || snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        let author = { name: 'Niche Finder Team', image: '' };
        if (data.authorId) {
            try {
                const authorDoc = await adminFirestore.collection('users').doc(data.authorId).get();
                if(authorDoc.exists) {
                    const authorData = authorDoc.data();
                    author = { name: authorData?.displayName || 'Niche Finder Team', image: authorData?.photoURL || '' };
                }
            } catch (e) {
                // Ignore author fetch failures
            }
        }

        return {
            id: doc.id,
            title: data.title,
            content: data.content,
            publishedAt: data.publishedAt?.toDate() ? format(data.publishedAt.toDate(), 'PPP') : null,
            author,
        };
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        if (!adminFirestore) return { title: 'Blog | Niche Finder' };
        
        const postsRef = adminFirestore.collection('blog_posts');
        const q = postsRef.where('slug', '==', slug).limit(1);
        const snapshot = await q.get().catch(() => null);
    
        if (!snapshot || snapshot.empty) {
            return { title: 'Post Not Found' };
        }
        const post = snapshot.docs[0].data();
    
        return {
            title: post.seoTitle,
            description: post.seoDescription,
            keywords: post.seoKeywords,
            openGraph: {
                title: post.seoTitle,
                description: post.seoDescription,
                type: 'article',
                publishedTime: post.publishedAt?.toDate()?.toISOString(),
            },
        };
    } catch (error) {
        return { title: 'Blog | Niche Finder' };
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const parsedContent = await marked.parse(post.content);

    return (
         <div className="bg-[#040b16] text-white min-h-screen">
             <BlogPostViewTracker postId={post.id} />
             <main className="container mx-auto px-6 py-16">
                 <article className="max-w-3xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
                           {post.title}
                        </h1>

                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Avatar>
                                <AvatarImage src={post.author.image} alt={post.author.name} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-slate-300">{post.author.name}</p>
                                {post.publishedAt && (
                                    <p className="text-sm text-slate-400">
                                       Published on {post.publishedAt}
                                    </p>
                                )}
                            </div>
                        </div>
                    </header>

                    <div 
                        className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: parsedContent }} 
                    />
                 </article>
             </main>
         </div>
    );
}
