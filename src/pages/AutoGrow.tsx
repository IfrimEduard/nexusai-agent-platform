import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, TrendingUp, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface GrowRule {
  id: string;
  name: string;
  trigger: string;
  growth_action: string;
  metric: string;
  threshold: number;
  enabled: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
  success_rate: number;
  created_by: string;
}

const METRICS = ['usage', 'error_rate', 'latency', 'cost', 'capacity', 'demand'];

export default function AutoGrow() {
  const [rules, setRules] = useState<GrowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GrowRule | null>(null);
  const [form, setForm] = useState<Partial<GrowRule>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from('auto_grow_rules').select('*').order('created_at', { ascending: false });
    setRules(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('auto_grow_rules').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('auto_grow_rules').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('auto_grow_rules').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(r: GrowRule) {
    await supabase.from('auto_grow_rules').update({ enabled: !r.enabled }).eq('id', r.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ metric: 'usage', threshold: 80, enabled: true });
    setShowModal(true);
  }

  function openEdit(r: GrowRule) {
    setEditing(r);
    setForm(r);
    setShowModal(true);
  }

  const metricColor: Record<string, string> = { usage: 'text-cyan-400 bg-cyan-500/10', error_rate: 'text-rose-400 bg-rose-500/10', latency: 'text-amber-400 bg-amber-500/10', cost: 'text-emerald-400 bg-emerald-500/10', capacity: 'text-blue-400 bg-blue-500/10', demand: 'text-slate-300 bg-slate-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Auto-Grow</h1>
          <p className="text-sm text-slate-400 mt-1">Growth and scaling rules</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Rule</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{rules.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Active</p><p className="text-2xl font-bold text-emerald-400">{rules.filter(r => r.enabled).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Triggers</p><p className="text-2xl font-bold text-cyan-400">{rules.reduce((s, r) => s + (r.trigger_count || 0), 0)}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Avg Success</p><p className="text-2xl font-bold text-amber-400">{rules.length ? (rules.reduce((s, r) => s + (r.success_rate || 0), 0) / rules.length).toFixed(1) : 0}%</p></div>
      </div>

      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{r.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${metricColor[r.metric] || metricColor.usage}`}>{r.metric}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle enabled={r.enabled} onChange={() => toggleEnabled(r)} />
                <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                {r.created_by !== 'system' && <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Trigger</p>
                <p className="text-xs text-slate-300">{r.trigger || 'Not defined'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Growth Action</p>
                <p className="text-xs text-slate-300">{r.growth_action || 'Not defined'}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-[#1e2d3d]">
              <span>Threshold: {r.threshold}%</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{r.trigger_count || 0} triggers</span>
              <span>{(r.success_rate || 0).toFixed(0)}% success</span>
              {r.last_triggered_at && <span>Last: {new Date(r.last_triggered_at).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No growth rules configured</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add your first rule</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Grow Rule' : 'Add Grow Rule'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Scale on High Usage" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Trigger</label>
            <textarea value={form.trigger || ''} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="input-field min-h-[60px]" placeholder="When CPU usage exceeds threshold" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Growth Action</label>
            <textarea value={form.growth_action || ''} onChange={(e) => setForm({ ...form, growth_action: e.target.value })} className="input-field min-h-[60px]" placeholder="Provision additional compute resources" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Metric</label>
              <select value={form.metric || 'usage'} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="select-field">
                {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Threshold (%)</label>
              <input type="number" value={form.threshold || 80} onChange={(e) => setForm({ ...form, threshold: parseFloat(e.target.value) })} className="input-field" />
            </div>
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