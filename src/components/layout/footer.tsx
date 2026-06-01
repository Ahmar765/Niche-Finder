
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Terms of Use', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Disclaimer', href: '/disclaimer' },
    { name: 'Cookies', href: '/cookies' },
  ],
  connect: [
    { name: 'LinkedIn', href: '#' },
    { name: 'Twitter / X', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Niche Finder</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI Operating System for Venture Creation. Discover, validate, and build your next investor-ready business.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">Platform</h3>
              <nav className="mt-4 space-y-2 text-sm">
                {footerLinks.platform.map(link => (
                  <Link key={link.name} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors">{link.name}</Link>
                ))}
              </nav>
            </div>
             <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">Legal</h3>
              <nav className="mt-4 space-y-2 text-sm">
                 {footerLinks.legal.map(link => (
                   <Link key={link.name} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors">{link.name}</Link>
                ))}
              </nav>
            </div>
             <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary">Connect</h3>
              <nav className="mt-4 space-y-2 text-sm">
                 {footerLinks.connect.map(link => (
                   <a key={link.name} href={link.href} className="block text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">{link.name}</a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="text-center text-sm text-muted-foreground sm:text-left">
            <p>&copy; {new Date().getFullYear()} Niche Finder Ltd. All rights reserved.</p>
            <p className="mt-2">
                Use of Niche Finder is subject to our <Link href="/terms" className="underline hover:text-foreground">Terms of Use</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
