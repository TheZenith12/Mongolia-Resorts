import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { getCoupons } from '@/lib/actions/coupons';
import CouponsClient from './CouponsClient';

export const metadata = { title: 'Купонууд' };

export default async function CouponsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const coupons = await getCoupons().catch(() => []);

  return <CouponsClient initialCoupons={coupons} />;
}
