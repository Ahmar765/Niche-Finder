
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function WebappPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeenPopup = sessionStorage.getItem('hasSeenWebappPopup_v2');
            if (!hasSeenPopup) {
                setIsOpen(true);
            }
        }, 3000); // Delay to let the user browse a bit
        
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        sessionStorage.setItem('hasSeenWebappPopup_v2', 'true');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Welcome to Niche Finder
                    </DialogTitle>
                    <DialogDescription className="pt-4">
                        Ready to find your next fundable business idea? Our venture intelligence system helps you discover, validate, and plan your next business.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Get started for free and receive bonus credits to explore your first few opportunities.
                    </p>
                </div>
                 <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <Link href="/signup" onClick={handleClose}>
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
