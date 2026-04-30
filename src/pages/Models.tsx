import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Plus, Pencil, Trash2, Cpu, Eye, Zap, Download, RefreshCw, CheckCircle, XCircle, Server, FolderOpen, Search, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import Toggle from '../components/Toggle';

interface Model {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  endpoint: string;
  parameters: Record<string, unknown>;
  max_tokens: number;
  temperature: number;
  status: string;
  enabled: boolean;
  serving_method: string;
  context_length: number;
  quantization: string;
  vision_capable: boolean;
  tool_use_capable: boolean;
  is_default: boolean;
  auto_evolve_enabled: boolean;
  total_interactions: number;
  total_learnings: number;
  created_by: string;
  created_at: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

const PROVIDERS = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'local', 'custom'];
const MODEL_TYPES = ['llm', 'embedding', 'image', 'audio', 'multimodal'];
const SERVING_METHODS = ['ollama', 'api', 'local', 'vllm', 'tgi'];

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

const POPULAR_MODELS = [
  { name: 'llama3.1', desc: 'Meta Llama 3.1 8B', size: '~4.7 GB' },
  { name: 'llama3.1:70b', desc: 'Meta Llama 3.1 70B', size: '~40 GB' },
  { name: 'mistral', desc: 'Mistral 7B v0.3', size: '~4.1 GB' },
  { name: 'mixtral', desc: 'Mixtral 8x7B', size: '~26 GB' },
  { name: 'gemma2', desc: 'Google Gemma 2 9B', size: '~5.4 GB' },
  { name: 'phi3', desc: 'Microsoft Phi-3 Mini', size: '~2.3 GB' },
  { name: 'qwen2', desc: 'Alibaba Qwen2 7B', size: '~4.4 GB' },
  { name: 'codellama', desc: 'Code Llama 7B', size: '~3.8 GB' },
  { name: 'deepseek-coder', desc: 'DeepSeek Coder 6.7B', size: '~3.8 GB' },
  { name: 'llava', desc: 'LLaVA 1.6 (Vision)', size: '~4.5 GB' },
  { name: 'nomic-embed-text', desc: 'Nomic Embed Text', size: '~274 MB' },
  { name: 'mxbai-embed-large', desc: 'Mixedbread Embed Large', size: '~670 MB' },
];

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [form, setForm] = useState<Partial<Model>>({});
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [showOllamaPanel, setShowOllamaPanel] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [localTab, setLocalTab] = useState<'detected' | 'manual' | 'install'>('detected');
  const [manualForm, setManualForm] = useState({ name: '', model_type: 'llm', family: '', parameter_size: '', quantization: '', context_length: 4096, vision_capable: false, tool_use_capable: true });
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);
  const [pullStatus, setPullStatus] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('ai_models').select('*').order('created_at', { ascending: false });
    setModels(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function checkOllama() {
    setOllamaLoading(true);
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setOllamaModels(data.models || []);
        setOllamaConnected(true);
      } else {
        setOllamaConnected(false);
        setOllamaModels([]);
      }
    } catch {
      setOllamaConnected(false);
      setOllamaModels([]);
    }
    setOllamaLoading(false);
  }

  async function importOllamaModel(om: OllamaModel) {
    setImporting(om.name);
    const userId = await getUserId();
    const sizeGB = (om.size / (1024 * 1024 * 1024)).toFixed(1);
    const family = om.details?.families?.[0] || om.details?.family || 'unknown';
    const isVision = family.includes('llava') || family.includes('vision') || om.name.includes('vision');
    const isEmbedding = family.includes('embed') || om.name.includes('embed');

    const newModel = {
      name: om.name,
      provider: 'local',
      model_type: isEmbedding ? 'embedding' : 'llm',
      endpoint: OLLAMA_URL,
      serving_method: 'ollama',
      status: 'active',
      enabled: true,
      max_tokens: 4096,
      temperature: 0.7,
      context_length: 4096,
      quantization: om.details?.quantization_level || '',
      vision_capable: isVision,
      tool_use_capable: !isEmbedding,
      is_default: false,
      auto_evolve_enabled: true,
      parameters: {
        ollama_model: om.model,
        family: om.details?.family,
        parameter_size: om.details?.parameter_size,
        format: om.details?.format,
        size_gb: sizeGB,
        digest: om.digest,
      },
      created_by: userId,
    };

    await supabase.from('ai_models').insert(newModel);
    setImporting(null);
    load();
  }

  function isOllamaModelImported(om: OllamaModel) {
    return models.some(m => m.parameters?.ollama_model === om.model || m.name === om.name);
  }

  async function importManualModel() {
    if (!manualForm.name) return;
    setImporting('manual');
    const userId = await getUserId();
    const fileName = manualFile?.name || '';

    const newModel = {
      name: manualForm.name,
      provider: 'local',
      model_type: manualForm.model_type,
      endpoint: manualFile ? `file://${fileName}` : OLLAMA_URL,
      serving_method: manualFile ? 'local' : 'ollama',
      status: 'active',
      enabled: true,
      max_tokens: 4096,
      temperature: 0.7,
      context_length: manualForm.context_length,
      quantization: manualForm.quantization,
      vision_capable: manualForm.vision_capable,
      tool_use_capable: manualForm.tool_use_capable,
      is_default: false,
      auto_evolve_enabled: true,
      parameters: {
        family: manualForm.family || 'unknown',
        parameter_size: manualForm.parameter_size || '',
        file_name: fileName,
        file_size: manualFile ? `${(manualFile.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : '',
        source: manualFile ? 'file_import' : 'manual',
      },
      created_by: userId,
    };

    await supabase.from('ai_models').insert(newModel);
    setManualForm({ name: '', model_type: 'llm', family: '', parameter_size: '', quantization: '', context_length: 4096, vision_capable: false, tool_use_capable: true });
    setManualFile(null);
    setImporting(null);
    load();
  }

  async function pullModel(modelName: string) {
    setPulling(modelName);
    setPullStatus(prev => ({ ...prev, [modelName]: 'Pulling...' }));
    try {
      const res = await fetch(`${OLLAMA_URL}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: false }),
        signal: AbortSignal.timeout(600000),
      });
      if (res.ok) {
        setPullStatus(prev => ({ ...prev, [modelName]: 'Done' }));
        checkOllama();
      } else {
        setPullStatus(prev => ({ ...prev, [modelName]: 'Failed' }));
      }
    } catch {
      setPullStatus(prev => ({ ...prev, [modelName]: 'Failed' }));
    }
    setPulling(null);
  }

  async function save() {
    const userId = await getUserId();
    if (editing) {
      await supabase.from('ai_models').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('ai_models').insert({ ...form, created_by: userId });
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
    load();
  }

  async function remove(id: string) {
    await supabase.from('ai_models').delete().eq('id', id);
    load();
  }

  async function toggleEnabled(model: Model) {
    await supabase.from('ai_models').update({ enabled: !model.enabled }).eq('id', model.id);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ provider: 'openai', model_type: 'llm', serving_method: 'api', max_tokens: 4096, temperature: 0.7, context_length: 4096, enabled: true, vision_capable: false, tool_use_capable: true, is_default: false, auto_evolve_enabled: true, status: 'active' });
    setShowModal(true);
  }

  function openEdit(m: Model) {
    setEditing(m);
    setForm(m);
    setShowModal(true);
  }

  const statusColor: Record<string, string> = { active: 'text-emerald-400 bg-emerald-500/10', inactive: 'text-slate-400 bg-slate-500/10', error: 'text-rose-400 bg-rose-500/10' };

  const filteredPopular = POPULAR_MODELS.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isModelPulled = (name: string) => ollamaModels.some(om => om.name === name || om.name.startsWith(name.split(':')[0]));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Models</h1>
          <p className="text-sm text-slate-400 mt-1">Manage AI models and configurations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowOllamaPanel(!showOllamaPanel); if (!showOllamaPanel) checkOllama(); }} className={`btn-secondary flex items-center gap-2 ${showOllamaPanel ? 'border-cyan-500/30 text-cyan-400' : ''}`}>
            <Server className="w-4 h-4" /> Local Models
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Model
          </button>
        </div>
      </div>

      {showOllamaPanel && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Local Models</h3>
                <p className="text-xs text-slate-500">Detect, import, or install local models</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                {ollamaConnected ? (
                  <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Ollama Connected</span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400"><XCircle className="w-3.5 h-3.5" /> Ollama Not Detected</span>
                )}
              </div>
              <button onClick={checkOllama} disabled={ollamaLoading} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${ollamaLoading ? 'animate-spin' : ''}`} /> Scan
              </button>
            </div>
          </div>

          <div className="flex gap-1 bg-[#0a0e17] rounded-lg p-1 border border-[#1e2d3d]">
            {[
              { key: 'detected', label: 'Detected', icon: Cpu },
              { key: 'manual', label: 'Manual Import', icon: FolderOpen },
              { key: 'install', label: 'Install New', icon: Download },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setLocalTab(tab.key as typeof localTab)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md transition-colors ${localTab === tab.key ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {localTab === 'detected' && (
            <div className="space-y-3">
              {!ollamaConnected && !ollamaLoading && (
                <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d]">
                  <p className="text-sm text-slate-300 mb-2">Ollama is not running or not installed.</p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p>1. Install Ollama: <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></p>
                    <p>2. Pull a model: <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">ollama pull llama3.1</code></p>
                    <p>3. Start Ollama: <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">ollama serve</code></p>
                    <p>4. Click <strong>Scan</strong> to detect your models</p>
                  </div>
                </div>
              )}

              {ollamaConnected && ollamaModels.length === 0 && (
                <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d] text-center">
                  <p className="text-sm text-slate-400">No local models found. Go to <strong>Install New</strong> tab to download one.</p>
                </div>
              )}

              {ollamaModels.length > 0 && (
                <div className="space-y-2">
                  {ollamaModels.map((om) => {
                    const imported = isOllamaModelImported(om);
                    const sizeGB = (om.size / (1024 * 1024 * 1024)).toFixed(1);
                    const isImporting = importing === om.name;
                    return (
                      <div key={om.name} className="flex items-center justify-between bg-[#0a0e17] rounded-lg p-3 border border-[#1e2d3d]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-100">{om.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{om.details?.parameter_size || 'Unknown size'}</span>
                              <span>{sizeGB} GB</span>
                              <span>{om.details?.quantization_level || ''}</span>
                              {om.details?.family && <span className="badge-info">{om.details.family}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {imported ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded"><CheckCircle className="w-3 h-3" /> Imported</span>
                          ) : (
                            <button onClick={() => importOllamaModel(om)} disabled={isImporting} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
                              {isImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                              {isImporting ? 'Importing...' : 'Import'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {localTab === 'manual' && (
            <div className="space-y-4">
              <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d] space-y-4">
                <p className="text-xs text-slate-400">Import a model file (GGUF, safetensors, etc.) from your computer. Works with any model, not just Ollama.</p>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Model File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gguf,.safetensors,.bin,.pt,.onnx,.ggml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setManualFile(file);
                        if (!manualForm.name) {
                          const baseName = file.name.replace(/\.[^.]+$/, '').replace(/-v?\d+(\.\d+)*$/, '');
                          setManualForm(prev => ({ ...prev, name: baseName }));
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 bg-[#111827] border border-[#1e2d3d] rounded-lg p-3 hover:border-cyan-500/30 transition-colors text-left"
                  >
                    <FolderOpen className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {manualFile ? (
                        <>
                          <p className="text-sm text-slate-100 truncate">{manualFile.name}</p>
                          <p className="text-xs text-slate-500">{(manualFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-slate-300">Click to select a model file</p>
                          <p className="text-xs text-slate-500">GGUF, safetensors, bin, pt, onnx, ggml</p>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Model Name</label>
                    <input value={manualForm.name} onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))} className="input-field" placeholder="e.g. my-custom-model" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <select value={manualForm.model_type} onChange={(e) => setManualForm(prev => ({ ...prev, model_type: e.target.value }))} className="select-field">
                      {MODEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Family</label>
                    <input value={manualForm.family} onChange={(e) => setManualForm(prev => ({ ...prev, family: e.target.value }))} className="input-field" placeholder="e.g. llama" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Parameters</label>
                    <input value={manualForm.parameter_size} onChange={(e) => setManualForm(prev => ({ ...prev, parameter_size: e.target.value }))} className="input-field" placeholder="e.g. 7B" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Quantization</label>
                    <input value={manualForm.quantization} onChange={(e) => setManualForm(prev => ({ ...prev, quantization: e.target.value }))} className="input-field" placeholder="e.g. Q4_K_M" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Context Length</label>
                    <input type="number" value={manualForm.context_length} onChange={(e) => setManualForm(prev => ({ ...prev, context_length: parseInt(e.target.value) || 4096 }))} className="input-field" />
                  </div>
                  <div className="flex items-end gap-4 pb-1">
                    <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={manualForm.vision_capable} onChange={(e) => setManualForm(prev => ({ ...prev, vision_capable: e.target.checked }))} className="rounded" /> Vision</label>
                    <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={manualForm.tool_use_capable} onChange={(e) => setManualForm(prev => ({ ...prev, tool_use_capable: e.target.checked }))} className="rounded" /> Tool Use</label>
                  </div>
                </div>

                <button onClick={importManualModel} disabled={!manualForm.name || importing === 'manual'} className="btn-primary w-full flex items-center justify-center gap-2">
                  {importing === 'manual' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {importing === 'manual' ? 'Importing...' : 'Import Model'}
                </button>
              </div>

              <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d] space-y-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-medium text-slate-100">Or: Add Custom Ollama Model</h4>
                </div>
                <p className="text-xs text-slate-400">If your model is served by Ollama but not detected by scan, enter its name here. This works for models from HuggingFace, custom GGUF files loaded via Modelfile, etc.</p>
                <CustomOllamaInput onAdded={() => { checkOllama(); load(); }} />
              </div>
            </div>
          )}

          {localTab === 'install' && (
            <div className="space-y-4">
              {!ollamaConnected ? (
                <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d] text-center">
                  <p className="text-sm text-slate-400 mb-2">Ollama must be running to install models.</p>
                  <p className="text-xs text-slate-500">Start it with: <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">ollama serve</code></p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Search models (e.g. llama, mistral, code)..."
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {filteredPopular.map((pm) => {
                      const pulled = isModelPulled(pm.name);
                      const status = pullStatus[pm.name];
                      const isPulling = pulling === pm.name;
                      const imported = models.some(m => m.name === pm.name);

                      return (
                        <div key={pm.name} className="flex items-center justify-between bg-[#0a0e17] rounded-lg p-3 border border-[#1e2d3d]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pulled ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                              <Cpu className={`w-4 h-4 ${pulled ? 'text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-slate-100">{pm.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{pm.desc}</span>
                                <span>{pm.size}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {imported && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">imported</span>}
                            {pulled && !imported && <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">downloaded</span>}
                            {status === 'Failed' && <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">failed</span>}
                            {status === 'Done' && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">done</span>}
                            {!pulled && (
                              <button onClick={() => pullModel(pm.name)} disabled={isPulling} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
                                {isPulling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                {isPulling ? 'Pulling...' : 'Pull'}
                              </button>
                            )}
                            {pulled && !imported && (
                              <button onClick={() => {
                                const om = ollamaModels.find(m => m.name === pm.name || m.name.startsWith(pm.name.split(':')[0]));
                                if (om) importOllamaModel(om);
                              }} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5">
                                <Plus className="w-3 h-3" /> Import
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2d3d] space-y-3">
                    <h4 className="text-sm font-medium text-slate-100">Pull a specific model</h4>
                    <p className="text-xs text-slate-400">Enter any model name from <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">ollama.com/library</a> or a HuggingFace GGUF repo.</p>
                    <CustomOllamaPullInput onPulled={() => { checkOllama(); }} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400">Total</p><p className="text-2xl font-bold text-slate-100">{models.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Active</p><p className="text-2xl font-bold text-emerald-400">{models.filter(m => m.enabled).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Interactions</p><p className="text-2xl font-bold text-cyan-400">{models.reduce((s, m) => s + (m.total_interactions || 0), 0)}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Learnings</p><p className="text-2xl font-bold text-amber-400">{models.reduce((s, m) => s + (m.total_learnings || 0), 0)}</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => (
          <div key={m.id} className="card-hover p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.serving_method === 'ollama' || m.serving_method === 'local' ? 'bg-emerald-500/10' : 'bg-cyan-500/10'}`}>
                  <Cpu className={`w-4 h-4 ${m.serving_method === 'ollama' || m.serving_method === 'local' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{m.name}</h3>
                  <p className="text-xs text-slate-500">{m.provider} / {m.model_type}</p>
                </div>
              </div>
              <Toggle enabled={m.enabled} onChange={() => toggleEnabled(m)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColor[m.status] || statusColor.inactive}`}>{m.status}</span>
              {m.is_default && <span className="badge-active">default</span>}
              {m.vision_capable && <span className="badge-info">vision</span>}
              {m.tool_use_capable && <span className="badge-info">tools</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.serving_method === 'ollama' || m.serving_method === 'local' ? 'text-emerald-400 bg-emerald-500/10' : 'bg-slate-500/10 text-slate-400'}`}>{m.serving_method}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Tokens:</span> <span className="text-slate-300">{m.max_tokens?.toLocaleString()}</span></div>
              <div><span className="text-slate-500">Context:</span> <span className="text-slate-300">{m.context_length?.toLocaleString()}</span></div>
              <div><span className="text-slate-500">Temp:</span> <span className="text-slate-300">{m.temperature}</span></div>
              <div><span className="text-slate-500">Quant:</span> <span className="text-slate-300">{m.quantization || 'N/A'}</span></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#1e2d3d]">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{m.total_interactions || 0}</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{m.total_learnings || 0}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                {m.created_by !== 'system' && <button onClick={() => remove(m.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="card p-12 text-center">
          <Cpu className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No models configured yet</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => { setShowOllamaPanel(true); checkOllama(); }} className="btn-secondary flex items-center gap-2"><Server className="w-4 h-4" /> Import Local</button>
            <button onClick={openAdd} className="btn-primary">Add Manually</button>
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({}); }} title={editing ? 'Edit Model' : 'Add Model'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. GPT-4o" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Provider</label>
              <select value={form.provider || 'openai'} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="select-field">
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select value={form.model_type || 'llm'} onChange={(e) => setForm({ ...form, model_type: e.target.value })} className="select-field">
                {MODEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Endpoint</label>
            <input value={form.endpoint || ''} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} className="input-field" placeholder="https://api.openai.com/v1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Serving Method</label>
              <select value={form.serving_method || 'api'} onChange={(e) => setForm({ ...form, serving_method: e.target.value })} className="select-field">
                {SERVING_METHODS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Status</label>
              <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="error">error</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Max Tokens</label>
              <input type="number" value={form.max_tokens || 4096} onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Context Length</label>
              <input type="number" value={form.context_length || 4096} onChange={(e) => setForm({ ...form, context_length: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Temperature</label>
              <input type="number" step="0.1" value={form.temperature ?? 0.7} onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Quantization</label>
            <input value={form.quantization || ''} onChange={(e) => setForm({ ...form, quantization: e.target.value })} className="input-field" placeholder="e.g. Q4_K_M" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.vision_capable || false} onChange={(e) => setForm({ ...form, vision_capable: e.target.checked })} className="rounded" /> Vision</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.tool_use_capable || false} onChange={(e) => setForm({ ...form, tool_use_capable: e.target.checked })} className="rounded" /> Tool Use</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.is_default || false} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded" /> Default</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.auto_evolve_enabled || false} onChange={(e) => setForm({ ...form, auto_evolve_enabled: e.target.checked })} className="rounded" /> Auto-Evolve</label>
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

function CustomOllamaInput({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  async function addCustom() {
    if (!name.trim()) return;
    setAdding(true);
    const userId = await getUserId();
    await supabase.from('ai_models').insert({
      name: name.trim(),
      provider: 'local',
      model_type: 'llm',
      endpoint: OLLAMA_URL,
      serving_method: 'ollama',
      status: 'active',
      enabled: true,
      max_tokens: 4096,
      temperature: 0.7,
      context_length: 4096,
      quantization: '',
      vision_capable: false,
      tool_use_capable: true,
      is_default: false,
      auto_evolve_enabled: true,
      parameters: { ollama_model: name.trim(), source: 'custom_ollama' },
      created_by: userId,
    });
    setName('');
    setAdding(false);
    onAdded();
  }

  return (
    <div className="flex gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom()} className="input-field flex-1" placeholder="e.g. hf.co/bartowski/Llama-3.1-8B-Instruct-GGUF" />
      <button onClick={addCustom} disabled={!name.trim() || adding} className="btn-primary flex items-center gap-1.5 text-xs px-4 shrink-0">
        {adding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Add
      </button>
    </div>
  );
}

function CustomOllamaPullInput({ onPulled }: { onPulled: () => void }) {
  const [name, setName] = useState('');
  const [pulling, setPulling] = useState(false);
  const [status, setStatus] = useState('');

  async function pullCustom() {
    if (!name.trim()) return;
    setPulling(true);
    setStatus('Pulling...');
    try {
      const res = await fetch(`${OLLAMA_URL}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), stream: false }),
        signal: AbortSignal.timeout(600000),
      });
      if (res.ok) {
        setStatus('Done! Model downloaded.');
        setName('');
        onPulled();
      } else {
        setStatus('Failed. Check the model name.');
      }
    } catch {
      setStatus('Failed. Is Ollama running?');
    }
    setPulling(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && pullCustom()} className="input-field flex-1" placeholder="e.g. llama3.1 or hf.co/user/model-GGUF" />
        <button onClick={pullCustom} disabled={!name.trim() || pulling} className="btn-primary flex items-center gap-1.5 text-xs px-4 shrink-0">
          {pulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {pulling ? 'Pulling...' : 'Pull'}
        </button>
      </div>
      {status && <p className={`text-xs ${status.startsWith('Done') ? 'text-emerald-400' : status.startsWith('Failed') ? 'text-rose-400' : 'text-cyan-400'}`}>{status}</p>}
    </div>
  );
}