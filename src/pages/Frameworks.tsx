import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, GitBranch } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  created_by: string;
}

const CATEGORIES = ['reasoning', 'engineering', 'communication', 'safety', 'learning', 'general'];

export default function Frameworks() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Framework | null>(null);
  const [form, setForm] = useState<Partial<Framework>>({});
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data } = await supabase.from('frameworks').select('*').order('created_at', { ascending: false });
    setFrameworks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('frameworks').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('frameworks').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('frameworks').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(f: Framework) {
    await supabase.from('frameworks').update({ enabled: !f.enabled }).eq('id', f.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ version: '1.0.0', category: 'general', enabled: true, config: {} });
    setShowModal(true);
  }

  function openEdit(f: Framework) {
    setEditing(f);
    setForm(f);
    setShowModal(true);
  }

  const filtered = filter === 'all' ? frameworks : frameworks.filter(f => f.category === filter);
  const catColor: Record<string, string> = { reasoning: 'text-cyan-400 bg-cyan-500/10', engineering: 'text-blue-400 bg-blue-500/10', communication: 'text-amber-400 bg-amber-500/10', safety: 'text-rose-400 bg-rose-500/10', learning: 'text-emerald-400 bg-emerald-500/10', general: 'text-slate-400 bg-slate-500/10' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Frameworks</h1>
          <p className="text-sm text-slate-400 mt-1">Agent methodologies and frameworks</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Framework</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{frameworks.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Active</p><p className="text-2xl font-bold text-emerald-400">{frameworks.filter(f => f.enabled).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Categories</p><p className="text-2xl font-bold text-cyan-400">{new Set(frameworks.map(f => f.category)).size}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">System</p><p className="text-2xl font-bold text-amber-400">{frameworks.filter(f => f.created_by === 'system').length}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>{c === 'all' ? 'All' : c}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <div key={f.id} className="card-hover p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{f.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500">v{f.version}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColor[f.category] || catColor.general}`}>{f.category}</span>
                    {f.created_by === 'system' && <span className="badge-info">Built-in</span>}
                  </div>
                </div>
              </div>
              <Toggle enabled={f.enabled} onChange={() => toggleEnabled(f)} />
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{f.description || 'No description'}</p>
            <div className="flex justify-end gap-1 pt-2 border-t border-[#1e2d3d]">
              <button onClick={() => openEdit(f)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              {f.created_by !== 'system' && <button onClick={() => remove(f.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <GitBranch className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No frameworks found</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add a framework</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Framework' : 'Add Framework'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Framework name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Version</label>
              <input value={form.version || '1.0.0'} onChange={(e) => setForm({ ...form, version: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select value={form.category || 'general'} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" placeholder="What does this framework do?" />
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