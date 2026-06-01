
'use client';

import { NicheExplorer } from '@/components/niche-explorer';
import { useLocale } from '@/i18n';

export default function SearchPage() {
  const { t } = useLocale();
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
       <section className="text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Business Discovery OS
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your journey from idea to execution starts here. Guide the venture intelligence OS to discover your next opportunity.
        </p>
      </section>
      <NicheExplorer />
    </div>
  );
}
