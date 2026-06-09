'use client';

import { Globe, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/i18n';
import { cn } from '@/shared/utils';

type LanguageSwitcherProps = {
  variant?: 'ghost' | 'outline';
  className?: string;
};

export function LanguageSwitcher({ variant = 'ghost', className }: LanguageSwitcherProps) {
  const { t, lang, localePreference, setLocalePreference, isMounted } = useLocale();

  const currentLabel =
    localePreference === 'auto'
      ? t('language.auto')
      : t(`language.${lang}` as 'language.en');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn('gap-1.5 text-xs font-medium', className)}
          aria-label={t('language.label')}
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline max-w-[7rem] truncate">
            {isMounted ? currentLabel : t('language.en')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t('language.label')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setLocalePreference('auto')}
          className="flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
            {t('language.auto')}
          </span>
          {localePreference === 'auto' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {(['en', 'es', 'fr'] as const).map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocalePreference(code)}
            className="flex items-center justify-between gap-2"
          >
            <span>{t(`language.${code}`)}</span>
            {localePreference === code && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
