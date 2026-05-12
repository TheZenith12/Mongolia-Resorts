import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PlaceSubmitForm from '@/components/places/PlaceSubmitForm';

export const metadata = { title: 'Газар нэмэх — Монгол Нутаг' };

export default async function PlaceSubmitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login?redirect=/places/submit');

  return (
    <div className="min-h-screen bg-cream">
      <div className="page-container py-12">
        <PlaceSubmitForm />
      </div>
    </div>
  );
}
