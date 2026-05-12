'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Loader2, CheckCheck,
  User, Clock, RefreshCw, Circle, Store, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conv {
  id: string;
  user_name: string;
  user_email: string;
  subject: string;
  status: string;
  last_message: string;
  last_message_at: string | null;
  unread_admin: number;
  place_id: string | null;
  place_name: string | null;
}

interface Msg {
  id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string | null;
}

export default function AdminChatClient() {
  const [convs, setConvs]             = useState<Conv[]>([]);
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [activeConv, setActiveConv]   = useState<{ subject: string; user_name: string } | null>(null);
  const [messages, setMessages]       = useState<Msg[]>([]);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const d = await res.json();
      if (Array.isArray(d)) setConvs(d);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      const d = await res.json();
      if (d.messages) {
        setMessages(d.messages);
        setActiveConv({ subject: d.conversation?.subject ?? '', user_name: d.conversation?.user_name ?? '' });
        // Update unread count locally
        setConvs(prev => prev.map(c => c.id === id ? { ...c, unread_admin: 0 } : c));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchConvs();
    const t = setInterval(fetchConvs, 30_000);
    return () => clearInterval(t);
  }, [fetchConvs]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeId) {
      pollRef.current = setInterval(() => fetchMessages(activeId), 4_000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openConv(id: string) {
    setActiveId(id);
    setMessages([]);
    await fetchMessages(id);
  }

  async function sendMessage() {
    if (!input.trim() || sending || !activeId) return;
    setSending(true);
    const optimistic: Msg = {
      id: Date.now().toString(),
      sender_role: 'super_admin',
      sender_name: 'Та',
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    const text = input;
    setInput('');
    try {
      await fetch(`/api/chat/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      fetchConvs();
    } catch { /* ignore */ } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'Дөнгөж сая';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин`;
    if (diff < 86_400_000) return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
  }

  const totalUnread = convs.reduce((s, c) => s + (c.unread_admin ?? 0), 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      {/* Sidebar — conversations list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest-900 flex items-center gap-2">
              <MessageCircle size={17} className="text-forest-500" />
              Хэрэглэгчийн чатууд
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button
              onClick={fetchConvs}
              className="text-forest-400 hover:text-forest-700 transition-colors"
              title="Шинэчлэх"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={20} className="animate-spin text-forest-400" />
            </div>
          ) : convs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-forest-300 gap-3 px-4 text-center">
              <MessageCircle size={32} className="opacity-30" />
              <div>
                <p className="text-sm font-medium">Одоогоор чат байхгүй</p>
                <p className="text-xs text-forest-200 mt-1 leading-relaxed">
                  Хэрэглэгч таны газрын хуудаснаас мессеж илгээвэл энд харагдана
                </p>
              </div>
            </div>
          ) : (
            convs.map(c => (
              <button
                key={c.id}
                onClick={() => openConv(c.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-forest-50/60',
                  activeId === c.id && 'bg-forest-50 border-l-2 border-l-forest-600'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-forest-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-forest-900 truncate">
                        {c.user_name}
                      </span>
                      {c.unread_admin > 0 && (
                        <span className="w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                          {c.unread_admin}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-forest-500 truncate">
                      {c.place_id
                        ? <><Store size={10} className="text-amber-500 flex-shrink-0" /><span className="truncate">{c.place_name ?? c.subject}</span></>
                        : <><HelpCircle size={10} className="text-forest-400 flex-shrink-0" /><span className="truncate">{c.subject}</span></>
                      }
                    </div>
                    <div className="text-xs text-forest-400 truncate mt-0.5">{c.last_message}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={9} className="text-forest-300" />
                      <span className="text-[10px] text-forest-300">{formatTime(c.last_message_at)}</span>
                      <Circle
                        size={5}
                        className={cn(
                          'ml-auto',
                          c.status === 'open' ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-forest-300 gap-3">
            <MessageCircle size={48} className="opacity-20" />
            <p className="text-sm">Яриа сонгоно уу</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white">
              <div className="font-semibold text-forest-900">{activeConv?.subject}</div>
              <div className="text-xs text-forest-400 mt-0.5 flex items-center gap-1">
                <User size={10} />
                {activeConv?.user_name}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-forest-300 text-sm mt-8">Мессеж байхгүй</div>
              )}
              {messages.map(m => {
                const isAdmin = m.sender_role !== 'user';
                return (
                  <div key={m.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                    {!isAdmin && (
                      <div className="w-8 h-8 bg-forest-200 rounded-full flex items-center justify-center text-forest-600 text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                        {activeConv?.user_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isAdmin
                        ? 'bg-forest-700 text-white rounded-br-sm'
                        : 'bg-white text-forest-900 rounded-bl-sm shadow-sm border border-forest-100'
                    )}>
                      {!isAdmin && (
                        <div className="text-[10px] font-semibold text-forest-400 mb-1">{m.sender_name}</div>
                      )}
                      {m.content}
                      <div className={cn('text-[10px] mt-1.5 flex items-center gap-1', isAdmin ? 'text-forest-300 justify-end' : 'text-forest-400')}>
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        {isAdmin && <CheckCheck size={10} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Хариулт бичнэ үү..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400/30 text-forest-800"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-4 py-2.5 flex items-center gap-2 bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Илгээх
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
