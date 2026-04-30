import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import {
  Plus,
  Pencil,
  Trash2,
  Zap,
  Layers,
  ChevronDown,
  Brain as BrainIcon,
  Cpu,
  Dna,
  Shield,
  MessageSquare,
  Puzzle,
  Bot,
  Activity,
  TrendingUp,
  GraduationCap,
  Hexagon,
  GitBranch,
  Settings,
} from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Skill {
  id: string;
  name: string;
  description: string;
  skill_type: string;
  category: string;
  layer: string;
  config: Record<string, unknown>;
  proficiency: number;
  max_proficiency: number;
  enabled: boolean;
  use_count: number;
  created_by: string;
  created_at: string;
}

const LAYERS: {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
}[] = [
  { key: 'essential', label: 'Essential', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Fundamental AI capabilities' },
  { key: 'core', label: 'Core', icon: BrainIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Foundational engineering skills' },
  { key: 'advanced', label: 'Advanced', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Specialized domain capabilities' },
  { key: 'autonomous', label: 'Autonomous', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Self-directed operation skills' },
  { key: 'evolutionary', label: 'Evolutionary', icon: Dna, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', description: 'Meta-improvement skills' },
  { key: 'agent', label: 'Agent', icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Goal management and execution' },
  { key: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Conversational intelligence' },
  { key: 'model', label: 'Model', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Multi-model orchestration' },
  { key: 'plugin', label: 'Plugin', icon: Puzzle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Plugin ecosystem management' },
  { key: 'brain', label: 'Brain', icon: BrainIcon, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', description: 'Memory and reasoning' },
  { key: 'rules', label: 'Rules', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Policy and compliance' },
  { key: 'auto-heal', label: 'Auto-Heal', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', description: 'Self-healing and recovery' },
  { key: 'auto-grow', label: 'Auto-Grow', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: 'Growth and scaling' },
  { key: 'auto-learn', label: 'Auto-Learn', icon: GraduationCap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', description: 'Learning and adaptation' },
  { key: 'patterns', label: 'Patterns', icon: Hexagon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', description: 'Pattern recognition' },
  { key: 'frameworks', label: 'Frameworks', icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', description: 'Architecture and composition' },
  { key: 'meta', label: 'Meta', icon: Settings, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', description: 'System-wide meta skills' },
];

const SKILL_TYPES = [
  'cognitive',
  'technical',
  'perceptual',
  'operational',
  'autonomous',
  'evolutionary',
];

const LAYER_ORDER: Record<string, number> = {
  essential: 0,
  core: 1,
  advanced: 2,
  autonomous: 3,
  evolutionary: 4,
  agent: 5,
  chat: 6,
  model: 7,
  plugin: 8,
  brain: 9,
  rules: 10,
  'auto-heal': 11,
  'auto-grow': 12,
  'auto-learn': 13,
  patterns: 14,
  frameworks: 15,
  meta: 16,
};

const layerMeta = (key: string) =>
  LAYERS.find((l) => l.key === key) ?? LAYERS[0];

const skillTypeColor: Record<string, string> = {
  cognitive: 'text-cyan-400 bg-cyan-500/10',
  technical: 'text-cyan-400 bg-cyan-500/10',
  perceptual: 'text-blue-400 bg-blue-500/10',
  operational: 'text-emerald-400 bg-emerald-500/10',
  autonomous: 'text-amber-400 bg-amber-500/10',
  evolutionary: 'text-rose-400 bg-rose-500/10',
};

interface SkillFormData {
  name: string;
  layer: string;
  skill_type: string;
  description: string;
  proficiency: number;
  max_proficiency: number;
  config: string;
  enabled: boolean;
}

const emptyForm: SkillFormData = {
  name: '',
  layer: 'core',
  skill_type: 'technical',
  description: '',
  proficiency: 1,
  max_proficiency: 10,
  config: '{}',
  enabled: true,
};

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillFormData>(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('layer', { ascending: true });

    if (error) {
      console.error('Failed to fetch skills:', error.message);
    } else {
      setSkills(
        (data as Skill[]).sort(
          (a, b) =>
            (LAYER_ORDER[a.layer] ?? 99) - (LAYER_ORDER[b.layer] ?? 99)
        )
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills =
    activeLayer === 'all'
      ? skills
      : skills.filter((s) => s.layer === activeLayer);

  const totalSkills = skills.length;
  const enabledCount = skills.filter((s) => s.enabled).length;
  const overallProficiency =
    totalSkills > 0
      ? Math.round(
          skills.reduce(
            (acc, s) =>
              acc +
              (s.max_proficiency > 0
                ? (s.proficiency / s.max_proficiency) * 100
                : 0),
            0
          ) / totalSkills
        )
      : 0;
  const totalUses = skills.reduce((acc, s) => acc + s.use_count, 0);
  const agentCreatedCount = skills.filter((s) => s.created_by).length;

  const layerCounts = LAYERS.reduce<Record<string, number>>((acc, l) => {
    acc[l.key] = skills.filter((s) => s.layer === l.key).length;
    return acc;
  }, {});

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      layer: skill.layer,
      skill_type: skill.skill_type,
      description: skill.description,
      proficiency: skill.proficiency,
      max_proficiency: skill.max_proficiency,
      config: JSON.stringify(skill.config ?? {}, null, 2),
      enabled: skill.enabled,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(form.config || '{}');
    } catch { /* empty */ }

    const payload = {
      name: form.name,
      layer: form.layer,
      skill_type: form.skill_type,
      description: form.description,
      proficiency: form.proficiency,
      max_proficiency: form.max_proficiency,
      config: parsedConfig,
      enabled: form.enabled,
      category: form.skill_type,
    };

    if (editingId) {
      const { error } = await supabase
        .from('skills')
        .update(payload)
        .eq('id', editingId);
      if (error) console.error('Update failed:', error.message);
    } else {
      const userId = await getUserId();
      const { error } = await supabase
        .from('skills')
        .insert([{ ...payload, created_by: userId }]);
      if (error) console.error('Insert failed:', error.message);
    }

    setModalOpen(false);
    setSaving(false);
    fetchSkills();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) {
      console.error('Delete failed:', error.message);
    } else {
      fetchSkills();
    }
  };

  const toggleEnabled = async (skill: Skill) => {
    const { error } = await supabase
      .from('skills')
      .update({ enabled: !skill.enabled })
      .eq('id', skill.id);
    if (error) {
      console.error('Toggle failed:', error.message);
    } else {
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, enabled: !s.enabled } : s))
      );
    }
  };

  const isSystemSkill = (skill: Skill) => !skill.created_by;
  const isAgentCreated = (skill: Skill) =>
    !!skill.created_by && skill.created_by !== 'system';

  const proficiencyGradient = (layer: string) => {
    switch (layer) {
      case 'essential': return 'from-blue-500 to-blue-400';
      case 'core': return 'from-cyan-500 to-cyan-400';
      case 'advanced': return 'from-emerald-500 to-emerald-400';
      case 'autonomous': return 'from-amber-500 to-amber-400';
      case 'evolutionary': return 'from-rose-500 to-rose-400';
      default: return 'from-cyan-500 to-emerald-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Layers size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-white">Skills</h1>
            <p className="text-xs text-slate-400">Manage your AI agent's skill tree</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={14} />
          Add Skill
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Skills</p>
          <p className="text-xl font-semibold text-white">{totalSkills}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Enabled</p>
          <p className="text-xl font-semibold text-emerald-400">{enabledCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Proficiency</p>
          <p className="text-xl font-semibold text-cyan-400">{overallProficiency}%</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Uses</p>
          <p className="text-xl font-semibold text-amber-400">{totalUses}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Agent-Created</p>
          <p className="text-xl font-semibold text-rose-400">{agentCreatedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveLayer('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeLayer === 'all'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'bg-[#111827] text-slate-400 border border-[#1e2d3d] hover:text-slate-200'
          }`}
        >
          All ({totalSkills})
        </button>
        {LAYERS.map((l) => {
          const Icon = l.icon;
          return (
            <button
              key={l.key}
              onClick={() => setActiveLayer(l.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeLayer === l.key
                  ? `${l.bg} ${l.color} ${l.border} border`
                  : 'bg-[#111827] text-slate-400 border border-[#1e2d3d] hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {l.label} ({layerCounts[l.key] ?? 0})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading skills...</div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">No skills found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const meta = layerMeta(skill.layer);
            const LayerIcon = meta.icon;
            const profPct = skill.max_proficiency > 0 ? Math.round((skill.proficiency / skill.max_proficiency) * 100) : 0;
            const expanded = expandedId === skill.id;

            return (
              <div key={skill.id} className="card-hover p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{skill.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                      <LayerIcon size={10} />
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`badge-info ${skillTypeColor[skill.skill_type] ?? ''}`}>{skill.skill_type}</span>
                  {isSystemSkill(skill) && <span className="badge-info bg-blue-500/10 text-blue-400">Built-in</span>}
                  {isAgentCreated(skill) && <span className="badge-info bg-rose-500/10 text-rose-400">AI</span>}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{skill.description}</p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Proficiency</span>
                    <span className="text-slate-400">{skill.proficiency}/{skill.max_proficiency} ({profPct}%)</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${proficiencyGradient(skill.layer)} transition-all duration-300`}
                      style={{ width: `${profPct}%` }}
                    />
                  </div>
                </div>

                {skill.config && typeof skill.config === 'object' && Object.keys(skill.config).length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedId(expanded ? null : skill.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <ChevronDown size={10} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                      Capabilities
                    </button>
                    {expanded && (
                      <div className="mt-1.5 space-y-1 pl-3 border-l border-[#1e2d3d]">
                        {Object.entries(skill.config).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">{key}:</span>
                            <span className="text-slate-300">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#1e2d3d]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{skill.use_count.toLocaleString()} uses</span>
                    <Toggle enabled={skill.enabled} onChange={() => toggleEnabled(skill)} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(skill)} className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Edit skill">
                      <Pencil size={12} />
                    </button>
                    {!isSystemSkill(skill) && (
                      <button onClick={() => handleDelete(skill.id)} className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete skill">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Skill' : 'Add Skill'} width="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Skill name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Layer</label>
              <select className="select-field" value={form.layer} onChange={(e) => setForm({ ...form, layer: e.target.value })}>
                {LAYERS.map((l) => (<option key={l.key} value={l.key}>{l.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select className="select-field" value={form.skill_type} onChange={(e) => setForm({ ...form, skill_type: e.target.value })}>
                {SKILL_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this skill..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Proficiency</label>
              <input type="number" className="input-field" min={0} max={form.max_proficiency} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Proficiency</label>
              <input type="number" className="input-field" min={1} value={form.max_proficiency} onChange={(e) => setForm({ ...form, max_proficiency: parseInt(e.target.value, 10) || 1 })} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Config (JSON)</label>
            <textarea className="input-field font-mono text-xs resize-none" rows={4} value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} placeholder='{"key": "value"}' />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Enabled</span>
            <Toggle enabled={form.enabled} onChange={(val) => setForm({ ...form, enabled: val })} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2d3d]">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Skills;