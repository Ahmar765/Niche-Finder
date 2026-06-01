'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowDownToLine, Share, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    
    // Detect if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasDismissed = localStorage.getItem('pwaInstallDismissed');

    if (isStandalone || hasDismissed) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIOSDevice);
    
    if (isIOSDevice) {
        // Show iOS prompt after a shorter delay for better visibility
        setTimeout(() => setShowPrompt(true), 3000);
    } else {
        // Listen for the install prompt event on other devices
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    
    return () => {
      if (!isIOSDevice) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);
  
  useEffect(() => {
    // If the event is captured, show the prompt (for non-iOS)
    if(installPromptEvent) {
       setShowPrompt(true);
    }
  }, [installPromptEvent]);

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    
    const promptEvent = installPromptEvent as any;
    promptEvent.prompt();
    
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    }
    
    setInstallPromptEvent(null);
    setShowPrompt(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  const promptContent = isIos ? (
    <>
        <CardHeader className="relative">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={handleDismiss}><X className="h-4 w-4"/></Button>
            <CardTitle className="text-base">Add Venture OS to Home Screen</CardTitle>
            <CardDescription className="text-xs">For the best operator experience on iOS.</CardDescription>
        </CardHeader>
        <CardContent className="text-xs space-y-3 pb-6">
            <p className="flex items-center gap-2">1. Tap the <Share className="h-4 w-4 text-primary" /> icon in the Safari toolbar.</p>
            <p>2. Scroll down and select 'Add to Home Screen'.</p>
            <Button onClick={handleDismiss} size="sm" className="w-full mt-2 font-bold uppercase tracking-widest h-8 text-[10px]">Got it</Button>
        </CardContent>
    </>
  ) : (
    <>
        <CardHeader className="relative">
             <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={handleDismiss}><X className="h-4 w-4"/></Button>
            <CardTitle className="text-base">Install Venture OS</CardTitle>
            <CardDescription className="text-xs">Get faster, offline access to your venture repositories.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2 pb-6">
            <Button onClick={handleInstall} className="w-full h-9 text-xs font-bold uppercase tracking-widest">
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Install App
            </Button>
            <Button variant="ghost" onClick={handleDismiss} className="w-full h-9 text-xs">Maybe Later</Button>
        </CardContent>
    </>
  );

  return (
    <AnimatePresence>
        {showPrompt && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 left-4 right-4 z-[200] sm:max-w-md sm:left-auto mb-safe"
            >
                <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
                    {promptContent}
                </Card>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export { PwaInstallPrompt };