'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLocale } from '@/i18n';

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const platformLinks = [
    { name: t('footer.howItWorks'), href: '/how-it-works' },
    { name: t('footer.aboutUs'), href: '/about' },
    { name: t('footer.blog'), href: '/blog' },
    { name: t('footer.contact'), href: '/contact' },
  ];

  const legalLinks = [
    { name: t('footer.terms'), href: '/terms' },
    { name: t('footer.privacy'), href: '/privacy' },
    { name: t('footer.disclaimer'), href: '/disclaimer' },
    { name: t('footer.cookies'), href: '/cookies' },
  ];

  const connectLinks = [
    { name: t('footer.linkedin'), href: '#' },
    { name: t('footer.twitter'), href: '#' },
  ];

  const legalNotice = t('footer.legalNotice')
    .replace('{terms}', `__TERMS__`)
    .replace('{privacy}', `__PRIVACY__`);

  const [beforeTerms, afterTerms] = legalNotice.split('__TERMS__');
  const [middle, afterPrivacy] = (afterTerms ?? '').split('__PRIVACY__');

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{t('header.title')}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">{t('footer.platform')}</h3>
              <nav className="mt-4 space-y-2 text-sm">
                {platformLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors">{link.name}</Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">{t('footer.legal')}</h3>
              <nav className="mt-4 space-y-2 text-sm">
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors">{link.name}</Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">{t('footer.connect')}</h3>
              <nav className="mt-4 space-y-2 text-sm">
                {connectLinks.map((link) => (
                  <a key={link.name} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">{link.name}</a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="text-center text-sm text-muted-foreground sm:text-left">
            <p>{t('footer.copyright', { year })}</p>
            <p className="mt-2">
              {beforeTerms}
              <Link href="/terms" className="underline hover:text-foreground">{t('footer.terms')}</Link>
              {middle}
              <Link href="/privacy" className="underline hover:text-foreground">{t('footer.privacy')}</Link>
              {afterPrivacy}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
