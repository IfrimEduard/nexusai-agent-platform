import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, Bot, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  enabled: boolean;
  priority: number;
  trigger_count: number;
  last_triggered_at: string | null;
  success_rate: number;
  created_by: string;
}

const TRIGGER_TYPES = ['event', 'schedule', 'threshold', 'webhook', 'manual'];
const ACTION_TYPES = ['notify', 'execute', 'scale', 'heal', 'learn', 'deploy'];

export default function Automation() {
  const [rules, setRules] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [form, setForm] = useState<Partial<Automation>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from('automations').select('*').order('priority');
    setRules(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('automations').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('automations').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('automations').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(r: Automation) {
    await supabase.from('automations').update({ enabled: !r.enabled }).eq('id', r.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ trigger_type: 'event', action_type: 'notify', enabled: true, priority: 5, trigger_config: {}, action_config: {} });
    setShowModal(true);
  }

  function openEdit(r: Automation) {
    setEditing(r);
    setForm(r);
    setShowModal(true);
  }

  const triggerColor: Record<string, string> = { event: 'text-cyan-400 bg-cyan-500/10', schedule: 'text-blue-400 bg-blue-500/10', threshold: 'text-amber-400 bg-amber-500/10', webhook: 'text-emerald-400 bg-emerald-500/10', manual: 'text-slate-400 bg-slate-500/10' };
  const actionColor: Record<string, string> = { notify: 'text-blue-400 bg-blue-500/10', execute: 'text-cyan-400 bg-cyan-500/10', scale: 'text-emerald-400 bg-emerald-500/10', heal: 'text-rose-400 bg-rose-500/10', learn: 'text-amber-400 bg-amber-500/10', deploy: 'text-slate-300 bg-slate-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Automation Rules</h1>
          <p className="text-sm text-slate-400 mt-1">Define automation triggers and actions</p>
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
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{r.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400">P{r.priority}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle enabled={r.enabled} onChange={() => toggleEnabled(r)} />
                <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">WHEN</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${triggerColor[r.trigger_type] || triggerColor.event}`}>{r.trigger_type}</span>
              </div>
              <Zap className="w-3 h-3 text-slate-500" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">DO</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${actionColor[r.action_type] || actionColor.execute}`}>{r.action_type}</span>
              </div>
              <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{r.trigger_count || 0}</span>
                <span>{(r.success_rate || 0).toFixed(0)}% success</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="card p-12 text-center">
          <Bot className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No automation rules yet</p>
          <button onClick={openAdd} className="btn-primary mt-4">Create your first rule</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Rule' : 'Add Rule'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Rule name" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Trigger Type</label>
              <select value={form.trigger_type || 'event'} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} className="select-field">
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Action Type</label>
              <select value={form.action_type || 'notify'} onChange={(e) => setForm({ ...form, action_type: e.target.value })} className="select-field">
                {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Priority (1-10)</label>
            <input type="number" min={1} max={10} value={form.priority || 5} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} className="input-field" />
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