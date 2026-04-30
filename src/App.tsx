import { useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import Governance from './pages/Governance';
import ChatRoom from './pages/ChatRoom';
import Models from './pages/Models';
import Plugins from './pages/Plugins';
import Brain from './pages/Brain';
import Automation from './pages/Automation';
import AutoHeal from './pages/AutoHeal';
import AutoGrow from './pages/AutoGrow';
import AutoLearn from './pages/AutoLearn';
import Patterns from './pages/Patterns';
import Frameworks from './pages/Frameworks';
import Evolution from './pages/Evolution';
import Config from './pages/Config';

const pages: Record<Page, React.FC> = {
  dashboard: Dashboard,
  chat: ChatRoom,
  models: Models,
  plugins: Plugins,
  skills: Skills,
  brain: Brain,
  automation: Automation,
  'auto-heal': AutoHeal,
  'auto-grow': AutoGrow,
  'auto-learn': AutoLearn,
  patterns: Patterns,
  frameworks: Frameworks,
  evolution: Evolution,
  governance: Governance,
  config: Config,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const PageComponent = pages[currentPage];

  return (
    <div className="flex h-screen bg-[#0a0e17] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <PageComponent />
      </main>
    </div>
  );
}
