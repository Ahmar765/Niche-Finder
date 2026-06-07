'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signInAnonymously, 
} from 'firebase/auth';
import { ensureAuthReady } from '@/firebase/config';
import { useAuth } from '@/firebase/provider';
import { finalizeAuthSession } from '@/firebase/auth/post-auth';
import { initializeNewUser } from '@/backend/actions';
import { getBootstrapRedirect, type BootstrapAccountId } from '@/config/bootstrap-accounts';
import { AccountTypeSelect } from '@/components/auth/account-type-select';
import { signInWithGoogle } from '@/firebase/auth/google-sign-in';
import { getFirebaseAuthErrorMessage } from '@/firebase/auth/error-messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Sparkles, LogIn, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function SignIn() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [accountType, setAccountType] = useState<BootstrapAccountId>('operator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = useAuth();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoadingEmail(true);
      await ensureAuthReady();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await initializeNewUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isVerified: userCredential.user.emailVerified,
        password,
      });
      await finalizeAuthSession(
        userCredential.user,
        getBootstrapRedirect(userCredential.user.email, password)
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: getFirebaseAuthErrorMessage(error),
      });
      setIsLoadingEmail(false);
    }
  };

  const handleSignIn = async (provider: 'google' | 'anonymous') => {
    try {
      await ensureAuthReady();

      if (provider === 'google') {
        setIsLoadingGoogle(true);
        await signInWithGoogle(auth, (signedInUser) => {
          void initializeNewUser({
            uid: signedInUser.uid,
            email: signedInUser.email,
            displayName: signedInUser.displayName,
            photoURL: signedInUser.photoURL,
            isVerified: signedInUser.emailVerified,
          });
        });
      } else {
        setIsLoadingGuest(true);
        const userCredential = await signInAnonymously(auth);
        await finalizeAuthSession(userCredential.user);
      }
    } catch (error: any) {
      console.error(`Sign in with ${provider} failed:`, error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: getFirebaseAuthErrorMessage(error),
      });
      setIsLoadingGoogle(false);
      setIsLoadingGuest(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-2xl">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Operator Login</CardTitle>
        <CardDescription>Enter your credentials to command the OS.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AccountTypeSelect value={accountType} onChange={setAccountType} />

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="signin-email"
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input 
                id="signin-password"
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
            disabled={isLoadingEmail || isLoadingGoogle || isLoadingGuest}
          >
            {isLoadingEmail ? <Loader2 className="animate-spin h-4 w-4" /> : <LogIn className="h-4 w-4 mr-2" />}
            Secure Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-bold tracking-tighter">Alternative Access</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn('google')}
            disabled={isLoadingGoogle || isLoadingGuest || isLoadingEmail}
            >
            {isLoadingGoogle ? (
                <Loader2 className="animate-spin h-4 w-4" />
            ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.2 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
            )}
            Google
            </Button>
            <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleSignIn('anonymous')}
            disabled={isLoadingGoogle || isLoadingGuest || isLoadingEmail}
            >
            {isLoadingGuest ? (
                <Loader2 className="animate-spin h-4 w-4" />
            ) : (
                <User className="h-4 w-4 mr-2" />
            )}
            Guest
            </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t border-border/40 pt-6">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
