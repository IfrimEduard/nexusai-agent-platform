/*
  # Fix RLS Policies - Remove USING(true) / WITH CHECK(true) Bypasses

  1. Problem
    Many tables have RLS policies with USING(true) or WITH CHECK(true) which
    effectively bypass row-level security. Any authenticated user can perform
    any operation on any row.

  2. Solution
    - Add created_by column to tables that lack it (stores auth.uid() as text)
    - Drop all permissive policies
    - Recreate with proper ownership checks using auth.uid()
    - SELECT: users can read their own rows + system/agent rows
    - INSERT: users can insert rows owned by themselves
    - UPDATE: users can update their own rows only
    - DELETE: users can delete their own rows only
    - Shared tables (limitations, governance, spending, system_config): 
      read-all for authenticated, write-own only

  3. Security changes
    - All policies now check auth.uid() against created_by column
    - System-seeded data (created_by = 'system') is read-only for regular users
    - Agent-created data (created_by = 'agent') is readable but not modifiable by users
*/

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 1: Add created_by column to tables that lack it
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.action_log ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.agent_audit_trail ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.agent_limitations ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'system';
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.api_registry ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.auto_grow_rules ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.auto_heal_rules ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.auto_learn_sessions ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.brain_config ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.evolution_log ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.execution_log ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.frameworks ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.governance_rules ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'system';
ALTER TABLE public.learning_events ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'agent';
ALTER TABLE public.model_capabilities ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.model_files ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.model_runtime_config ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.plugins ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.screen_frames ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.screen_sessions ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.secrets_vault ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'user';
ALTER TABLE public.spending_limits ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'system';
ALTER TABLE public.system_config ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'system';

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 2: Drop ALL existing permissive policies
-- ═══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can delete action_log" ON action_log;
DROP POLICY IF EXISTS "Authenticated users can insert action_log" ON action_log;
DROP POLICY IF EXISTS "Authenticated users can read action_log" ON action_log;

DROP POLICY IF EXISTS "Authenticated users can delete agent_audit_trail" ON agent_audit_trail;
DROP POLICY IF EXISTS "Authenticated users can insert agent_audit_trail" ON agent_audit_trail;
DROP POLICY IF EXISTS "Authenticated users can read agent_audit_trail" ON agent_audit_trail;

DROP POLICY IF EXISTS "Authenticated users can delete agent_limitations" ON agent_limitations;
DROP POLICY IF EXISTS "Authenticated users can insert agent_limitations" ON agent_limitations;
DROP POLICY IF EXISTS "Authenticated users can update agent_limitations" ON agent_limitations;
DROP POLICY IF EXISTS "Authenticated users can read agent_limitations" ON agent_limitations;

DROP POLICY IF EXISTS "Authenticated users can delete ai_models" ON ai_models;
DROP POLICY IF EXISTS "Authenticated users can insert ai_models" ON ai_models;
DROP POLICY IF EXISTS "Authenticated users can update ai_models" ON ai_models;
DROP POLICY IF EXISTS "Authenticated users can read ai_models" ON ai_models;

DROP POLICY IF EXISTS "Authenticated users can delete api_registry" ON api_registry;
DROP POLICY IF EXISTS "Authenticated users can insert api_registry" ON api_registry;
DROP POLICY IF EXISTS "Authenticated users can update api_registry" ON api_registry;
DROP POLICY IF EXISTS "Authenticated users can read api_registry" ON api_registry;

DROP POLICY IF EXISTS "Authenticated users can delete approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Authenticated users can insert approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Authenticated users can update approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Authenticated users can read approval_requests" ON approval_requests;

DROP POLICY IF EXISTS "Authenticated users can delete auto_grow_rules" ON auto_grow_rules;
DROP POLICY IF EXISTS "Authenticated users can insert auto_grow_rules" ON auto_grow_rules;
DROP POLICY IF EXISTS "Authenticated users can update auto_grow_rules" ON auto_grow_rules;
DROP POLICY IF EXISTS "Authenticated users can read auto_grow_rules" ON auto_grow_rules;

DROP POLICY IF EXISTS "Authenticated users can delete auto_heal_rules" ON auto_heal_rules;
DROP POLICY IF EXISTS "Authenticated users can insert auto_heal_rules" ON auto_heal_rules;
DROP POLICY IF EXISTS "Authenticated users can update auto_heal_rules" ON auto_heal_rules;
DROP POLICY IF EXISTS "Authenticated users can read auto_heal_rules" ON auto_heal_rules;

DROP POLICY IF EXISTS "Authenticated users can delete auto_learn_sessions" ON auto_learn_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert auto_learn_sessions" ON auto_learn_sessions;
DROP POLICY IF EXISTS "Authenticated users can update auto_learn_sessions" ON auto_learn_sessions;
DROP POLICY IF EXISTS "Authenticated users can read auto_learn_sessions" ON auto_learn_sessions;

DROP POLICY IF EXISTS "Authenticated users can delete automations" ON automations;
DROP POLICY IF EXISTS "Authenticated users can insert automations" ON automations;
DROP POLICY IF EXISTS "Authenticated users can update automations" ON automations;
DROP POLICY IF EXISTS "Authenticated users can read automations" ON automations;

DROP POLICY IF EXISTS "Authenticated users can delete brain_config" ON brain_config;
DROP POLICY IF EXISTS "Authenticated users can insert brain_config" ON brain_config;
DROP POLICY IF EXISTS "Authenticated users can update brain_config" ON brain_config;
DROP POLICY IF EXISTS "Authenticated users can read brain_config" ON brain_config;

DROP POLICY IF EXISTS "Authenticated users can delete chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can read chat_messages" ON chat_messages;

DROP POLICY IF EXISTS "Authenticated users can delete evolution_log" ON evolution_log;
DROP POLICY IF EXISTS "Authenticated users can insert evolution_log" ON evolution_log;
DROP POLICY IF EXISTS "Authenticated users can read evolution_log" ON evolution_log;

DROP POLICY IF EXISTS "Authenticated users can delete execution_log" ON execution_log;
DROP POLICY IF EXISTS "Authenticated users can insert execution_log" ON execution_log;
DROP POLICY IF EXISTS "Authenticated users can read execution_log" ON execution_log;

DROP POLICY IF EXISTS "Authenticated users can delete frameworks" ON frameworks;
DROP POLICY IF EXISTS "Authenticated users can insert frameworks" ON frameworks;
DROP POLICY IF EXISTS "Authenticated users can update frameworks" ON frameworks;
DROP POLICY IF EXISTS "Authenticated users can read frameworks" ON frameworks;

DROP POLICY IF EXISTS "Authenticated users can delete governance_rules" ON governance_rules;
DROP POLICY IF EXISTS "Authenticated users can insert governance_rules" ON governance_rules;
DROP POLICY IF EXISTS "Authenticated users can update governance_rules" ON governance_rules;
DROP POLICY IF EXISTS "Authenticated users can read governance_rules" ON governance_rules;

DROP POLICY IF EXISTS "Authenticated users can delete learning_events" ON learning_events;
DROP POLICY IF EXISTS "Authenticated users can insert learning_events" ON learning_events;
DROP POLICY IF EXISTS "Authenticated users can update learning_events" ON learning_events;
DROP POLICY IF EXISTS "Authenticated users can read learning_events" ON learning_events;

DROP POLICY IF EXISTS "Authenticated users can delete model_capabilities" ON model_capabilities;
DROP POLICY IF EXISTS "Authenticated users can insert model_capabilities" ON model_capabilities;
DROP POLICY IF EXISTS "Authenticated users can update model_capabilities" ON model_capabilities;
DROP POLICY IF EXISTS "Authenticated users can read model_capabilities" ON model_capabilities;

DROP POLICY IF EXISTS "Authenticated users can delete model_files" ON model_files;
DROP POLICY IF EXISTS "Authenticated users can insert model_files" ON model_files;
DROP POLICY IF EXISTS "Authenticated users can update model_files" ON model_files;
DROP POLICY IF EXISTS "Authenticated users can read model_files" ON model_files;

DROP POLICY IF EXISTS "Authenticated users can delete model_runtime_config" ON model_runtime_config;
DROP POLICY IF EXISTS "Authenticated users can insert model_runtime_config" ON model_runtime_config;
DROP POLICY IF EXISTS "Authenticated users can update model_runtime_config" ON model_runtime_config;
DROP POLICY IF EXISTS "Authenticated users can read model_runtime_config" ON model_runtime_config;

DROP POLICY IF EXISTS "Authenticated users can delete patterns" ON patterns;
DROP POLICY IF EXISTS "Authenticated users can insert patterns" ON patterns;
DROP POLICY IF EXISTS "Authenticated users can update patterns" ON patterns;
DROP POLICY IF EXISTS "Authenticated users can read patterns" ON patterns;

DROP POLICY IF EXISTS "Authenticated users can delete plugins" ON plugins;
DROP POLICY IF EXISTS "Authenticated users can insert plugins" ON plugins;
DROP POLICY IF EXISTS "Authenticated users can update plugins" ON plugins;
DROP POLICY IF EXISTS "Authenticated users can read plugins" ON plugins;

DROP POLICY IF EXISTS "Authenticated users can delete screen_frames" ON screen_frames;
DROP POLICY IF EXISTS "Authenticated users can insert screen_frames" ON screen_frames;
DROP POLICY IF EXISTS "Authenticated users can update screen_frames" ON screen_frames;
DROP POLICY IF EXISTS "Authenticated users can read screen_frames" ON screen_frames;

DROP POLICY IF EXISTS "Authenticated users can delete screen_sessions" ON screen_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert screen_sessions" ON screen_sessions;
DROP POLICY IF EXISTS "Authenticated users can update screen_sessions" ON screen_sessions;
DROP POLICY IF EXISTS "Authenticated users can read screen_sessions" ON screen_sessions;

DROP POLICY IF EXISTS "Authenticated users can delete secrets_vault" ON secrets_vault;
DROP POLICY IF EXISTS "Authenticated users can insert secrets_vault" ON secrets_vault;
DROP POLICY IF EXISTS "Authenticated users can update secrets_vault" ON secrets_vault;
DROP POLICY IF EXISTS "Authenticated users can read secrets_vault" ON secrets_vault;

DROP POLICY IF EXISTS "Authenticated users can delete skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can update skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can read skills" ON skills;

DROP POLICY IF EXISTS "Authenticated users can delete spending_limits" ON spending_limits;
DROP POLICY IF EXISTS "Authenticated users can insert spending_limits" ON spending_limits;
DROP POLICY IF EXISTS "Authenticated users can update spending_limits" ON spending_limits;
DROP POLICY IF EXISTS "Authenticated users can read spending_limits" ON spending_limits;

DROP POLICY IF EXISTS "Authenticated users can delete system_config" ON system_config;
DROP POLICY IF EXISTS "Authenticated users can insert system_config" ON system_config;
DROP POLICY IF EXISTS "Authenticated users can update system_config" ON system_config;
DROP POLICY IF EXISTS "Authenticated users can read system_config" ON system_config;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 3: Recreate policies with proper ownership checks
-- ═══════════════════════════════════════════════════════════════════════

-- action_log (agent writes, user reads own + agent)
CREATE POLICY "Users can read own action_log" ON action_log FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system' OR created_by = 'agent');
CREATE POLICY "Users can insert own action_log" ON action_log FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can delete own action_log" ON action_log FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- agent_audit_trail (agent writes, user reads own + agent)
CREATE POLICY "Users can read own audit_trail" ON agent_audit_trail FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system' OR created_by = 'agent');
CREATE POLICY "Users can insert own audit_trail" ON agent_audit_trail FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can delete own audit_trail" ON agent_audit_trail FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- agent_limitations (system seeds, users read all, modify own only)
CREATE POLICY "Users can read limitations" ON agent_limitations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own limitations" ON agent_limitations FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own limitations" ON agent_limitations FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own limitations" ON agent_limitations FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- ai_models (user-owned)
CREATE POLICY "Users can read own models" ON ai_models FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own models" ON ai_models FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own models" ON ai_models FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own models" ON ai_models FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- api_registry (shared read, own write)
CREATE POLICY "Users can read api_registry" ON api_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own api_registry" ON api_registry FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own api_registry" ON api_registry FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own api_registry" ON api_registry FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- approval_requests (shared read, user can approve/reject own)
CREATE POLICY "Users can read approval_requests" ON approval_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own approval_requests" ON approval_requests FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can update own approval_requests" ON approval_requests FOR UPDATE TO authenticated USING (auth.uid()::text = created_by OR created_by = 'user') WITH CHECK (auth.uid()::text = created_by OR created_by = 'user');
CREATE POLICY "Users can delete own approval_requests" ON approval_requests FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- auto_grow_rules (user-owned, system readable)
CREATE POLICY "Users can read own grow_rules" ON auto_grow_rules FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own grow_rules" ON auto_grow_rules FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own grow_rules" ON auto_grow_rules FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own grow_rules" ON auto_grow_rules FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- auto_heal_rules (user-owned, system readable)
CREATE POLICY "Users can read own heal_rules" ON auto_heal_rules FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own heal_rules" ON auto_heal_rules FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own heal_rules" ON auto_heal_rules FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own heal_rules" ON auto_heal_rules FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- auto_learn_sessions (user-owned)
CREATE POLICY "Users can read own learn_sessions" ON auto_learn_sessions FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own learn_sessions" ON auto_learn_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own learn_sessions" ON auto_learn_sessions FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own learn_sessions" ON auto_learn_sessions FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- automations (user-owned)
CREATE POLICY "Users can read own automations" ON automations FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own automations" ON automations FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own automations" ON automations FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own automations" ON automations FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- brain_config (user-owned)
CREATE POLICY "Users can read own brain_config" ON brain_config FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own brain_config" ON brain_config FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own brain_config" ON brain_config FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own brain_config" ON brain_config FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- chat_messages (strictly user-owned - private conversations)
CREATE POLICY "Users can read own chat_messages" ON chat_messages FOR SELECT TO authenticated USING (auth.uid()::text = created_by);
CREATE POLICY "Users can insert own chat_messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own chat_messages" ON chat_messages FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own chat_messages" ON chat_messages FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- evolution_log (agent writes, user reads own + agent)
CREATE POLICY "Users can read own evolution_log" ON evolution_log FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system' OR created_by = 'agent');
CREATE POLICY "Users can insert own evolution_log" ON evolution_log FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can delete own evolution_log" ON evolution_log FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- execution_log (agent writes, user reads own + agent)
CREATE POLICY "Users can read own execution_log" ON execution_log FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system' OR created_by = 'agent');
CREATE POLICY "Users can insert own execution_log" ON execution_log FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can delete own execution_log" ON execution_log FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- frameworks (user-owned)
CREATE POLICY "Users can read own frameworks" ON frameworks FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own frameworks" ON frameworks FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own frameworks" ON frameworks FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own frameworks" ON frameworks FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- governance_rules (shared read, own write)
CREATE POLICY "Users can read governance_rules" ON governance_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own governance_rules" ON governance_rules FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own governance_rules" ON governance_rules FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own governance_rules" ON governance_rules FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- learning_events (agent writes, user reads own + agent)
CREATE POLICY "Users can read own learning_events" ON learning_events FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system' OR created_by = 'agent');
CREATE POLICY "Users can insert own learning_events" ON learning_events FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by OR created_by = 'agent');
CREATE POLICY "Users can update own learning_events" ON learning_events FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own learning_events" ON learning_events FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- model_capabilities (user-owned)
CREATE POLICY "Users can read own model_capabilities" ON model_capabilities FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own model_capabilities" ON model_capabilities FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own model_capabilities" ON model_capabilities FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own model_capabilities" ON model_capabilities FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- model_files (user-owned)
CREATE POLICY "Users can read own model_files" ON model_files FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own model_files" ON model_files FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own model_files" ON model_files FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own model_files" ON model_files FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- model_runtime_config (user-owned)
CREATE POLICY "Users can read own model_runtime_config" ON model_runtime_config FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own model_runtime_config" ON model_runtime_config FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own model_runtime_config" ON model_runtime_config FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own model_runtime_config" ON model_runtime_config FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- patterns (user-owned)
CREATE POLICY "Users can read own patterns" ON patterns FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own patterns" ON patterns FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own patterns" ON patterns FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own patterns" ON patterns FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- plugins (user-owned)
CREATE POLICY "Users can read own plugins" ON plugins FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own plugins" ON plugins FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own plugins" ON plugins FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own plugins" ON plugins FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- screen_frames (strictly user-owned - private screen data)
CREATE POLICY "Users can read own screen_frames" ON screen_frames FOR SELECT TO authenticated USING (auth.uid()::text = created_by);
CREATE POLICY "Users can insert own screen_frames" ON screen_frames FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own screen_frames" ON screen_frames FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own screen_frames" ON screen_frames FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- screen_sessions (strictly user-owned)
CREATE POLICY "Users can read own screen_sessions" ON screen_sessions FOR SELECT TO authenticated USING (auth.uid()::text = created_by);
CREATE POLICY "Users can insert own screen_sessions" ON screen_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own screen_sessions" ON screen_sessions FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own screen_sessions" ON screen_sessions FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- secrets_vault (strictly user-owned - sensitive credentials)
CREATE POLICY "Users can read own secrets_vault" ON secrets_vault FOR SELECT TO authenticated USING (auth.uid()::text = created_by);
CREATE POLICY "Users can insert own secrets_vault" ON secrets_vault FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own secrets_vault" ON secrets_vault FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own secrets_vault" ON secrets_vault FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- skills (user-owned + system readable)
CREATE POLICY "Users can read own skills" ON skills FOR SELECT TO authenticated USING (auth.uid()::text = created_by OR created_by = 'system');
CREATE POLICY "Users can insert own skills" ON skills FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own skills" ON skills FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own skills" ON skills FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- spending_limits (shared read, own write)
CREATE POLICY "Users can read spending_limits" ON spending_limits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own spending_limits" ON spending_limits FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own spending_limits" ON spending_limits FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own spending_limits" ON spending_limits FOR DELETE TO authenticated USING (auth.uid()::text = created_by);

-- system_config (shared read, own write)
CREATE POLICY "Users can read system_config" ON system_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own system_config" ON system_config FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can update own system_config" ON system_config FOR UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Users can delete own system_config" ON system_config FOR DELETE TO authenticated USING (auth.uid()::text = created_by);
