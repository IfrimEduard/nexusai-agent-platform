import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, Settings, Save } from 'lucide-react';
import Modal from '../components/Modal';

interface SystemConfig {
  id: string;
  key: string;
  value: Record<string, unknown>;
  category: string;
  description: string;
  updated_at: string;
  created_by: string;
}

const CATEGORIES = ['general', 'agent', 'security', 'performance', 'logging', 'api'];

export default function Config() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SystemConfig | null>(null);
  const [form, setForm] = useState<Partial<SystemConfig>>({});
  const [filter, setFilter] = useState('all');
  const [jsonValue, setJsonValue] = useState('{}');
  const [jsonError, setJsonError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('system_config').select('*').order('category');
    setConfigs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    try {
      const parsed = JSON.parse(jsonValue);
      if (editing) {
        await supabase.from('system_config').update({ key: form.key, value: parsed, category: form.category, description: form.description, updated_at: new Date().toISOString() }).eq('id', editing.id);
      } else {
        await supabase.from('system_config').insert({ key: form.key, value: parsed, category: form.category, description: form.description, created_by: userId });
      }
      setShowModal(false);
      setEditing(null);
      setForm({});
      setJsonValue('{}');
      load();
    } catch {
      setJsonError('Invalid JSON');
    }
  }

  async function remove(id: string) {
    await supabase.from('system_config').delete().eq('id', id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ category: 'general', description: '', key: '' });
    setJsonValue('{}');
    setJsonError('');
    setShowModal(true);
  }

  function openEdit(c: SystemConfig) {
    setEditing(c);
    setForm(c);
    setJsonValue(JSON.stringify(c.value, null, 2));
    setJsonError('');
    setShowModal(true);
  }

  const filtered = filter === 'all' ? configs : configs.filter(c => c.category === filter);
  const catColor: Record<string, string> = { general: 'text-slate-400 bg-slate-500/10', agent: 'text-cyan-400 bg-cyan-500/10', security: 'text-rose-400 bg-rose-500/10', performance: 'text-amber-400 bg-amber-500/10', logging: 'text-blue-400 bg-blue-500/10', api: 'text-emerald-400 bg-emerald-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Configuration</h1>
          <p className="text-sm text-slate-400 mt-1">System configuration and settings</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Setting</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total Keys</p><p className="text-2xl font-bold text-slate-100">{configs.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Agent</p><p className="text-2xl font-bold text-cyan-400">{configs.filter(c => c.category === 'agent').length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Security</p><p className="text-2xl font-bold text-rose-400">{configs.filter(c => c.category === 'security').length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">API</p><p className="text-2xl font-bold text-emerald-400">{configs.filter(c => c.category === 'api').length}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>{c === 'all' ? 'All' : c}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{c.key}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColor[c.category] || catColor.general}`}>{c.category}</span>
                    {c.created_by === 'system' && <span className="badge-info">System</span>}
                  </div>
                  {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                {c.created_by !== 'system' && <button onClick={() => remove(c.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
            <div className="mt-3 bg-[#0a0e17] rounded-lg p-3 border border-[#1e2d3d]">
              <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(c.value, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Settings className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No configuration settings found</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add a setting</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Setting' : 'Add Setting'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Key</label>
            <input value={form.key || ''} onChange={(e) => setForm({ ...form, key: e.target.value })} className="input-field" placeholder="e.g. max_retries" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select value={form.category || 'general'} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Value (JSON)</label>
            <textarea value={jsonValue} onChange={(e) => { setJsonValue(e.target.value); try { JSON.parse(e.target.value); setJsonError(''); } catch { setJsonError('Invalid JSON'); } }} className="input-field min-h-[120px] font-mono text-xs" />
            {jsonError && <p className="text-xs text-rose-400 mt-1">{jsonError}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowModal(false); setEditing(null); setForm({}); }} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={!form.key || !!jsonError} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
