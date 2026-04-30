import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, Hexagon, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Pattern {
  id: string;
  name: string;
  pattern_type: string;
  pattern_data: Record<string, unknown>;
  confidence: number;
  frequency: number;
  enabled: boolean;
  discovered_at: string;
  use_count: number;
  last_used_at: string | null;
  created_by: string;
}

const PATTERN_TYPES = ['behavioral', 'performance', 'error', 'usage', 'optimization', 'security'];

export default function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pattern | null>(null);
  const [form, setForm] = useState<Partial<Pattern>>({});
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data } = await supabase.from('patterns').select('*').order('confidence', { ascending: false });
    setPatterns(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('patterns').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('patterns').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('patterns').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(p: Pattern) {
    await supabase.from('patterns').update({ enabled: !p.enabled }).eq('id', p.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ pattern_type: 'behavioral', confidence: 0, frequency: 0, enabled: true, pattern_data: {} });
    setShowModal(true);
  }

  function openEdit(p: Pattern) {
    setEditing(p);
    setForm(p);
    setShowModal(true);
  }

  const filtered = filter === 'all' ? patterns : patterns.filter(p => p.pattern_type === filter);
  const typeColor: Record<string, string> = { behavioral: 'text-cyan-400 bg-cyan-500/10', performance: 'text-amber-400 bg-amber-500/10', error: 'text-rose-400 bg-rose-500/10', usage: 'text-blue-400 bg-blue-500/10', optimization: 'text-emerald-400 bg-emerald-500/10', security: 'text-orange-400 bg-orange-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Patterns</h1>
          <p className="text-sm text-slate-400 mt-1">Discovered behavioral patterns and insights</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Pattern</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{patterns.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Active</p><p className="text-2xl font-bold text-emerald-400">{patterns.filter(p => p.enabled).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Avg Confidence</p><p className="text-2xl font-bold text-cyan-400">{patterns.length ? (patterns.reduce((s, p) => s + (p.confidence || 0), 0) / patterns.length).toFixed(1) : 0}%</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Total Uses</p><p className="text-2xl font-bold text-amber-400">{patterns.reduce((s, p) => s + (p.use_count || 0), 0)}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...PATTERN_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="card-hover p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Hexagon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor[p.pattern_type] || typeColor.behavioral}`}>{p.pattern_type}</span>
                </div>
              </div>
              <Toggle enabled={p.enabled} onChange={() => toggleEnabled(p)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Confidence</span>
                <span className="text-slate-300">{(p.confidence || 0).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, p.confidence || 0)}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#1e2d3d]">
              <div className="flex items-center gap-3">
                <span>Freq: {p.frequency || 0}</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{p.use_count || 0}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                {p.created_by !== 'system' && <button onClick={() => remove(p.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Hexagon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No patterns discovered yet</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add a pattern</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Pattern' : 'Add Pattern'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Pattern name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select value={form.pattern_type || 'behavioral'} onChange={(e) => setForm({ ...form, pattern_type: e.target.value })} className="select-field">
                {PATTERN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confidence (%)</label>
              <input type="number" value={form.confidence || 0} onChange={(e) => setForm({ ...form, confidence: parseFloat(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Frequency</label>
            <input type="number" value={form.frequency || 0} onChange={(e) => setForm({ ...form, frequency: parseInt(e.target.value) })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowModal(false); setEditing(null); setForm({}); }} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={!form.name} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}