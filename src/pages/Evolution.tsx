import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Dna, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react';
import Modal from '../components/Modal';

interface EvolutionEntry {
  id: string;
  event_type: string;
  description: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  impact_score: number;
  auto_applied: boolean;
  rollback_data: Record<string, unknown>;
  applied_at: string | null;
  created_at: string;
  created_by: string;
}

const EVENT_TYPES = ['mutation', 'adaptation', 'optimization', 'learning', 'capability_gain', 'self_repair'];

export default function Evolution() {
  const [entries, setEntries] = useState<EvolutionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<EvolutionEntry>>({});
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data } = await supabase.from('evolution_log').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    await supabase.from('evolution_log').insert({ ...form, created_by: userId });
    setShowModal(false);
    setForm({});
    load();
  }

  function openAdd() {
    setForm({ event_type: 'mutation', impact_score: 0, auto_applied: false, before_state: {}, after_state: {}, rollback_data: {} });
    setShowModal(true);
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.event_type === filter);
  const typeColor: Record<string, string> = { mutation: 'text-rose-400 bg-rose-500/10', adaptation: 'text-cyan-400 bg-cyan-500/10', optimization: 'text-emerald-400 bg-emerald-500/10', learning: 'text-amber-400 bg-amber-500/10', capability_gain: 'text-blue-400 bg-blue-500/10', self_repair: 'text-orange-400 bg-orange-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Self-Evolve</h1>
          <p className="text-sm text-slate-400 mt-1">Agent evolution and self-improvement log</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Log Event</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total Events</p><p className="text-2xl font-bold text-slate-100">{entries.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Auto-Applied</p><p className="text-2xl font-bold text-emerald-400">{entries.filter(e => e.auto_applied).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Avg Impact</p><p className="text-2xl font-bold text-cyan-400">{entries.length ? (entries.reduce((s, e) => s + (e.impact_score || 0), 0) / entries.length).toFixed(1) : 0}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Rollbacks</p><p className="text-2xl font-bold text-rose-400">{entries.filter(e => e.rollback_data && Object.keys(e.rollback_data).length > 0).length}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...EVENT_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Dna className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor[e.event_type] || typeColor.mutation}`}>{e.event_type}</span>
                    {e.auto_applied ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle className="w-3 h-3" /> auto</span> : <span className="flex items-center gap-1 text-[10px] text-slate-500"><XCircle className="w-3 h-3" /> manual</span>}
                    {e.rollback_data && Object.keys(e.rollback_data).length > 0 && <span className="flex items-center gap-1 text-[10px] text-rose-400"><RotateCcw className="w-3 h-3" /> rollback</span>}
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{e.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{e.impact_score || 0}</span>
                <span>{new Date(e.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            {(e.before_state && Object.keys(e.before_state).length > 0) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Before</p>
                  <pre className="text-[10px] text-slate-400 bg-[#0a0e17] rounded p-2 border border-[#1e2d3d] overflow-x-auto">{JSON.stringify(e.before_state, null, 2)}</pre>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">After</p>
                  <pre className="text-[10px] text-slate-400 bg-[#0a0e17] rounded p-2 border border-[#1e2d3d] overflow-x-auto">{JSON.stringify(e.after_state, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Dna className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No evolution events recorded</p>
          <button onClick={openAdd} className="btn-primary mt-4">Log your first event</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm({}); }} title="Log Evolution Event">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Event Type</label>
            <select value={form.event_type || 'mutation'} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="select-field">
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" placeholder="What changed and why?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Impact Score (0-10)</label>
              <input type="number" min={0} max={10} value={form.impact_score || 0} onChange={(e) => setForm({ ...form, impact_score: parseFloat(e.target.value) })} className="input-field" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.auto_applied || false} onChange={(e) => setForm({ ...form, auto_applied: e.target.checked })} className="rounded" /> Auto-applied</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowModal(false); setForm({}); }} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={!form.description} className="btn-primary">Log Event</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}