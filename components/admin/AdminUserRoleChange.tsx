'use client';
// components/admin/AdminUserRoleChange.tsx
// REPLACE the entire file with this

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { UserRole } from '@/lib/types';

interface Place {
  id: string;
  name: string;
}

interface AdminUserRoleChangeProps {
  userId: string;
  currentRole: UserRole;
  assignedPlaceId?: string | null;
}

export default function AdminUserRoleChange({
  userId,
  currentRole,
  assignedPlaceId,
}: AdminUserRoleChangeProps) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [placeId, setPlaceId] = useState<string>(assignedPlaceId ?? '');
  const [places, setPlaces] = useState<Place[]>([]);
  const [showPlaceSelect, setShowPlaceSelect] = useState(currentRole === 'manager');
  const [loading, setLoading] = useState(false);

  // Газруудын жагсаалт авах
  useEffect(() => {
    fetch('/api/admin/places-list')
      .then((r) => r.json())
      .then((data) => setPlaces(data ?? []))
      .catch(() => {});
  }, []);

  async function handleChange(newRole: UserRole) {
    setRole(newRole);
    setShowPlaceSelect(newRole === 'manager');
    if (newRole !== 'manager') {
      // Manager биш болгоход шууд хадгалах
      await save(newRole, '');
    }
  }

  async function handleAssign() {
    if (!placeId) {
      toast.error('Газар сонгоно уу');
      return;
    }
    await save(role, placeId);
  }

  async function save(newRole: UserRole, selectedPlaceId: string) {
    setLoading(true);
    try {
      const body: Record<string, string> = { user_id: userId, role: newRole };
      if (newRole === 'manager' && selectedPlaceId) {
        body.place_id = selectedPlaceId;
      }
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Алдаа гарлаа');
      toast.success('Амжилттай хадгаллаа');
    } catch (err: any) {
      toast.error(err.message);
      // Буцаах
      setRole(currentRole);
      setShowPlaceSelect(currentRole === 'manager');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        disabled={loading}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-400 disabled:opacity-50"
      >
        <option value="user">👤 Хэрэглэгч</option>
        <option value="manager">🔑 Manager</option>
        <option value="super_admin">👑 Super Admin</option>
      </select>

      {showPlaceSelect && (
        <div className="flex gap-1.5 items-center">
          <select
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            disabled={loading}
            className="text-xs border border-amber-300 rounded-lg px-2 py-1.5 bg-amber-50 text-forest-700 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50 flex-1"
          >
            <option value="">— Газар сонгох —</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={loading || !placeId}
            className="text-xs bg-forest-600 text-white px-2 py-1.5 rounded-lg hover:bg-forest-700 disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? '...' : 'Оноох'}
          </button>
        </div>
      )}
    </div>
  );
}