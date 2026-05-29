'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, ChevronLeft,
  Loader2, CheckCheck, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Msg {
  id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string | null;
}

interface Conv {
  id: string;
  subject: string;
  last_message: string;
  last_message_at: string | null;
  status: string;
  unread_user: number;
  place_id: string | null;
  place_name: string | null;
}

type View = 'list' | 'chat' | 'new';

interface Props {
  userId: string;
}

export default function HeaderChatButton({ userId }: Props) {
  const [open, setOpen]               = useState(false);
  const [view, setView]               = useState<View>('list');
  const [convs, setConvs]             = useState<Conv[]>([]);
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [messages, setMessages]       = useState<Msg[]>([]);
  const [subject, setSubject]         = useState('');
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [unread, setUnread]           = useState(0);
  const [convSubject, setConvSubject] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const panelRef  = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Unread badge poll (15s)
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/chat/unread');
        const d = await res.json();
        setUnread(d.count ?? 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 15_000);
    return () => clearInterval(t);
  }, []);

  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const d = await res.json();
      if (Array.isArray(d)) setConvs(d);
    } catch { /* ignore */ }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      const d = await res.json();
      if (d.messages) {
        setMessages(d.messages);
        setConvSubject(d.conversation?.subject ?? '');
        setUnread(prev => Math.max(0, prev - 1));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) fetchConvs();
    else if (pollRef.current) clearInterval(pollRef.current);
  }, [open, fetchConvs]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (view === 'chat' && activeId) {
      pollRef.current = setInterval(() => fetchMessages(activeId), 4_000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [view, activeId, fetchMessages]);

  async function openConv(id: string) {
    setActiveId(id);
    setView('chat');
    setMessages([]);
    await fetchMessages(id);
  }

  function startNew() {
    setInput('');
    setSubject('');
    setView('new');
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;

    if (view === 'new') {
      setSending(true);
      try {
        const body: Record<string, string> = { first_message: input, subject: subject || '' };
        const res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (d.id) {
          setInput(''); setSubject('');
          await fetchConvs();
          await openConv(d.id);
        }
      } catch { /* ignore */ } finally { setSending(false); }
      return;
    }

    if (!activeId) return;
    setSending(true);
    const optimistic: Msg = {
      id: Date.now().toString(),
      sender_role: 'user',
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
    } catch { /* ignore */ } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatTime(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  }

  const headerLabel =
    view === 'list' ? '💬 Дэмжлэг & Чат' :
    view === 'new'  ? '💬 Дэмжлэг авах' :
    convSubject || 'Яриа';

  const headerSub = 'Администратор хариулна';

  return (
    <div className="relative" ref={panelRef}>
      {/* Icon button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-xl hover:bg-forest-50 text-forest-600 transition-colors"
        aria-label="Чат"
      >
        <MessageCircle size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-forest-100 flex flex-col overflow-hidden z-[60]"
          style={{ animation: 'fadeUp 0.15s ease' }}
        >
          {/* Panel header */}
          <div className="bg-forest-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            {view !== 'list' && (
              <button
                onClick={() => { setView('list'); fetchConvs(); }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{headerLabel}</div>
              <div className="text-forest-300 text-[10px]">{headerSub}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* LIST */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-forest-50">
                <button
                  onClick={() => startNew()}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 bg-forest-600 hover:bg-forest-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <HelpCircle size={15} />
                  Дэмжлэг авах (Admin)
                </button>
              </div>

              {convs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-forest-400 text-sm gap-2">
                  <MessageCircle size={28} className="opacity-40" />
                  <p>Яриа байхгүй байна</p>
                </div>
              ) : (
                convs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openConv(c.id)}
                    className="w-full text-left px-4 py-3 hover:bg-forest-50 border-b border-forest-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <HelpCircle size={11} className="text-forest-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-forest-900 truncate">{c.subject}</span>
                        </div>
                        <div className="text-xs text-forest-400 truncate">{c.last_message}</div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {c.unread_user > 0 && (
                          <span className="w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                            {c.unread_user}
                          </span>
                        )}
                        <span className="text-[10px] text-forest-300">{formatTime(c.last_message_at)}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* NEW CONVERSATION */}
          {view === 'new' && (
            <div className="flex flex-col flex-1 p-4 gap-3 overflow-y-auto">
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Яриын сэдэв (заавал биш)"
                className="w-full px-3 py-2 text-sm bg-forest-50 border border-forest-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400/30 text-forest-800 placeholder-forest-300"
              />
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Асуултаа бичнэ үү..."
                rows={5}
                className="w-full px-3 py-2 text-sm bg-forest-50 border border-forest-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400/30 text-forest-800 placeholder-forest-300 resize-none"
                autoFocus
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Илгээх
              </button>
            </div>
          )}

          {/* CHAT */}
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
                        <div className="w-7 h-7 bg-forest-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 mt-0.5">
                          A
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                        isMe
                          ? 'bg-forest-700 text-white rounded-br-sm'
                          : 'bg-white text-forest-900 rounded-bl-sm shadow-sm border border-forest-100'
                      )}>
                        {m.content}
                        <div className={cn('text-[10px] mt-1', isMe ? 'text-forest-300' : 'text-forest-400')}>
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
                  className="flex-1 px-3 py-2 text-sm bg-forest-50 border border-forest-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400/30 text-forest-800"
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 flex items-center justify-center bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white rounded-xl transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
