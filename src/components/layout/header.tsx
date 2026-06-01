
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Coins, LogOut, Sparkles, ShieldCheck, User, Briefcase, LogIn, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import { useUser } from '@/firebase/auth/use-user';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BuyCreditsDialog } from '../buy-credits-dialog';
import { useLocale } from '@/i18n';
import { Skeleton } from '../ui/skeleton';

const AppHeader = () => {
    const { user, isLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { t } = useLocale();

    const userRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const walletRef = useMemo(() => (user && firestore ? doc(firestore, 'wallets', user.uid) : null), [user, firestore]);

    const { data: userData } = useDoc(userRef);
    const { data: wallet } = useDoc(walletRef);

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('');
    };

    const isAnyAdmin = useMemo(() => {
        if (!userData?.roles) return false;
        const adminRoles = ['admin', 'super_admin', 'finance_admin', 'support_admin'];
        return userData.roles.some((role: string) => adminRoles.includes(role));
    }, [userData]);

    const isSuperAdmin = useMemo(() => {
        if (!userData?.roles) return false;
        return userData.roles.includes('super_admin');
    }, [userData]);

    const handleSignOut = () => {
        if (auth) {
        signOut(auth);
        }
    };
    
    return (
        <>
            <div className="mr-2 flex items-center">
                <Link href="/" className="mr-4 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm sm:text-base inline-block">
                    {t('header.title')}
                    </span>
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
                {user && wallet && (
                    <div className="hidden sm:flex items-center space-x-2 rounded-full border border-primary/50 bg-secondary px-3 py-1 text-xs font-medium text-primary">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t('header.acu', { count: wallet.totalAvailableAcu ?? 0 })}</span>
                    </div>
                )}

                {user && <BuyCreditsDialog />}

                {isLoading ? (
                    <Skeleton className="h-10 w-24 rounded-md" />
                ) : user ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || 'User'} />
                            <AvatarFallback>{getInitials(userData?.displayName)}</AvatarFallback>
                        </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userData?.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <User className="mr-2 h-4 w-4" />
                                <span>{t('header.dashboard')}</span>
                            </Link>
                        </DropdownMenuItem>
                        {isAnyAdmin && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/admin">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/seo">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                <span>SEO Command Center</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                        )}
                        {isSuperAdmin && (
                        <DropdownMenuItem asChild>
                            <Link href="/gov">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>{t('header.governmentMode')}</span>
                            </Link>
                        </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('header.logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                    <Button size="sm" variant="outline" asChild>
                    <Link href="/signup">
                        Sign Up
                    </Link>
                    </Button>
                    <Button size="sm" asChild>
                    <Link href="/signin">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                    </Link>
                    </Button>
                    </>
                )}
            </div>
        </>
    );
};

const MarketingHeader = () => {
    const navLinks = [
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
    ];
    return (
        <>
            <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2 text-white">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="font-bold sm:inline-block">Niche Finder</span>
                </Link>
            </div>
            <nav className="hidden items-center gap-8 text-sm lg:flex flex-1 justify-center">
                {navLinks.map(link => (
                    <Link key={link.name} href={link.href} className="text-slate-300 hover:text-white transition-colors">
                        {link.name}
                    </Link>
                ))}
            </nav>
            <div className="flex items-center justify-end gap-2 sm:gap-4">
                 <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:inline-flex" asChild>
                    <Link href="/signin">Login</Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg border-white/20 text-white hover:bg-white/10 hidden sm:inline-flex" asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
                <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/signup">Get Started</Link>
                </Button>
            </div>
        </>
    );
}

export function Header() {
  const pathname = usePathname();
  const isMarketingPage = ['/', '/about', '/how-it-works', '/contact', '/terms', '/privacy', '/disclaimer', '/cookies'].includes(pathname) || pathname.startsWith('/blog');

  return (
    <header className={`sticky top-0 z-50 w-full border-b pt-safe supports-[backdrop-filter]:bg-background/60 ${isMarketingPage ? 'border-white/10 bg-[#040b16]/80 backdrop-blur' : 'border-border/40 bg-background/95 backdrop-blur'}`}>
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        {isMarketingPage ? <MarketingHeader /> : <AppHeader />}
      </div>
    </header>
  );
}
