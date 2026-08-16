import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatWithPulse } from '../lib/openrouter';
import { ErrorBanner, PulseOrb } from '../components/ui';

// Suggested starter prompts
const STARTERS = [
  'What bird is singing outside my window?',
  'I have 5 minutes — what should I notice?',
  'Why do leaves change color in autumn?',
  'What lives in the moss on my garden wall?',
];

export default function PulseChat() {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (content) => {
    if (typeof content !== 'string') return;
    const trimmed = content.trim();
    if (!trimmed) return;
    setText('');
    setError('');
    setBusy(true);

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    try {
      // Build conversation history (only role + content)
      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatWithPulse(history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse is quiet right now. Try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(text);
  };

  const clear = () => {
    setMessages([]);
    setError('');
  };

  // Simple markdown: **bold** and *italic*
  const renderContent = (content) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col min-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold flex items-center gap-1.5">
            <Sparkles size={12} /> AI-Powered Guide
          </p>
          <h1 className="font-display text-4xl mt-1">Pulse</h1>
          <p className="mt-1 text-sm text-forest/65">
            Your calm, intelligent nature companion. Ask anything about the living world around you.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs text-forest/40 hover:text-forest transition-colors"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 mt-6 space-y-4">
        {/* Empty state with starter prompts */}
        {!messages.length && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-paper border border-ink/5 p-6 flex gap-4">
              <PulseOrb size={48} />
              <div>
                <p className="font-display text-xl">I am here when you are.</p>
                <p className="mt-2 text-sm text-forest/70 leading-relaxed">
                  Tell me how much time you have, what you just saw, or that you feel nothing at all.
                  We can start from any of those.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-3 rounded-2xl bg-paper border border-ink/5 hover:border-moss/30 hover:bg-mist/30 transition-all text-forest/70 hover:text-forest cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && (
              <div className="mr-2 mt-1 shrink-0">
                <PulseOrb size={32} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-forest text-cream rounded-br-md font-medium'
                  : 'bg-paper border border-ink/5 text-ink rounded-bl-md'
              }`}
              dangerouslySetInnerHTML={
                m.role !== 'user' ? { __html: renderContent(m.content) } : undefined
              }
            >
              {m.role === 'user' ? m.content : undefined}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-forest/50">
            <PulseOrb size={28} />
            <span className="animate-pulse">Pulse is considering…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 sticky bottom-20 md:bottom-4 flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Pulse about what is around you…"
          className="flex-1 rounded-full bg-paper border border-ink/10 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-moss/20 text-ink placeholder:text-ink/35 transition-colors"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-full bg-forest text-cream w-12 h-12 flex items-center justify-center disabled:opacity-40 hover:bg-ink transition-colors cursor-pointer"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
