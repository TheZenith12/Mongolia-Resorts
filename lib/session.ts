import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user as {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'user' | 'manager' | 'super_admin';
    assigned_place_id?: string;
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!['super_admin', 'manager'].includes((user as any).role)) {
    throw new Error('Эрх хүрэлцэхгүй');
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if ((user as any).role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }
  return user;
}
