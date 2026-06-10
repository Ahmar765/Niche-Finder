'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ensureAuthReady } from '@/firebase/config';
import { useAuth } from '@/firebase/provider';
import { finalizeAuthSession } from '@/firebase/auth/post-auth';
import { signInWithGoogle } from '@/firebase/auth/google-sign-in';
import { initializeNewUser, type NewUser } from '@/backend/initialize-new-user';
import { getBootstrapRedirect, type BootstrapAccountId } from '@/config/bootstrap-accounts';
import { AccountTypeSelect } from '@/components/auth/account-type-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getFirebaseAuthErrorMessage } from '@/firebase/auth/error-messages';

function toNewUser(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null; emailVerified: boolean }): NewUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isVerified: user.emailVerified,
  };
}

export function SignUp({ onInitializeUser }: { onInitializeUser?: (user: NewUser) => void }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [accountType, setAccountType] = useState<BootstrapAccountId>('operator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const auth = useAuth();
  const { toast } = useToast();

  const handleAccountTypeChange = (next: BootstrapAccountId) => {
    setAccountType(next);
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoadingGoogle(true);
      await signInWithGoogle(auth, (user) => {
        const payload = toNewUser(user);
        if (onInitializeUser) {
          void onInitializeUser(payload);
        } else {
          void initializeNewUser(payload);
        }
      });
    } catch (error: any) {
      console.error("Google sign up failed:", error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: getFirebaseAuthErrorMessage(error),
      });
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoadingEmail(true);
      await ensureAuthReady();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const payload: NewUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isVerified: userCredential.user.emailVerified,
        password,
      };

      if (onInitializeUser) {
        await onInitializeUser(payload);
      } else {
        await initializeNewUser(payload);
      }

      await finalizeAuthSession(
        userCredential.user,
        getBootstrapRedirect(userCredential.user.email, password)
      );
    } catch (error: any) {
      console.error("Email sign up failed:", error);
      toast({
        variant: 'destructive',
        title: 'Account Creation Failed',
        description: getFirebaseAuthErrorMessage(error),
      });
      setIsLoadingEmail(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-2xl bg-gradient-to-b from-card to-secondary/5">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create Operator Profile</CardTitle>
        <CardDescription>
          Join 12,500+ founders building with the Venture OS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AccountTypeSelect value={accountType} onChange={handleAccountTypeChange} />

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Work Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="signup-email"
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Secure Password</Label>
            <Input 
                id="signup-password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold uppercase tracking-widest"
            disabled={isLoadingEmail || isLoadingGoogle}
          >
            {isLoadingEmail ? <Loader2 className="animate-spin h-4 w-4" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            Initialize Account
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-bold tracking-tighter">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/20 hover:bg-primary/5"
          onClick={handleGoogleSignUp}
          disabled={isLoadingGoogle || isLoadingEmail}
        >
          {isLoadingGoogle ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.2 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
          )}
          Google Accelerator
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border/40 pt-6">
        <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <ShieldCheck className="h-3 w-3" />
            Venture Credits (100 ACU) Included
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
