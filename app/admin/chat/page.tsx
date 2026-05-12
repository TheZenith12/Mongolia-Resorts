import { Metadata } from 'next';
import AdminChatClient from '@/components/admin/AdminChatClient';

export const metadata: Metadata = { title: 'Чат — Admin' };

export default function AdminChatPage() {
  return <AdminChatClient />;
}
