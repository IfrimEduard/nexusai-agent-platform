import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Send, Bot, User, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  session_id: string;
  role: string;
  content: string;
  thinking: string;
  tools_used: string[];
  created_at: string;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages(data || []);
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const userId = await getUserId();
    const userMsg = input.trim();
    setInput('');

    const userRow = {
      session_id: sessionId,
      role: 'user',
      content: userMsg,
      thinking: '',
      tools_used: [],
      metadata: {},
      created_by: userId,
    };

    const { data: inserted } = await supabase
      .from('chat_messages')
      .insert(userRow)
      .select();

    if (inserted) setMessages((prev) => [...prev, inserted[0]]);

    // Simulate agent response
    setTimeout(async () => {
      const agentRow = {
        session_id: sessionId,
        role: 'assistant',
        content: generateResponse(userMsg),
        thinking: 'Analyzing request... Checking governance rules and known limitations.',
        tools_used: ['check_limitations', 'log_action'],
        metadata: {},
        created_by: userId,
      };

      const { data: agentInserted } = await supabase
        .from('chat_messages')
        .insert(agentRow)
        .select();

      if (agentInserted) setMessages((prev) => [...prev, agentInserted[0]]);
      setSending(false);
    }, 800);
  }

  function generateResponse(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('skill')) return 'I have 62 skills across 5 layers: Essential (22), Core (10), Advanced (10), Autonomous (10), and Evolutionary (10). Each skill can be enabled, configured, and leveled up through use.';
    if (lower.includes('limit')) return 'I am aware of 13 known limitations including payment restrictions, API rate limits, model hallucinations, and context window limits. Each has severity ratings and mitigation strategies.';
    if (lower.includes('govern')) return 'Governance is handled through 15 default rules. Actions are categorized as auto-approve (web search, file ops, free APIs) or requires-approval (paid APIs, account creation, payments, data deletion).';
    if (lower.includes('help') || lower.includes('what can you do')) return 'I can help with software engineering, debugging, code review, testing, API design, database management, cloud infrastructure, security analysis, and much more. I follow governance rules and am aware of my limitations.';
    return `I understand your request: "${msg}". Let me process this through my skill layers and governance framework. I'll check for any limitations and apply the appropriate approach.`;
  }

  async function clearChat() {
    const userId = await getUserId();
    await supabase.from('chat_messages').delete().eq('created_by', userId);
    setMessages([]);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Agent Chat</h1>
          <p className="text-sm text-slate-400 mt-1">Interact with your NexusAI agent</p>
        </div>
        <button onClick={clearChat} className="btn-secondary flex items-center gap-2 text-xs">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      <div className="flex-1 card overflow-y-auto p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Bot className="w-12 h-12 mb-3" />
            <p className="text-sm">Start a conversation with NexusAI</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-cyan-600/20 text-slate-100 border border-cyan-500/20'
                : 'bg-[#111827] text-slate-300 border border-[#1e2d3d]'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.thinking && (
                <div className="mt-2 pt-2 border-t border-[#1e2d3d]">
                  <p className="text-xs text-slate-500 italic">{msg.thinking}</p>
                </div>
              )}
              {msg.role === 'assistant' && msg.tools_used?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.tools_used.map((t) => (
                    <span key={t} className="badge-info">{t}</span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="input-field flex-1"
          disabled={sending}
        />
        <button onClick={sendMessage} disabled={sending || !input.trim()} className="btn-primary flex items-center gap-2 px-4">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}