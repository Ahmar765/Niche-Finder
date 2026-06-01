'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { SignIn } from '@/components/auth/sign-in';
import { finalizeAuthSession } from '@/firebase/auth/post-auth';
import { consumeAuthRedirectResult } from '@/firebase/auth/redirect-handler';
import { initializeNewUser } from '@/backend/actions';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
    const auth = useAuth();
    const { isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        let active = true;

        const finishRedirectSignIn = async () => {
            try {
                const result = await consumeAuthRedirectResult(auth);
                if (!active) return;

                const signedInUser = result?.user ?? auth.currentUser;
                if (signedInUser) {
                    void initializeNewUser({
                        uid: signedInUser.uid,
                        email: signedInUser.email,
                        displayName: signedInUser.displayName,
                        photoURL: signedInUser.photoURL,
                        isVerified: signedInUser.emailVerified,
                    });
                    await finalizeAuthSession(signedInUser);
                }
            } catch (error: unknown) {
                if (!active) return;
                console.error('Sign in redirect failed:', error);
                toast({
                    variant: 'destructive',
                    title: 'Sign In Failed',
                    description: error instanceof Error ? error.message : 'Google sign-in failed.',
                });
            } finally {
                if (active) {
                    setIsCheckingAuth(false);
                }
            }
        };

        finishRedirectSignIn();
        return () => { active = false; };
    }, [auth, toast]);

    if (isUserLoading || isCheckingAuth) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
            <SignIn />
        </div>
    );
}
