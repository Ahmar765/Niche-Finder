'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { initializeNewUser, type NewUser } from '@/backend/actions';
import { finalizeAuthSession } from '@/firebase/auth/post-auth';
import { consumeAuthRedirectResult } from '@/firebase/auth/redirect-handler';
import { SignUp } from '@/components/auth/sign-up';
import { Loader2 } from 'lucide-react';

export default function SignUpPage() {
    const auth = useAuth();
    const { isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const handleInitializeUser = async (user: NewUser) => {
        await initializeNewUser(user);
    };

    useEffect(() => {
        let active = true;

        const finishRedirectSignUp = async () => {
            try {
                const result = await consumeAuthRedirectResult(auth);
                if (!active) return;

                const signedInUser = result?.user ?? auth.currentUser;
                if (signedInUser) {
                    handleInitializeUser({
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
                console.error('Sign up redirect failed:', error);
                toast({
                    variant: 'destructive',
                    title: 'Sign Up Failed',
                    description: error instanceof Error ? error.message : 'Google sign-up failed.',
                });
            } finally {
                if (active) {
                    setIsCheckingAuth(false);
                }
            }
        };

        finishRedirectSignUp();
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
            <SignUp onInitializeUser={handleInitializeUser} />
        </div>
    );
}
