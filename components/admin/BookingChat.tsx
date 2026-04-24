'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

interface BookingChatProps {
  bookingId: string;
  currentUserId: string;
}

export default function BookingChat({ bookingId, currentUserId }: BookingChatProps) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    const res = await fetch(`/api/bookings/${bookingId}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMessages(); }, [bookingId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!text.trim() || loading) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text.trim() }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setText('');
    }
    setLoading(false);
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Admin',
    manager: 'Manager',
    user: 'Хэрэглэгч',
  };

  return (
    <div className="flex flex-col h-80 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
      <div className="px-4 py-2.5 bg-white border-b border-gray-100 text-xs font-semibold text-forest-600">
        Захиалгын мессеж
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-forest-400 mt-8">Мессеж байхгүй</p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                isMe
                  ? 'bg-forest-600 text-white rounded-br-sm'
                  : 'bg-white text-forest-900 border border-gray-100 rounded-bl-sm'
              }`}>
                {!isMe && (
                  <div className="text-xs font-semibold text-forest-400 mb-0.5">
                    {roleLabel[msg.sender_role] ?? msg.sender_role}
                  </div>
                )}
                <p>{msg.message}</p>
                <div className={`text-xs mt-1 ${isMe ? 'text-forest-200' : 'text-forest-300'}`}>
                  {formatDate(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Мессеж бичих..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-forest-400"
        />
        <button
          onClick={send}
          disabled={loading || !text.trim()}
          className="w-9 h-9 bg-forest-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
