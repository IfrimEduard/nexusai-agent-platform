import { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  Puzzle,
  Zap,
  Brain,
  Bot,
  Shield,
  TrendingUp,
  GraduationCap,
  Hexagon,
  GitBranch,
  Scale,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'chat'
  | 'models'
  | 'plugins'
  | 'skills'
  | 'brain'
  | 'automation'
  | 'auto-heal'
  | 'auto-grow'
  | 'auto-learn'
  | 'patterns'
  | 'frameworks'
  | 'evolution'
  | 'governance'
  | 'config';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  page: Page;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Core',
    items: [
      { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { page: 'chat', label: 'Agent Chat', icon: MessageSquare },
      { page: 'models', label: 'Models', icon: Cpu },
      { page: 'plugins', label: 'Plugins', icon: Puzzle },
      { page: 'skills', label: 'Skills', icon: Zap },
      { page: 'brain', label: 'Brain', icon: Brain },
    ],
  },
  {
    title: 'Automation',
    items: [
      { page: 'automation', label: 'Rules', icon: Bot },
      { page: 'auto-heal', label: 'Auto-Heal', icon: Shield },
      { page: 'auto-grow', label: 'Auto-Grow', icon: TrendingUp },
      { page: 'auto-learn', label: 'Auto-Learn', icon: GraduationCap },
    ],
  },
  {
    title: 'Evolution',
    items: [
      { page: 'patterns', label: 'Patterns', icon: Hexagon },
      { page: 'frameworks', label: 'Frameworks', icon: GitBranch },
      { page: 'evolution', label: 'Self-Evolve', icon: GitBranch },
    ],
  },
  {
    title: 'System',
    items: [
      { page: 'governance', label: 'Governance', icon: Scale },
      { page: 'config', label: 'Configuration', icon: Settings },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-[#111827] border-r border-[#1e2d3d] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1e2d3d]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-bold text-lg tracking-tight">NexusAI</span>
          </div>
        )}
        {collapsed && (
          <Hexagon className="w-5 h-5 text-cyan-400 mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#1e2d3d] text-slate-400 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <div className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
            )}
            {collapsed && (
              <div className="mx-auto my-2 w-6 h-px bg-[#1e2d3d]" />
            )}
            {section.items.map((item) => {
              const isActive = currentPage === item.page;
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'nav-item-active text-cyan-400 bg-[#1e2d3d]/60 border-l-2 border-cyan-400'
                      : 'nav-item text-slate-400 hover:text-white hover:bg-[#1e2d3d]/40 border-l-2 border-transparent'
                  } ${collapsed ? 'justify-center px-0' : 'gap-3'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1e2d3d]">
        <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
        {!collapsed && (
          <span className="text-xs text-slate-400">System Online</span>
        )}
      </div>
    </aside>
  );
}