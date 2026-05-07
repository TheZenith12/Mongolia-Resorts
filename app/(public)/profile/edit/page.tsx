import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCurrentProfile } from '@/lib/actions/auth';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

export const metadata = { title: 'Профайл засах' };

export default async function ProfileEditPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/auth/login?redirect=/profile/edit');

  return (
    <div className="page-container py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/profile/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-forest-500 hover:text-forest-700 transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Буцах
        </Link>

        <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">
          Профайл засах
        </h1>

        <div className="card p-8">
          <ProfileEditForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
