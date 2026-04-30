import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Send, Bot, User, Trash2, Cpu, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  session_id: string;
  role: string;
  content: string;
  thinking: string;
  tools_used: string[];
  created_at: string;
}

interface OllamaModel {
  name: string;
  model: string;
}

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [selectedModel, setSelectedModel] = useState('');
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    checkOllama();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkOllama() {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        setOllamaModels(models);
        setOllamaConnected(true);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].name);
        }
      } else {
        setOllamaConnected(false);
        setOllamaModels([]);
      }
    } catch {
      setOllamaConnected(false);
      setOllamaModels([]);
    }
  }

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

    if (!ollamaConnected) {
      setError('Ollama is not running. Start it with: ollama serve');
      return;
    }

    if (!selectedModel) {
      setError('No model selected. Import a model first in the Models page.');
      return;
    }

    setError('');
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

    try {
      const chatHistory = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      chatHistory.push({ role: 'user', content: userMsg });

      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatHistory,
          stream: false,
        }),
        signal: AbortSignal.timeout(300000),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Ollama returned ${res.status}`);
      }

      const data = await res.json();
      const assistantContent = data.message?.content || 'No response from model.';

      const agentRow = {
        session_id: sessionId,
        role: 'assistant',
        content: assistantContent,
        thinking: `Model: ${selectedModel} | Tokens: ${data.eval_count || '?'} | Duration: ${data.total_duration ? Math.round(data.total_duration / 1e9) : '?'}s`,
        tools_used: [],
        metadata: { model: selectedModel, eval_count: data.eval_count, total_duration: data.total_duration },
        created_by: userId,
      };

      const { data: agentInserted } = await supabase
        .from('chat_messages')
        .insert(agentRow)
        .select();

      if (agentInserted) setMessages((prev) => [...prev, agentInserted[0]]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to get response from model.';
      setError(errMsg);

      const agentRow = {
        session_id: sessionId,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        thinking: 'Failed to connect to Ollama model.',
        tools_used: [],
        metadata: { error: errMsg },
        created_by: userId,
      };

      const { data: agentInserted } = await supabase
        .from('chat_messages')
        .insert(agentRow)
        .select();

      if (agentInserted) setMessages((prev) => [...prev, agentInserted[0]]);
    }
    setSending(false);
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
        <div className="flex items-center gap-3">
          {/* Model selector */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-field text-xs py-1.5 px-2 w-auto min-w-[140px]"
            >
              {ollamaModels.length === 0 && (
                <option value="">No models</option>
              )}
              {ollamaModels.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <span className={`flex items-center gap-1 text-xs ${ollamaConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {ollamaConnected ? 'Ollama' : 'Offline'}
            </span>
          </div>
          <button onClick={clearChat} className="btn-secondary flex items-center gap-2 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-xs text-rose-400 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-300 text-xs">Dismiss</button>
        </div>
      )}

      {/* No model warning */}
      {!ollamaConnected && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 flex-1">Ollama is not running. Start it with <code className="bg-amber-500/10 px-1 rounded">ollama serve</code> and make sure you have models installed.</p>
        </div>
      )}

      <div className="flex-1 card overflow-y-auto p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Bot className="w-12 h-12 mb-3" />
            <p className="text-sm">Start a conversation with NexusAI</p>
            {ollamaConnected && selectedModel && (
              <p className="text-xs text-slate-600 mt-1">Using model: {selectedModel}</p>
            )}
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
                : msg.content.startsWith('Error:')
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    : 'bg-[#111827] text-slate-300 border border-[#1e2d3d]'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.thinking && (
                <div className="mt-2 pt-2 border-t border-[#1e2d3d]">
                  <p className="text-xs text-slate-500 italic">{msg.thinking}</p>
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
          placeholder={ollamaConnected && selectedModel ? `Message ${selectedModel}...` : 'Type a message...'}
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
