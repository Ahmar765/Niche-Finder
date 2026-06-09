import { redirect } from 'next/navigation';

export default function GovRedirectPage() {
  redirect('/admin?section=governance');
}
