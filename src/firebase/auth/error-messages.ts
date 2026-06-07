export function getProvisioningErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('PERMISSION_DENIED') && message.includes('firestore.googleapis.com')) {
    return 'Firestore is not enabled for niche-finder-56a34. Open Firebase Console → Build → Firestore Database → Create database, then retry in a few minutes.';
  }

  if (message.includes('PERMISSION_DENIED')) {
    return 'Server permission denied. Check that Firestore is enabled and GOOGLE_APPLICATION_CREDENTIALS is valid.';
  }

  return message || 'Provisioning failed. Please try again.';
}

export function getFirebaseAuthErrorMessage(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case 'auth/configuration-not-found':
      return 'Email/password sign-in is not enabled in Firebase. Open Firebase Console → niche-finder-56a34 → Authentication → Sign-in method → enable Email/Password, then try again.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password. If this is a test account, sign up first at /signup, then sign in.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Use Sign In instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    default:
      return error.message ?? 'Authentication failed. Please try again.';
  }
}
