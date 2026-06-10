'use client';

import { Loader2 } from 'lucide-react';
import type { SeoArticle } from '@nichefinder/domain-types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils';

type SeoArticleDetailSheetProps = {
  article: SeoArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTypeLabel?: string;
  onAmplify?: (articleId: string) => void;
  onPublish?: (articleId: string) => void;
  isAmplifying?: boolean;
  isPublishing?: boolean;
};

export function SeoArticleDetailSheet({
  article,
  open,
  onOpenChange,
  contentTypeLabel,
  onAmplify,
  onPublish,
  isAmplifying,
  isPublishing,
}: SeoArticleDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        {article ? (
          <>
            <SheetHeader className="border-b px-6 py-4 text-left space-y-3">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/20 text-primary">
                  {contentTypeLabel ?? article.contentType}
                </Badge>
                <Badge
                  className={cn(
                    'text-[9px] uppercase tracking-widest',
                    article.status === 'published'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                  )}
                >
                  {article.status === 'published' ? 'Live' : 'Draft'}
                </Badge>
              </div>
              <SheetTitle className="text-xl font-bold leading-tight">{article.title}</SheetTitle>
              <p className="text-xs text-muted-foreground font-mono">/{article.slug}</p>
              {article.seoMetadata?.description && (
                <p className="text-sm text-muted-foreground">{article.seoMetadata.description}</p>
              )}
              {article.status === 'draft' && (
                <div className="flex gap-2 pt-1">
                  {onAmplify && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isAmplifying || isPublishing}
                      onClick={() => onAmplify(article.id)}
                    >
                      {isAmplifying ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Amplify'}
                    </Button>
                  )}
                  {onPublish && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isAmplifying || isPublishing}
                      onClick={() => onPublish(article.id)}
                    >
                      {isPublishing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Publish'}
                    </Button>
                  )}
                </div>
              )}
            </SheetHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              {article.seoMetadata?.keywords?.length ? (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {article.seoMetadata.keywords.slice(0, 12).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-[10px]">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{article.content}</div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
