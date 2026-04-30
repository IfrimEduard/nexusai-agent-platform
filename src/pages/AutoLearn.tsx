import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Trash2, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

interface LearnSession {
  id: string;
  name: string;
  source: string;
  learnings: unknown[];
  accuracy: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_by: string;
}

const SOURCES = ['observation', 'feedback', 'experiment', 'research', 'interaction'];
const STATUSES = ['pending', 'running', 'completed', 'failed'];

export default function AutoLearn() {
  const [sessions, setSessions] = useState<LearnSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<LearnSession>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from('auto_learn_sessions').select('*').order('started_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    await supabase.from('auto_learn_sessions').insert({ ...form, created_by: userId });
    setShowModal(false);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('auto_learn_sessions').delete().eq('id', id);
    load();
  }

  function openAdd() {
    setForm({ source: 'observation', status: 'pending', accuracy: 0, learnings: [] });
    setShowModal(true);
  }

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5 text-slate-400" />,
    running: <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />,
    completed: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    failed: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
  };
  const statusColor: Record<string, string> = { pending: 'text-slate-400 bg-slate-500/10', running: 'text-cyan-400 bg-cyan-500/10', completed: 'text-emerald-400 bg-emerald-500/10', failed: 'text-rose-400 bg-rose-500/10' };
  const sourceColor: Record<string, string> = { observation: 'text-cyan-400 bg-cyan-500/10', feedback: 'text-amber-400 bg-amber-500/10', experiment: 'text-blue-400 bg-blue-500/10', research: 'text-emerald-400 bg-emerald-500/10', interaction: 'text-slate-300 bg-slate-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Auto-Learn</h1>
          <p className="text-sm text-slate-400 mt-1">Learning sessions and knowledge acquisition</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Session</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{sessions.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Completed</p><p className="text-2xl font-bold text-emerald-400">{sessions.filter(s => s.status === 'completed').length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Running</p><p className="text-2xl font-bold text-cyan-400">{sessions.filter(s => s.status === 'running').length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Avg Accuracy</p><p className="text-2xl font-bold text-amber-400">{sessions.length ? (sessions.reduce((s, r) => s + (r.accuracy || 0), 0) / sessions.length).toFixed(1) : 0}%</p></div>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{s.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${statusColor[s.status] || statusColor.pending}`}>{statusIcon[s.status]} {s.status}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sourceColor[s.source] || sourceColor.observation}`}>{s.source}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => remove(s.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />{Array.isArray(s.learnings) ? s.learnings.length : 0} learnings</span>
              <span>Accuracy: {(s.accuracy || 0).toFixed(1)}%</span>
              <span>Started: {new Date(s.started_at).toLocaleDateString()}</span>
              {s.completed_at && <span>Completed: {new Date(s.completed_at).toLocaleDateString()}</span>}
            </div>
            {s.accuracy > 0 && (
              <div className="mt-2">
                <div className="h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, s.accuracy)}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="card p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No learning sessions yet</p>
          <button onClick={openAdd} className="btn-primary mt-4">Start your first session</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm({}); }} title="New Learning Session">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. API Error Patterns" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Source</label>
            <select value={form.source || 'observation'} onChange={(e) => setForm({ ...form, source: e.target.value })} className="select-field">
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowModal(false); setForm({}); }} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={!form.name} className="btn-primary">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}