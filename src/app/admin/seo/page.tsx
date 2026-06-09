import { redirect } from 'next/navigation';

export default function SeoAdminRedirectPage() {
  redirect('/admin?section=seo');
}
