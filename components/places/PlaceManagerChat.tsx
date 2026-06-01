'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, ChevronLeft,
  Loader2, CheckCheck, Store, Tent,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Msg {
  id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string | null;
}

type View = 'bubble' | 'new' | 'chat';

interface Props {
  placeId: string;
  placeName: string;
  userId: string;
}

export default function PlaceManagerChat({ placeId, placeName, userId }: Props) {
  const [view, setView]         = useState<View>('bubble');
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [convId, setConvId]     = useState<string | null>(null);
  const [sending, setSending]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const panelRef  = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll messages when in chat view
  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      const d = await res.json();
      if (d.messages) setMessages(d.messages);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (view === 'chat' && convId) {
      pollRef.current = setInterval(() => fetchMessages(convId), 4_000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [view, convId, fetchMessages]);

  // Outside click to close
  useEffect(() => {
    if (view === 'bubble') return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setView('bubble');
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [view]);

  function formatTime(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); await sendMessage(); }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);

    try {
      if (view === 'new') {
        // Create new conversation with place_id → goes to manager
        const res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_message: input,
            subject: `${placeName} — Асуулт`,
            place_id: placeId,
          }),
        });
        const d = await res.json();
        if (d.id) {
          setConvId(d.id);
          setInput('');
          await fetchMessages(d.id);
          setView('chat');
        }
        return;
      }

      if (!convId) return;
      // Optimistic
      const tempId = `temp-${Date.now()}`;
      const optimistic: Msg = {
        id: tempId,
        sender_role: 'user',
        sender_name: 'Та',
        content: input,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimistic]);
      const text = input;
      setInput('');
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        // Rollback optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setInput(text);
      }
    } catch {
      setInput(input);
    } finally { setSending(false); }
  }

  // Floating bubble
  if (view === 'bubble') {
    return (
      <button
        onClick={() => setView('new')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl shadow-2xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        aria-label="Менежертэй холбогдох"
      >
        <Store size={18} />
        <span>Менежертэй холбогдох</span>
        {unread > 0 && (
          <span className="w-5 h-5 bg-white text-amber-600 text-[10px] rounded-full flex items-center justify-center font-bold ml-1">
            {unread}
          </span>
        )}
      </button>
    );
  }

  // Chat panel (new or active conversation)
  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 z-50 w-80 h-[420px] bg-white rounded-2xl shadow-2xl border border-forest-100 flex flex-col overflow-hidden"
      style={{ animation: 'fadeUp 0.15s ease' }}
    >
      {/* Header */}
      <div className="bg-amber-500 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        {view === 'chat' && (
          <button
            onClick={() => setView('bubble')}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-white font-semibold text-sm truncate"><Tent size={13} /> Менежертэй холбогдох</div>
          <div className="text-amber-100 text-[10px] truncate">{placeName}</div>
        </div>
        <button
          onClick={() => setView('bubble')}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* NEW message form */}
      {view === 'new' && (
        <div className="flex flex-col flex-1 p-4 gap-3 overflow-y-auto">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Store size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>{placeName}</strong> газрын менежер таны мессежийг хүлээж авна.
            </p>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Асуултаа бичнэ үү..."
            rows={5}
            className="flex-1 w-full px-3 py-2 text-sm bg-forest-50 border border-forest-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-forest-800 placeholder-forest-300 resize-none"
            autoFocus
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Илгээх
          </button>
        </div>
      )}

      {/* CHAT view */}
      {view === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/60">
            {messages.length === 0 && (
              <div className="text-center text-forest-300 text-xs mt-8">Мессеж байхгүй</div>
            )}
            {messages.map(m => {
              const isMe = m.sender_role === 'user';
              return (
                <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 mt-0.5">
                      M
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                    isMe
                      ? 'bg-amber-500 text-white rounded-br-sm'
                      : 'bg-white text-forest-900 rounded-bl-sm shadow-sm border border-forest-100'
                  )}>
                    {m.content}
                    <div className={cn('text-[10px] mt-1', isMe ? 'text-amber-100' : 'text-forest-400')}>
                      {formatTime(m.created_at)}
                      {isMe && <CheckCheck size={10} className="inline ml-1" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 bg-white border-t border-forest-100 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Мессеж бичнэ үү..."
              className="flex-1 px-3 py-2 text-sm bg-forest-50 border border-forest-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-forest-800"
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-9 h-9 flex items-center justify-center bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-xl transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
