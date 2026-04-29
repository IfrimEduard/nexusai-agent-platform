import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cpu, Zap, Brain, Puzzle, Shield, Activity, TrendingUp, Hexagon } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tables = ['ai_models', 'skills', 'plugins', 'brain_config', 'auto_heal_rules', 'auto_grow_rules', 'patterns', 'frameworks', 'agent_limitations', 'governance_rules', 'api_registry', 'approval_requests', 'action_log', 'secrets_vault', 'spending_limits'];
      const counts: Record<string, number> = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        counts[t] = count ?? 0;
      }
      setStats(counts);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: 'Models', count: stats.ai_models ?? 0, icon: Cpu, color: 'cyan' },
    { label: 'Skills', count: stats.skills ?? 0, icon: Zap, color: 'emerald' },
    { label: 'Plugins', count: stats.plugins ?? 0, icon: Puzzle, color: 'blue' },
    { label: 'Brain Config', count: stats.brain_config ?? 0, icon: Brain, color: 'amber' },
    { label: 'Heal Rules', count: stats.auto_heal_rules ?? 0, icon: Shield, color: 'rose' },
    { label: 'Grow Rules', count: stats.auto_grow_rules ?? 0, icon: TrendingUp, color: 'emerald' },
    { label: 'Patterns', count: stats.patterns ?? 0, icon: Hexagon, color: 'cyan' },
    { label: 'Frameworks', count: stats.frameworks ?? 0, icon: Activity, color: 'blue' },
    { label: 'Limitations', count: stats.agent_limitations ?? 0, icon: Shield, color: 'amber' },
    { label: 'Governance Rules', count: stats.governance_rules ?? 0, icon: Shield, color: 'rose' },
    { label: 'APIs Registered', count: stats.api_registry ?? 0, icon: Activity, color: 'cyan' },
    { label: 'Pending Approvals', count: stats.approval_requests ?? 0, icon: Shield, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">NexusAI Agent Platform Overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-${c.color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${c.color}-400`} />
                </div>
                <span className="text-xs text-slate-400">{c.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{c.count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}