'use client';
// components/admin/AdminSidebar.tsx
// REPLACE the entire file with this

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MapPin, CalendarCheck, Users,
  Star, Settings, LogOut, Leaf, ChevronRight, Building2,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { signOut } from '@/lib/actions/auth';
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
            { href: '/admin/users',    icon: Users,    label: 'Хэрэглэгчид' },
            { href: '/admin/settings', icon: Settings, label: 'Тохиргоо' },
          ],
        },
      ]
    : [
        // Manager: зөвхөн өөрийн газартай холбоотой цэсүүд
        {
          label: 'Миний газар',
          items: [
            { href: '/admin',          icon: LayoutDashboard, label: 'Самбар' },
            ...(assignedPlaceId
              ? [
                  { href: `/admin/places/${assignedPlaceId}/edit`, icon: Building2,    label: assignedPlaceName ?? 'Миний газар' },
                  { href: '/admin/bookings',                       icon: CalendarCheck, label: 'Захиалгууд' },
                  { href: '/admin/reviews',                        icon: Star,          label: 'Сэтгэгдлүүд' },
                ]
              : []),
          ],
        },
      ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-forest-950 border-r border-forest-800 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-forest-800">
        <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
          <Leaf size={18} className="text-amber-300" />
        </div>
        <div>
          <div className="font-display text-white text-lg font-semibold leading-none">Монгол Нутаг</div>
          <div className="text-forest-400 text-[10px] mt-0.5 uppercase tracking-wide">
            {isSuperAdmin ? 'Super Admin' : 'Manager Panel'}
          </div>
        </div>
      </div>

      {/* Manager badge */}
      {isManager && assignedPlaceName && (
        <div className="mx-3 mt-3 px-3 py-2 bg-forest-800/60 rounded-xl border border-forest-700">
          <div className="text-[10px] text-forest-500 uppercase tracking-wider mb-0.5">Оноогдсон газар</div>
          <div className="text-amber-300 text-xs font-semibold truncate">🏕 {assignedPlaceName}</div>
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
              {profile.role === 'super_admin' ? '👑 Super Admin' : '🔑 Manager'}
            </div>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-forest-400 hover:bg-forest-800 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut size={15} /> Гарах
          </button>
        </form>
      </div>
    </aside>
  );
}