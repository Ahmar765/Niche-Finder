
'use client';

import { useState, useEffect } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const COOKIE_NAME = 'localConsent';
const COOKIE_EXPIRY_DAYS = 30;

type Consent = {
    necessary: true,
    analytics: boolean,
    marketing: boolean,
}

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    
    const [consent, setConsent] = useState<Consent>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consentCookie = getCookie(COOKIE_NAME);
        if (!consentCookie) {
            setShowBanner(true);
        } else {
            try {
                const parsedConsent = JSON.parse(consentCookie as string);
                setConsent(parsedConsent);
            } catch (e) {
                setShowBanner(true);
            }
        }
    }, []);

    const saveConsent = (newConsent: Consent) => {
        setCookie(COOKIE_NAME, JSON.stringify(newConsent), { maxAge: 60 * 60 * 24 * COOKIE_EXPIRY_DAYS, path: '/' });
        setShowBanner(false);
        setShowPreferences(false);
    };

    const handleAcceptAll = () => {
        saveConsent({ necessary: true, analytics: true, marketing: true });
    };
    
    const handleRejectAll = () => {
        saveConsent({ necessary: true, analytics: false, marketing: false });
    };

    const handleSavePreferences = () => {
        saveConsent(consent);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 bg-background/90 backdrop-blur-sm border-t border-border">
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-foreground">
                        We use cookies to enhance your experience, analyse traffic, and for marketing purposes. You can read our <a href="/cookies" className="underline">Cookies Policy</a> for more details.
                    </p>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" onClick={() => setShowPreferences(true)}>Manage</Button>
                        <Button variant="secondary" onClick={handleRejectAll}>Reject All</Button>
                        <Button onClick={handleAcceptAll}>Accept All</Button>
                    </div>
                </div>
            </div>

            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription>
                            You can manage your cookie preferences here. Some cookies are necessary for the platform to function.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
                            <Label htmlFor="necessary" className="font-bold">Strictly Necessary</Label>
                            <Switch id="necessary" checked disabled />
                        </div>
                         <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="analytics">Analytics & Performance</Label>
                            <Switch id="analytics" checked={consent.analytics} onCheckedChange={(checked) => setConsent(c => ({...c, analytics: checked}))} />
                        </div>
                         <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="marketing">Marketing & Advertising</Label>
                            <Switch id="marketing" checked={consent.marketing} onCheckedChange={(checked) => setConsent(c => ({...c, marketing: checked}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSavePreferences}>Save Preferences</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
