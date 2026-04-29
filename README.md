# NexusAI - Autonomous Agent Platform

A fully autonomous AI agent platform with skills, governance, limitations awareness, and self-evolution capabilities.

## Features

### Core System
- **Agent Chat** - Interactive conversation with the AI agent
- **Models** - Multi-model management and configuration
- **Skills** - 62 skills across 5 layers (Essential, Core, Advanced, Autonomous, Evolutionary)
- **Plugins** - Extensible plugin system
- **Brain** - Agent reasoning and decision configuration

### Automation
- **Auto-Heal** - Self-healing rules for error recovery
- **Auto-Grow** - Growth and scaling rules
- **Auto-Learn** - Learning sessions and knowledge acquisition

### Evolution
- **Patterns** - Discovered behavioral patterns
- **Frameworks** - Agent methodologies and frameworks
- **Self-Evolve** - Agent evolution and self-improvement tracking

### Governance
- **Limitations Awareness** - 13 known AI limitations with severity, impact, and mitigation strategies
- **Approval Workflows** - Human-in-the-loop governance for sensitive actions
- **Governance Rules** - 15 default rules defining auto-approve vs human-approval actions
- **Spending Limits** - Budget controls with daily/monthly caps and alert thresholds
- **API Registry** - Discovered and registered external services
- **Action Log** - Comprehensive audit trail of all agent actions
- **Secrets Vault** - Secure credential storage

### Security
- Row Level Security (RLS) on all database tables
- Ownership-based access control using `auth.uid()`
- Private data isolation (chat messages, screen data, secrets)
- Shared-read with owner-write for governance data

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Icons**: Lucide React
- **AI Agent**: Custom agent framework with tool orchestration

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account and project

### Setup

1. Clone the repository
```bash
git clone https://github.com/IfrimEduard/nexusai-agent-platform.git
cd nexusai-agent-platform
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the project root
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the Supabase migrations (found in `supabase/migrations/`) against your database

5. Start the development server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Architecture

### Skill Layers
| Layer | Count | Description |
|-------|-------|-------------|
| Essential | 22 | Fundamental AI capabilities (Intent Understanding, Self-Correction, etc.) |
| Core | 10 | Engineering foundations (Software Engineering, Debugging, etc.) |
| Advanced | 10 | Specialized domains (ML, Cloud, Security, etc.) |
| Autonomous | 10 | Self-directed operation (Optimization, Distributed Systems, etc.) |
| Evolutionary | 10 | Meta-improvement (Meta-Learning, Research, Innovation, etc.) |

### Governance Rules
Actions are categorized by risk level:
- **Auto-approve**: Web search, file read/write, code execution, free API calls
- **Requires approval**: Paid API calls, account creation, payments, credential storage, data deletion

### Known Limitations
The agent is aware of 13 operational limitations including payment restrictions, API rate limits, model hallucinations, context window limits, tool fragility, security risks, and more. Each has severity ratings and mitigation strategies.

## License

MIT
