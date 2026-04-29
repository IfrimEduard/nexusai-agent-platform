# NexusAI - Autonomous Agent Platform

A fully autonomous AI agent platform with skills, governance, limitations awareness, and self-evolution capabilities.

## Quick Start (One Command)

```bash
chmod +x setup.sh && ./setup.sh
```

This single script will:
1. Check for Node.js (install via nvm if missing)
2. Install all npm dependencies
3. Create your `.env` config file from `.env.example`
4. Prompt you to fill in Supabase credentials
5. Check for Ollama (optional local models)
6. Verify the build

Then launch with:

```bash
./launch.sh
```

Or start manually:

```bash
npm run dev
```

## Prerequisites

- **Node.js 18+** (the setup script can install it for you)
- **Supabase account** (free tier works) - [supabase.com](https://supabase.com)
- **Ollama** (optional, for local models) - [ollama.com](https://ollama.com)

## Manual Setup

1. Clone the repository
```bash
git clone https://github.com/IfrimEduard/nexusai-agent-platform.git
cd nexusai-agent-platform
```

2. Install dependencies
```bash
npm install
```

3. Copy the environment template
```bash
cp .env.example .env
```

4. Edit `.env` with your Supabase credentials
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OLLAMA_URL=http://localhost:11434
```

Get your credentials from: [Supabase Dashboard](https://supabase.com/dashboard) > Project Settings > API

5. Run the Supabase migrations (found in `supabase/migrations/`) against your database

6. Start the development server
```bash
npm run dev
```

## Local Models with Ollama

1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
2. Pull a model: `ollama pull llama3.1`
3. Start Ollama: `ollama serve`
4. In the app, go to **Models** > **Local Models** > **Scan**

Detected models can be imported with one click.

## Features

### Core System
- **Agent Chat** - Interactive conversation with the AI agent
- **Models** - Multi-model management with Ollama local model detection
- **Skills** - 68 skills across 17 layers
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
- **Local Models**: Ollama integration

## Architecture

### Skill Layers
| Layer | Count | Description |
|-------|-------|-------------|
| Essential | 22 | Fundamental AI capabilities |
| Core | 10 | Engineering foundations |
| Advanced | 10 | Specialized domains |
| Autonomous | 10 | Self-directed operation |
| Evolutionary | 10 | Meta-improvement |
| Agent | 7 | Agent-specific skills |
| Chat | 5 | Conversation skills |
| Model | 5 | Model management skills |
| Plugin | 5 | Plugin system skills |
| Brain | 6 | Reasoning skills |
| Rules | 5 | Governance skills |
| Auto-Heal | 5 | Self-healing skills |
| Auto-Grow | 5 | Growth skills |
| Auto-Learn | 5 | Learning skills |
| Patterns | 5 | Pattern recognition |
| Frameworks | 5 | Framework skills |
| Meta | 5 | Cross-cutting meta skills |

### Governance Rules
Actions are categorized by risk level:
- **Auto-approve**: Web search, file read/write, code execution, free API calls
- **Requires approval**: Paid API calls, account creation, payments, credential storage, data deletion

## Build for Production

```bash
npm run build
```

## License

MIT
