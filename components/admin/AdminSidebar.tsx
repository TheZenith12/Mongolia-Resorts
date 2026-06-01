'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, MapPin, CalendarCheck, Users,
  Star, Settings, LogOut, Leaf, ChevronRight, Building2, CalendarX, MessageCircle, Menu, X, CreditCard,
  Tent, Crown, Key,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import type { Profile } from '@/lib/types';

interface AdminSidebarProps {
  profile: Profile;
  assignedPlaceId?: string | null;
  assignedPlaceName?: string | null;
}

export default function AdminSidebar({
  profile,
  assignedPlaceId,
  assignedPlaceName,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = profile.role === 'super_admin';
  const isManager = profile.role === 'manager';
  const [chatUnread, setChatUnread] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch('/api/chat/unread');
        const d = await res.json();
        setChatUnread(d.count ?? 0);
      } catch { /* ignore */ }
    };
    fetchChat();
    const t = setInterval(fetchChat, 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/admin/pending-count');
        const d = await res.json();
        setPendingCount(d.count ?? 0);
      } catch { /* ignore */ }
    };
    fetchPending();
    const t = setInterval(fetchPending, 30_000);
    return () => clearInterval(t);
  }, [isSuperAdmin]);

  // Мобайлд route өөрчлөгдөхөд sidebar хаана
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Super admin: бүгдийг харна
  // Manager: зөвхөн өөрийн газар
  const navGroups = isSuperAdmin
    ? [
        {
          label: 'Үндсэн',
          items: [
            { href: '/admin',          icon: LayoutDashboard, label: 'Самбар' },
            { href: '/admin/places',   icon: MapPin,          label: 'Газрууд' },
            { href: '/admin/bookings', icon: CalendarCheck,   label: 'Захиалгууд' },
            { href: '/admin/reviews',  icon: Star,            label: 'Сэтгэгдлүүд' },
          ],
        },
        {
          label: 'Удирдлага',
          items: [
            { href: '/admin/chat',     icon: MessageCircle, label: 'Чат' },
            { href: '/admin/payment',  icon: CreditCard,    label: 'Төлбөр тохиргоо' },
            { href: '/admin/users',    icon: Users,         label: 'Хэрэглэгчид' },
            { href: '/admin/settings', icon: Settings,      label: 'Тохиргоо' },
          ],
        },
      ]
    : [
        // Manager: зөвхөн өөрийн газартай холбоотой цэсүүд
        {
          label: 'Миний газар',
          items: [
            { href: '/admin',       icon: LayoutDashboard, label: 'Самбар' },
            { href: '/admin/chat',  icon: MessageCircle,   label: 'Чат' },
            ...(assignedPlaceId
              ? [
                  { href: `/admin/places/${assignedPlaceId}/edit`, icon: Building2,    label: assignedPlaceName ?? 'Миний газар' },
                  { href: '/admin/bookings',                       icon: CalendarCheck, label: 'Захиалгууд' },
                  { href: '/admin/availability',                   icon: CalendarX,     label: 'Огноо блоклох' },
                  { href: '/admin/reviews',                        icon: Star,          label: 'Сэтгэгдлүүд' },
                  { href: '/admin/payment',                        icon: CreditCard,    label: 'Төлбөр тохиргоо' },
                ]
              : []),
          ],
        },
      ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
            <Leaf size={18} className="text-amber-300" />
          </div>
          <div>
            <div className="font-display text-white text-base font-semibold leading-none">Монгол Нутаг</div>
            <div className="text-forest-400 text-[10px] mt-0.5 uppercase tracking-wide">
              {isSuperAdmin ? 'Super Admin' : 'Manager Panel'}
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-forest-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Manager badge */}
      {isManager && assignedPlaceName && (
        <div className="mx-3 mt-3 px-3 py-2 bg-forest-800/60 rounded-xl border border-forest-700">
          <div className="text-[10px] text-forest-500 uppercase tracking-wider mb-0.5">Оноогдсон газар</div>
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold truncate"><Tent size={11} /> {assignedPlaceName}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-3 mb-2 text-[10px] font-semibold text-forest-500 uppercase tracking-wider">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      active
                        ? 'bg-forest-700/60 text-white'
                        : 'text-forest-400 hover:bg-forest-800/60 hover:text-forest-200'
                    )}
                  >
                    <Icon size={17} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href === '/admin/chat' && chatUnread > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded-full font-bold leading-none">
                        {chatUnread > 9 ? '9+' : chatUnread}
                      </span>
                    )}
                    {item.href === '/admin/places' && pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded-full font-bold leading-none">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                    {active && <ChevronRight size={13} className="text-forest-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-forest-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{profile.full_name}</div>
            <div className="text-forest-400 text-xs">
              {profile.role === 'super_admin'
                ? <span className="flex items-center gap-1"><Crown size={10} /> Super Admin</span>
                : <span className="flex items-center gap-1"><Key size={10} /> Manager</span>}
            </div>
          </div>
        </div>
        <button
          onClick={() => nextAuthSignOut({ callbackUrl: '/auth/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-forest-400 hover:bg-forest-800 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut size={15} /> Гарах
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-forest-950 border-r border-forest-800 flex-col z-40">
        {sidebarContent}
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-forest-950 border-b border-forest-800">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-forest-300 hover:text-white p-1"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-forest-700 rounded-lg flex items-center justify-center">
            <Leaf size={14} className="text-amber-300" />
          </div>
          <span className="font-display text-white text-base font-semibold">Монгол Нутаг</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {chatUnread > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-bold">
              {chatUnread > 9 ? '9+' : chatUnread}
            </span>
          )}
          <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(profile.full_name)}
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Drawer */}
          <aside
            className="relative w-64 max-w-[80vw] bg-forest-950 flex flex-col h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}