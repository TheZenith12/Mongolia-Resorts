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
