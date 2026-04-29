import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import {
  AlertTriangle,
  Scale,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Database,
  Activity,
  ChevronDown,
  AlertOctagon,
} from 'lucide-react';
import Toggle from '../components/Toggle';

interface Limitation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  mitigation: string;
  severity: string;
  awareness_level: number;
  auto_manage: boolean;
}

interface ApprovalRequest {
  id: string;
  action_type: string;
  description: string;
  risk_level: string;
  estimated_cost: number;
  status: string;
  requested_by: string;
  review_notes: string | null;
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

interface GovernanceRule {
  id: string;
  rule_name: string;
  description: string;
  action_category: string;
  auto_approve: boolean;
  requires_approval: boolean;
  risk_threshold: string;
  is_active: boolean;
  priority: number;
}

interface SpendingLimit {
  id: string;
  scope: string;
  limit_type: string;
  max_amount: number;
  current_spend: number;
  currency: string;
  alert_threshold: number;
  is_active: boolean;
}

interface ActionLogEntry {
  id: string;
  session_id: string;
  action_type: string;
  action_name: string;
  target: string;
  result: string;
  success: boolean;
  risk_level: string;
  created_at: string;
}

interface APIRegistryEntry {
  id: string;
  name: string;
  description: string;
  base_url: string;
  auth_method: string;
  category: string;
  status: string;
  reliability_score: number;
}

type TabType = 'limitations' | 'approvals' | 'rules' | 'spending' | 'api-registry' | 'action-log';

const SEVERITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500' },
  high: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  medium: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500' },
  low: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500' },
};

const RISK_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500' },
  high: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  medium: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500' },
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
};

const Governance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('limitations');
  const [limitations, setLimitations] = useState<Limitation[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [spending, setSpending] = useState<SpendingLimit[]>([]);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [apiRegistry, setApiRegistry] = useState<APIRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [limRes, appRes, rulesRes, spendRes, logRes, apiRes] = await Promise.all([
      supabase.from('agent_limitations').select('*').order('severity', { ascending: false }),
      supabase.from('approval_requests').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('governance_rules').select('*').order('priority', { ascending: true }),
      supabase.from('spending_limits').select('*').eq('is_active', true),
      supabase.from('action_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('api_registry').select('*').order('created_at', { ascending: false }),
    ]);
    setLimitations((limRes.data ?? []) as Limitation[]);
    setApprovals((appRes.data ?? []) as ApprovalRequest[]);
    setRules((rulesRes.data ?? []) as GovernanceRule[]);
    setSpending((spendRes.data ?? []) as SpendingLimit[]);
    setActionLog((logRes.data ?? []) as ActionLogEntry[]);
    setApiRegistry((apiRes.data ?? []) as APIRegistryEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApproval = async (id: string, approved: boolean) => {
    const userId = await getUserId();
    await supabase.from('approval_requests').update({
      status: approved ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    }).eq('id', id);
    loadData();
  };

  const toggleRule = async (rule: GovernanceRule) => {
    await supabase.from('governance_rules').update({ is_active: !rule.is_active }).eq('id', rule.id);
    loadData();
  };

  const toggleRuleApproval = async (rule: GovernanceRule) => {
    await supabase.from('governance_rules').update({
      requires_approval: !rule.requires_approval,
      auto_approve: rule.requires_approval,
    }).eq('id', rule.id);
    loadData();
  };

  const toggleAutoManage = async (lim: Limitation) => {
    await supabase.from('agent_limitations').update({ auto_manage: !lim.auto_manage }).eq('id', lim.id);
    loadData();
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const criticalLimitations = limitations.filter((l) => l.severity === 'critical' || l.severity === 'high');

  const tabs: { id: TabType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'limitations', label: 'Limitations', icon: AlertTriangle, count: limitations.length },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle, count: pendingApprovals.length },
    { id: 'rules', label: 'Rules', icon: Scale, count: rules.length },
    { id: 'spending', label: 'Spending', icon: DollarSign, count: spending.length },
    { id: 'api-registry', label: 'API Registry', icon: Database, count: apiRegistry.length },
    { id: 'action-log', label: 'Action Log', icon: Activity, count: actionLog.length },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Governance</h1>
          <p className="text-sm text-slate-400 mt-1">Limitations awareness, approval workflows, and autonomous operation controls</p>
        </div>
        {criticalLimitations.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400 font-medium">{criticalLimitations.length} critical/high limitations</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">Limitations</p><p className="text-2xl font-bold text-slate-100">{limitations.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">Pending</p><p className="text-2xl font-bold text-slate-100">{pendingApprovals.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">Rules</p><p className="text-2xl font-bold text-slate-100">{rules.filter((r) => r.is_active).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">Auto-Approve</p><p className="text-2xl font-bold text-slate-100">{rules.filter((r) => r.auto_approve && r.is_active).length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">APIs</p><p className="text-2xl font-bold text-slate-100">{apiRegistry.length}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400 mb-1">Actions</p><p className="text-2xl font-bold text-slate-100">{actionLog.length}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'bg-[#1a2332] text-slate-400 border border-[#1e2d3d] hover:text-slate-200'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && <span className="ml-1 text-[10px] opacity-70">({tab.count})</span>}
            </button>
          );
        })}
      </div>

      {activeTab === 'limitations' && (
        <div className="space-y-3">
          {limitations.map((lim) => {
            const colors = SEVERITY_COLORS[lim.severity] ?? SEVERITY_COLORS.medium;
            const isExpanded = expandedId === lim.id;
            return (
              <div key={lim.id} className={`card-hover p-4 border-l-2 ${colors.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-200">{lim.title}</h3>
                        <span className={`badge-info ${colors.text}`}>{lim.severity}</span>
                        <span className="badge-info">{lim.category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{lim.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] text-slate-500">{lim.awareness_level}/10</span>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : lim.id)} className="p-1 rounded hover:bg-[#1a2332] text-slate-400 transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 ml-11 space-y-2">
                    <div><p className="text-[10px] font-medium text-rose-400 uppercase tracking-wider mb-1">Impact</p><p className="text-xs text-slate-300">{lim.impact}</p></div>
                    <div><p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider mb-1">Mitigation</p><p className="text-xs text-slate-300">{lim.mitigation}</p></div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-500">Auto-manage:</span>
                      <Toggle enabled={lim.auto_manage} onChange={() => toggleAutoManage(lim)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300">No pending approvals</p>
              <p className="text-xs text-slate-500 mt-1">All requests have been processed</p>
            </div>
          ) : (
            pendingApprovals.map((app) => {
              const colors = RISK_COLORS[app.risk_level] ?? RISK_COLORS.medium;
              return (
                <div key={app.id} className={`card-hover p-4 border-l-2 ${colors.border}`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-200">{app.action_type}</h3>
                        <span className={`badge-info ${colors.text}`}>{app.risk_level} risk</span>
                        <span className="badge-info">{app.requested_by}</span>
                      </div>
                      <p className="text-xs text-slate-400">{app.description}</p>
                      {app.estimated_cost > 0 && <p className="text-xs text-amber-400 mt-1">Estimated cost: ${app.estimated_cost.toFixed(2)}</p>}
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(app.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => handleApproval(app.id, true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleApproval(app.id, false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {approvals.filter((a) => a.status !== 'pending').length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Past Decisions</h3>
              <div className="space-y-2">
                {approvals.filter((a) => a.status !== 'pending').slice(0, 20).map((app) => (
                  <div key={app.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1e2d3d]">
                    {app.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="text-xs text-slate-300 flex-1">{app.action_type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.map((rule) => {
            const colors = RISK_COLORS[rule.risk_threshold] ?? RISK_COLORS.medium;
            return (
              <div key={rule.id} className={`card-hover p-4 ${!rule.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Scale className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-200">{rule.rule_name}</h3>
                        <span className={`badge-info ${colors.text}`}>{rule.risk_threshold}</span>
                        <span className="badge-info">{rule.action_category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">Auto</span>
                      <Toggle enabled={rule.auto_approve} onChange={() => toggleRuleApproval(rule)} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">Active</span>
                      <Toggle enabled={rule.is_active} onChange={() => toggleRule(rule)} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="space-y-4">
          {spending.map((sl) => {
            const pct = sl.max_amount > 0 ? Math.min(100, Math.round((sl.current_spend / sl.max_amount) * 100)) : 0;
            const isOverAlert = pct >= sl.alert_threshold;
            const barColor = isOverAlert ? 'rose' : 'emerald';
            return (
              <div key={sl.id} className="card-hover p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 capitalize">{sl.scope} - {sl.limit_type}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{sl.currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">${sl.current_spend.toFixed(2)} / ${sl.max_amount.toFixed(2)}</span>
                  <span className={isOverAlert ? 'text-rose-400' : 'text-slate-300'}>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                  <div className={`h-full bg-${barColor}-500 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                {isOverAlert && <p className="text-[10px] text-rose-400 mt-1.5">Over {sl.alert_threshold}% alert threshold</p>}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'api-registry' && (
        <div className="space-y-3">
          {apiRegistry.length === 0 ? (
            <div className="card p-8 text-center">
              <Database className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300">No APIs registered yet</p>
              <p className="text-xs text-slate-500 mt-1">The agent will discover and register APIs as it works</p>
            </div>
          ) : (
            apiRegistry.map((api) => (
              <div key={api.id} className="card-hover p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-200">{api.name}</h3>
                      <span className={`badge-info ${api.status === 'active' ? 'text-emerald-400' : api.status === 'discovered' ? 'text-cyan-400' : 'text-slate-400'}`}>{api.status}</span>
                      <span className="badge-info">{api.category}</span>
                    </div>
                    <p className="text-xs text-slate-400">{api.description}</p>
                    {api.base_url && <p className="text-[10px] text-slate-500 mt-1 font-mono">{api.base_url}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <span className="text-[10px] text-slate-500">Auth: {api.auth_method}</span>
                    <span className="text-[10px] text-slate-500">Reliability: {api.reliability_score}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'action-log' && (
        <div className="space-y-2">
          {actionLog.length === 0 ? (
            <div className="card p-8 text-center">
              <Activity className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300">No actions logged yet</p>
            </div>
          ) : (
            actionLog.map((entry) => {
              const colors = RISK_COLORS[entry.risk_level] ?? RISK_COLORS.medium;
              return (
                <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1e2d3d]">
                  {entry.success ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                  <span className="text-xs text-slate-300 flex-shrink-0 w-24 truncate">{entry.action_type}</span>
                  <span className="text-xs text-slate-400 flex-1 truncate">{entry.action_name}</span>
                  {entry.target && <span className="text-[10px] text-slate-500 truncate max-w-32">{entry.target}</span>}
                  <span className={`badge-info ${colors.text} flex-shrink-0`}>{entry.risk_level}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{new Date(entry.created_at).toLocaleTimeString()}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Governance;