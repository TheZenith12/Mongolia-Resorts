'use client';
// components/admin/AdminUserRoleChange.tsx
// REPLACE the entire file

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { UserRole } from '@/lib/types';

interface Place { id: string; name: string; }

interface Props {
  userId: string;
  currentRole: UserRole;
  assignedPlaceId?: string | null;
}

export default function AdminUserRoleChange({ userId, currentRole, assignedPlaceId }: Props) {
  const [role, setRole]           = useState<UserRole>(currentRole);
  const [placeId, setPlaceId]     = useState<string>(assignedPlaceId ?? '');
  const [places, setPlaces]       = useState<Place[]>([]);
  const [showPlace, setShowPlace] = useState(currentRole === 'manager');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    fetch('/api/admin/places-list')
      .then(r => r.json())
      .then(d => setPlaces(d ?? []))
      .catch(() => {});
  }, []);

  async function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    setShowPlace(newRole === 'manager');
    if (newRole !== 'manager') {
      await save(newRole, '');
    }
  }

  async function handleAssign() {
    if (!placeId) { toast.error('Газар сонгоно уу'); return; }
    await save(role, placeId);
  }

  async function save(newRole: UserRole, selectedPlaceId: string) {
    setLoading(true);
    try {
      const body: Record<string, string> = { user_id: userId, role: newRole };
      if (newRole === 'manager' && selectedPlaceId) body.place_id = selectedPlaceId;

      const res  = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Алдаа гарлаа');
      toast.success('Амжилттай хадгаллаа');
    } catch (err: any) {
      toast.error(err.message);
      setRole(currentRole);
      setShowPlace(currentRole === 'manager');
    } finally {
      setLoading(false);
    }
  }

  const currentPlaceName = places.find(p => p.id === assignedPlaceId)?.name;

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      {/* Role selector */}
      <select
        value={role}
        onChange={e => handleRoleChange(e.target.value as UserRole)}
        disabled={loading}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-400 disabled:opacity-50"
      >
        <option value="user">👤 Хэрэглэгч</option>
        <option value="manager">🔑 Manager</option>
        <option value="super_admin">👑 Super Admin</option>
      </select>

      {/* Place selector — manager сонгосон үед харагдана */}
      {showPlace && (
        <div className="flex flex-col gap-1">
          {/* Одоогийн оноогдсон газар */}
          {assignedPlaceId && currentPlaceName && (
            <div className="text-[10px] text-forest-500 px-1">
              Одоо: <span className="font-semibold text-forest-700">🏕 {currentPlaceName}</span>
            </div>
          )}
          <div className="flex gap-1.5 items-center">
            <select
              value={placeId}
              onChange={e => setPlaceId(e.target.value)}
              disabled={loading}
              className="text-xs border border-amber-300 rounded-lg px-2 py-1.5 bg-amber-50 text-forest-700 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50 flex-1"
            >
              <option value="">
                {assignedPlaceId ? '— Газар солих —' : '— Газар сонгох —'}
              </option>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={loading || !placeId}
              className="text-xs bg-forest-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-forest-700 disabled:opacity-40 whitespace-nowrap transition-colors"
            >
              {loading ? '...' : assignedPlaceId ? 'Солих' : 'Оноох'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}