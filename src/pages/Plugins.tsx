import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, Puzzle, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
  enabled: boolean;
  installed_at: string;
  use_count: number;
  last_used_at: string | null;
  created_by: string;
}

const CATEGORIES = ['utility', 'integration', 'analytics', 'security', 'communication', 'storage', 'custom'];

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Plugin | null>(null);
  const [form, setForm] = useState<Partial<Plugin>>({});
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data } = await supabase.from('plugins').select('*').order('installed_at', { ascending: false });
    setPlugins(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('plugins').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('plugins').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('plugins').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(p: Plugin) {
    await supabase.from('plugins').update({ enabled: !p.enabled }).eq('id', p.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ version: '1.0.0', category: 'utility', enabled: true, config: {} });
    setShowModal(true);
  }

  function openEdit(p: Plugin) {
    setEditing(p);
    setForm(p);
    setShowModal(true);
  }

  const filtered = filter === 'all' ? plugins : plugins.filter(p => p.category === filter);
  const catColor: Record<string, string> = { utility: 'text-cyan-400 bg-cyan-500/10', integration: 'text-blue-400 bg-blue-500/10', analytics: 'text-emerald-400 bg-emerald-500/10', security: 'text-rose-400 bg-rose-500/10', communication: 'text-amber-400 bg-amber-500/10', storage: 'text-slate-400 bg-slate-500/10', custom: 'text-slate-300 bg-slate-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Plugins</h1>
          <p className="text-sm text-slate-400 mt-1">Manage agent plugins and extensions</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Plugin</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{plugins.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Active</p><p className="text-2xl font-bold text-emerald-400">{plugins.filter(p => p.enabled).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Total Uses</p><p className="text-2xl font-bold text-cyan-400">{plugins.reduce((s, p) => s + (p.use_count || 0), 0)}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Categories</p><p className="text-2xl font-bold text-amber-400">{new Set(plugins.map(p => p.category)).size}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>{c === 'all' ? 'All' : c}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="card-hover p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Puzzle className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-500">v{p.version}</p>
                </div>
              </div>
              <Toggle enabled={p.enabled} onChange={() => toggleEnabled(p)} />
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{p.description || 'No description'}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColor[p.category] || catColor.custom}`}>{p.category}</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><Zap className="w-3 h-3" />{p.use_count || 0}</span>
            </div>
            <div className="flex justify-end gap-1 pt-2 border-t border-[#1e2d3d]">
              <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              {p.created_by !== 'system' && <button onClick={() => remove(p.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Puzzle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No plugins found</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add your first plugin</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Plugin' : 'Add Plugin'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="My Plugin" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Version</label>
              <input value={form.version || '1.0.0'} onChange={(e) => setForm({ ...form, version: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select value={form.category || 'utility'} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" placeholder="What does this plugin do?" />
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