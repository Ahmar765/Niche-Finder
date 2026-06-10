export type BootstrapAccountId = 'operator' | 'admin' | 'seo' | 'gov';

export type BootstrapAccount = {
  id: BootstrapAccountId;
  label: string;
  description: string;
  email: string;
  password: string;
  roles: string[];
  redirectTo: string;
  /** Admin ACU balance granted to test accounts (unlocks paid features). */
  acuGrant: number;
};

/** Demo / bootstrap accounts — change passwords before production. */
export const BOOTSTRAP_ACCOUNTS: BootstrapAccount[] = [
  {
    id: 'operator',
    label: 'Operator',
    description: 'Standard user dashboard',
    email: 'operator@nichefinder.com',
    password: 'Operator@2026!',
    roles: ['user'],
    redirectTo: '/dashboard',
    acuGrant: 1000,
  },
  {
    id: 'admin',
    label: 'Super Admin',
    description: 'Unified command center — platform, SEO & governance',
    email: 'admin@nichefinder.com',
    password: 'Admin@2026!',
    roles: ['user', 'admin', 'super_admin'],
    redirectTo: '/admin',
    acuGrant: 10000,
  },
  {
    id: 'seo',
    label: 'Super Admin (SEO alias)',
    description: 'Same unified dashboard — SEO section',
    email: 'seo@nichefinder.com',
    password: 'Seo@2026!',
    roles: ['user', 'admin', 'super_admin'],
    redirectTo: '/admin?section=seo',
    acuGrant: 10000,
  },
  {
    id: 'gov',
    label: 'Super Admin (Gov alias)',
    description: 'Same unified dashboard — governance section',
    email: 'gov@nichefinder.com',
    password: 'Gov@2026!',
    roles: ['user', 'admin', 'super_admin'],
    redirectTo: '/admin?section=governance',
    acuGrant: 10000,
  },
];

/** Account types shown on sign-in / sign-up (SEO & governance live inside Super Admin). */
export const SIGNUP_ACCOUNT_OPTIONS = BOOTSTRAP_ACCOUNTS.filter(
  (account) => account.id === 'operator' || account.id === 'admin',
);

export const ADMIN_ROLES = ['admin', 'super_admin', 'finance_admin', 'support_admin'] as const;

export function getBootstrapAccount(id: BootstrapAccountId): BootstrapAccount {
  return BOOTSTRAP_ACCOUNTS.find((account) => account.id === id) ?? BOOTSTRAP_ACCOUNTS[0];
}

export function resolveBootstrapAccount(
  email: string | null | undefined,
  password?: string
): BootstrapAccount | null {
  if (!email || !password) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const account = BOOTSTRAP_ACCOUNTS.find(
    (entry) => entry.email && entry.email.toLowerCase() === normalizedEmail
  );

  if (!account || account.password !== password) {
    return null;
  }

  return account;
}

export function resolveBootstrapRoles(email: string | null | undefined, password?: string): string[] | null {
  return resolveBootstrapAccount(email, password)?.roles ?? null;
}

export function getBootstrapRedirect(email: string | null | undefined, password?: string): string {
  return resolveBootstrapAccount(email, password)?.redirectTo ?? '/dashboard';
}
