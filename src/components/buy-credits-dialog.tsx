
'use client';

import { useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { CreditCard, Loader2, PlusCircle, Search, Sparkles, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createTopupSession } from '@/backend/actions';
import { cn } from '@/shared/utils';
import { ACU_TOP_UP_PACKAGES } from '@/config/acuPackages';

const creditPackages = ACU_TOP_UP_PACKAGES;

export function BuyCreditsDialog() {
  const { toast } = useToast();
  const { user } = useUser();
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const handlePayment = async (packageId: string) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'Please log in to purchase credits.',
        });
        return;
    }

    setIsRedirecting(packageId);
    
    const result = await createTopupSession({ packageId });

    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: result.error,
        });
        setIsRedirecting(null);
    } else if (result.url) {
        window.location.href = result.url;
    } else {
         toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: 'Could not create a payment session. Please try again.',
        });
        setIsRedirecting(null);
    }
  };

  const formatGbp = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Top Up Your ACU Wallet</DialogTitle>
          <DialogDescription>
            ACUs power your venture outputs. Choose a package to continue generating financial models, business plans, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {creditPackages.map((pkg) => {
            return (
              <div
                key={pkg.id}
                onClick={() => handlePayment(pkg.id)}
                className={cn(
                    "relative rounded-lg border-2 p-4 text-center cursor-pointer hover:border-primary transition-all group",
                    pkg.recommended ? "border-primary shadow-primary/20 shadow-lg" : "border-border"
                )}
              >
                {pkg.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-3 py-0.5 text-xs font-bold shadow-lg">
                        POPULAR
                    </div>
                )}
                 {pkg.bonusACUs > 0 && !pkg.recommended && (
                    <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1 shadow-md">
                        <Star className="h-3 w-3" />
                    </div>
                )}
                {isRedirecting === pkg.id && <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg"><Loader2 className="animate-spin" /></div>}
                
                <h3 className="font-bold text-lg text-primary transition-colors group-hover:text-primary/90">{pkg.name}</h3>
                
                <div className="my-2">
                    <span className="text-4xl font-bold">{pkg.totalACUs.toLocaleString()}</span>
                    <span className="text-lg text-muted-foreground ml-1">ACUs</span>
                </div>

                <p className="text-xs text-muted-foreground">
                    {pkg.bonusACUs > 0 ? `(${pkg.acus.toLocaleString()} + ${pkg.bonusACUs.toLocaleString()} bonus)` : ` `}
                </p>
                
                <div className="mt-4 font-semibold text-xl">{formatGbp(pkg.priceGBP)}</div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
            <p className="text-xs text-muted-foreground">Secure payments are powered by Stripe. You'll be redirected to complete your purchase.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
