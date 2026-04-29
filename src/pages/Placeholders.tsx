import { Hexagon } from 'lucide-react';

function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        <p className="text-sm text-slate-400 mt-1">{desc}</p>
      </div>
      <div className="card p-12 text-center">
        <Hexagon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">Coming soon</p>
      </div>
    </div>
  );
}

export const ChatRoom = () => <PlaceholderPage title="Agent Chat" desc="Chat with your AI agent" />;
export const Models = () => <PlaceholderPage title="Models" desc="Manage AI models and configurations" />;
export const Plugins = () => <PlaceholderPage title="Plugins" desc="Manage agent plugins and extensions" />;
export const Brain = () => <PlaceholderPage title="Brain" desc="Configure agent brain and reasoning" />;
export const Automation = () => <PlaceholderPage title="Automation Rules" desc="Define automation rules and triggers" />;
export const AutoHeal = () => <PlaceholderPage title="Auto-Heal" desc="Self-healing rules and error recovery" />;
export const AutoGrow = () => <PlaceholderPage title="Auto-Grow" desc="Growth and scaling rules" />;
export const AutoLearn = () => <PlaceholderPage title="Auto-Learn" desc="Learning sessions and knowledge acquisition" />;
export const Patterns = () => <PlaceholderPage title="Patterns" desc="Discovered patterns and behaviors" />;
export const Frameworks = () => <PlaceholderPage title="Frameworks" desc="Agent frameworks and methodologies" />;
export const Evolution = () => <PlaceholderPage title="Self-Evolve" desc="Agent evolution and self-improvement log" />;
export const Config = () => <PlaceholderPage title="Configuration" desc="System configuration and settings" />;