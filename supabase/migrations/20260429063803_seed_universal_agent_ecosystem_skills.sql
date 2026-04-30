/*
  # Seed Universal Agent Ecosystem Skills

  1. Purpose
    Insert 63 layer-specific skills + 5 meta skills across 12 categories
    covering the full autonomous AI ecosystem as defined in the
    Universal Agent Ecosystem specification.

  2. New Skills (68 total)
    - Agent Layer: 7 skills (AGENT-001 to AGENT-007)
    - Chat Layer: 5 skills (CHAT-001 to CHAT-005)
    - Model Layer: 5 skills (MODEL-001 to MODEL-005)
    - Plugin Layer: 5 skills (PLUGIN-001 to PLUGIN-005)
    - Brain Layer: 6 skills (BRAIN-001 to BRAIN-006)
    - Rules Layer: 5 skills (RULE-001 to RULE-005)
    - Auto-Heal Layer: 5 skills (HEAL-001 to HEAL-005)
    - Auto-Grow Layer: 5 skills (GROW-001 to GROW-005)
    - Auto-Learn Layer: 5 skills (LEARN-001 to LEARN-005)
    - Pattern Layer: 5 skills (PATTERN-001 to PATTERN-005)
    - Framework Layer: 5 skills (FRAME-001 to FRAME-005)
    - Meta Layer: 5 skills (META-001 to META-005)

  3. Notes
    - All skills are created with created_by = 'system' so they are
      read-only for regular users but can be toggled/enabled
    - Proficiency starts at 0, max 100
    - Each skill has a descriptive config JSON with the skill code
*/

-- ═══════════════════════════════════════════════════════════════════════
-- AGENT LAYER (7 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Goal Management', 'Tracks objectives, priorities, deadlines. Maintains mission continuity across sessions and tasks.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-001", "capabilities": ["objective_tracking", "priority_management", "deadline_monitoring", "mission_continuity"]}', 0, 100, true, 'system'),
('Task Decomposition', 'Breaks large requests into subtasks with dependency tracking and parallel execution planning.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-002", "capabilities": ["subtask_generation", "dependency_mapping", "parallel_planning", "progress_tracking"]}', 0, 100, true, 'system'),
('Decision Routing', 'Chooses best path/tool/model for each task based on context, cost, and capability matching.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-003", "capabilities": ["path_selection", "tool_matching", "model_routing", "cost_optimization"]}', 0, 100, true, 'system'),
('Execution Coordination', 'Orchestrates actions across systems, managing parallel and sequential execution flows.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-004", "capabilities": ["action_orchestration", "parallel_execution", "sequential_flows", "cross_system_coordination"]}', 0, 100, true, 'system'),
('Environment Awareness', 'Understands current system state, available resources, and operational context.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-005", "capabilities": ["state_monitoring", "resource_awareness", "context_understanding", "environmental_sensing"]}', 0, 100, true, 'system'),
('Scheduling', 'Handles timed and recurring workflows with cron-like precision and adaptive timing.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-006", "capabilities": ["cron_scheduling", "recurring_workflows", "adaptive_timing", "task_queue_management"]}', 0, 100, true, 'system'),
('Failure Recovery', 'Detects issues and retries intelligently with exponential backoff and fallback strategies.', 'cognitive', 'agent', 'agent', '{"code": "AGENT-007", "capabilities": ["issue_detection", "intelligent_retry", "exponential_backoff", "fallback_strategies"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- CHAT LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Context Retention', 'Maintains conversational continuity across sessions with long-term and working memory.', 'cognitive', 'chat', 'chat', '{"code": "CHAT-001", "capabilities": ["session_continuity", "long_term_memory", "working_memory", "context_windowing"]}', 0, 100, true, 'system'),
('Intent Detection', 'Understands user purpose accurately even from ambiguous or indirect requests.', 'cognitive', 'chat', 'chat', '{"code": "CHAT-002", "capabilities": ["purpose_extraction", "ambiguity_handling", "implicit_intent", "multi_intent_detection"]}', 0, 100, true, 'system'),
('Tone Adaptation', 'Adjusts communication style to match user context, expertise, and emotional state.', 'cognitive', 'chat', 'chat', '{"code": "CHAT-003", "capabilities": ["style_matching", "expertise_adaptation", "emotional_resonance", "formality_adjustment"]}', 0, 100, true, 'system'),
('Clarification Logic', 'Resolves ambiguity through targeted questions and contextual inference.', 'cognitive', 'chat', 'chat', '{"code": "CHAT-004", "capabilities": ["targeted_questioning", "contextual_inference", "ambiguity_resolution", "assumption_checking"]}', 0, 100, true, 'system'),
('Response Structuring', 'Delivers organized, actionable outputs with appropriate detail and formatting.', 'cognitive', 'chat', 'chat', '{"code": "CHAT-005", "capabilities": ["output_organization", "actionable_delivery", "detail_calibration", "format_optimization"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- MODEL LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Multi-Model Selection', 'Routes tasks to optimal models based on capability, cost, and latency requirements.', 'cognitive', 'model', 'model', '{"code": "MODEL-001", "capabilities": ["task_routing", "capability_matching", "cost_optimization", "latency_awareness"]}', 0, 100, true, 'system'),
('Capability Profiling', 'Understands model strengths and weaknesses for informed selection and fallback.', 'cognitive', 'model', 'model', '{"code": "MODEL-002", "capabilities": ["strength_analysis", "weakness_detection", "performance_profiling", "comparative_assessment"]}', 0, 100, true, 'system'),
('Ensemble Reasoning', 'Combines outputs from multiple models for higher accuracy and robustness.', 'cognitive', 'model', 'model', '{"code": "MODEL-003", "capabilities": ["output_aggregation", "confidence_weighting", "disagreement_handling", "quality_boosting"]}', 0, 100, true, 'system'),
('Dynamic Scaling', 'Adjusts compute allocation based on demand, cost constraints, and performance targets.', 'cognitive', 'model', 'model', '{"code": "MODEL-004", "capabilities": ["demand_scaling", "cost_management", "performance_targeting", "resource_optimization"]}', 0, 100, true, 'system'),
('Model Health Monitoring', 'Tracks latency, accuracy, and drift across all active models.', 'cognitive', 'model', 'model', '{"code": "MODEL-005", "capabilities": ["latency_tracking", "accuracy_monitoring", "drift_detection", "health_alerting"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- PLUGIN LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Plugin Discovery', 'Finds new external capabilities through registry scanning and recommendation engines.', 'cognitive', 'plugin', 'plugin', '{"code": "PLUGIN-001", "capabilities": ["registry_scanning", "recommendation_engine", "capability_gap_analysis", "marketplace_search"]}', 0, 100, true, 'system'),
('Plugin Validation', 'Verifies safety and compatibility before installation through testing and review.', 'cognitive', 'plugin', 'plugin', '{"code": "PLUGIN-002", "capabilities": ["safety_verification", "compatibility_checking", "automated_testing", "security_review"]}', 0, 100, true, 'system'),
('Plugin Sandboxing', 'Isolates plugin execution to prevent side effects and security breaches.', 'cognitive', 'plugin', 'plugin', '{"code": "PLUGIN-003", "capabilities": ["execution_isolation", "side_effect_prevention", "resource_limiting", "security_containment"]}', 0, 100, true, 'system'),
('Plugin Lifecycle Management', 'Manages install, update, disable, and remove operations with dependency tracking.', 'cognitive', 'plugin', 'plugin', '{"code": "PLUGIN-004", "capabilities": ["install_management", "update_handling", "disable_operations", "dependency_tracking"]}', 0, 100, true, 'system'),
('Plugin Performance Scoring', 'Measures utility over time to identify valuable vs underperforming plugins.', 'cognitive', 'plugin', 'plugin', '{"code": "PLUGIN-005", "capabilities": ["utility_measurement", "performance_tracking", "value_assessment", "deprecation_flagging"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- BRAIN LAYER (6 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Long-Term Memory', 'Stores reusable knowledge with semantic indexing and efficient retrieval.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-001", "capabilities": ["knowledge_storage", "semantic_indexing", "efficient_retrieval", "memory_consolidation"]}', 0, 100, true, 'system'),
('Working Memory', 'Maintains active task state for real-time processing and context switching.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-002", "capabilities": ["active_state", "real_time_processing", "context_switching", "scratchpad_operations"]}', 0, 100, true, 'system'),
('Reasoning Engine', 'Performs structured analysis through deductive, inductive, and abductive reasoning.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-003", "capabilities": ["deductive_reasoning", "inductive_reasoning", "abductive_reasoning", "structured_analysis"]}', 0, 100, true, 'system'),
('World Modeling', 'Builds internal environment maps for spatial and contextual understanding.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-004", "capabilities": ["environment_mapping", "spatial_understanding", "contextual_modeling", "state_representation"]}', 0, 100, true, 'system'),
('Meta-Cognition', 'Reflects on own reasoning processes to identify biases and improve accuracy.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-005", "capabilities": ["self_reflection", "bias_detection", "accuracy_improvement", "reasoning_audit"]}', 0, 100, true, 'system'),
('Knowledge Linking', 'Connects related concepts across domains for creative problem solving.', 'cognitive', 'brain', 'brain', '{"code": "BRAIN-006", "capabilities": ["concept_connection", "cross_domain_linking", "creative_synthesis", "knowledge_graph"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- RULES LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Policy Enforcement', 'Applies constraints consistently across all agent actions and decisions.', 'cognitive', 'rules', 'rules', '{"code": "RULE-001", "capabilities": ["constraint_application", "consistent_enforcement", "policy_monitoring", "violation_detection"]}', 0, 100, true, 'system'),
('Ethical Boundaries', 'Prevents harmful actions through value alignment and safety guardrails.', 'cognitive', 'rules', 'rules', '{"code": "RULE-002", "capabilities": ["harm_prevention", "value_alignment", "safety_guardrails", "ethical_reasoning"]}', 0, 100, true, 'system'),
('Permission Handling', 'Respects access levels and authorization boundaries for all operations.', 'cognitive', 'rules', 'rules', '{"code": "RULE-003", "capabilities": ["access_control", "authorization_checking", "permission_verification", "scope_limiting"]}', 0, 100, true, 'system'),
('Compliance Checking', 'Validates actions against regulations, standards, and organizational policies.', 'cognitive', 'rules', 'rules', '{"code": "RULE-004", "capabilities": ["regulation_validation", "standard_compliance", "policy_checking", "audit_readiness"]}', 0, 100, true, 'system'),
('Conflict Resolution', 'Resolves rule collisions through priority ordering and contextual arbitration.', 'cognitive', 'rules', 'rules', '{"code": "RULE-005", "capabilities": ["priority_ordering", "contextual_arbitration", "rule_merging", "contradiction_handling"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- AUTO-HEAL LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Health Diagnostics', 'Detects degraded components through continuous monitoring and health checks.', 'cognitive', 'auto-heal', 'auto-heal', '{"code": "HEAL-001", "capabilities": ["degradation_detection", "continuous_monitoring", "health_checks", "anomaly_flagging"]}', 0, 100, true, 'system'),
('Root Cause Analysis', 'Finds failure origins through trace analysis and causal chain investigation.', 'cognitive', 'auto-heal', 'auto-heal', '{"code": "HEAL-002", "capabilities": ["trace_analysis", "causal_investigation", "failure_origin_finding", "diagnostic_reasoning"]}', 0, 100, true, 'system'),
('Automated Repair', 'Applies corrective fixes through known remediation strategies and rollback procedures.', 'cognitive', 'auto-heal', 'auto-heal', '{"code": "HEAL-003", "capabilities": ["corrective_fixes", "remediation_strategies", "rollback_procedures", "self_repair"]}', 0, 100, true, 'system'),
('Redundancy Switching', 'Activates backups automatically when primary systems fail or degrade.', 'cognitive', 'auto-heal', 'auto-heal', '{"code": "HEAL-004", "capabilities": ["backup_activation", "failover_handling", "automatic_switching", "redundancy_management"]}', 0, 100, true, 'system'),
('Integrity Verification', 'Confirms repair success through validation checks and post-fix monitoring.', 'cognitive', 'auto-heal', 'auto-heal', '{"code": "HEAL-005", "capabilities": ["repair_validation", "post_fix_monitoring", "integrity_checks", "success_confirmation"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- AUTO-GROW LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Capability Expansion', 'Adds new modules and features through autonomous discovery and integration.', 'cognitive', 'auto-grow', 'auto-grow', '{"code": "GROW-001", "capabilities": ["module_addition", "feature_discovery", "autonomous_integration", "capability_extension"]}', 0, 100, true, 'system'),
('Resource Scaling', 'Increases infrastructure as needed based on demand patterns and growth projections.', 'cognitive', 'auto-grow', 'auto-grow', '{"code": "GROW-002", "capabilities": ["infrastructure_scaling", "demand_analysis", "growth_projection", "resource_provisioning"]}', 0, 100, true, 'system'),
('Architecture Refactoring', 'Evolves internal design to accommodate growth and changing requirements.', 'cognitive', 'auto-grow', 'auto-grow', '{"code": "GROW-003", "capabilities": ["design_evolution", "architecture_adaptation", "requirement_alignment", "structural_optimization"]}', 0, 100, true, 'system'),
('Opportunity Detection', 'Identifies useful upgrades and improvements through environmental scanning.', 'cognitive', 'auto-grow', 'auto-grow', '{"code": "GROW-004", "capabilities": ["upgrade_identification", "environmental_scanning", "improvement_detection", "opportunity_assessment"]}', 0, 100, true, 'system'),
('Ecosystem Integration', 'Connects new services and tools into the existing agent ecosystem seamlessly.', 'cognitive', 'auto-grow', 'auto-grow', '{"code": "GROW-005", "capabilities": ["service_connection", "tool_integration", "ecosystem_expansion", "seamless_onboarding"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- AUTO-LEARN LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Feedback Absorption', 'Uses outcomes for improvement through positive and negative reinforcement learning.', 'cognitive', 'auto-learn', 'auto-learn', '{"code": "LEARN-001", "capabilities": ["outcome_learning", "reinforcement_absorption", "positive_reinforcement", "negative_reinforcement"]}', 0, 100, true, 'system'),
('Pattern Extraction', 'Finds recurring structures in data, behavior, and outcomes for knowledge building.', 'cognitive', 'auto-learn', 'auto-learn', '{"code": "LEARN-002", "capabilities": ["structure_discovery", "recurrence_detection", "knowledge_building", "data_mining"]}', 0, 100, true, 'system'),
('Knowledge Consolidation', 'Converts experience into reusable rules and heuristics for future application.', 'cognitive', 'auto-learn', 'auto-learn', '{"code": "LEARN-003", "capabilities": ["experience_conversion", "rule_generation", "heuristic_creation", "knowledge_crystallization"]}', 0, 100, true, 'system'),
('Skill Adaptation', 'Updates behavior dynamically based on changing conditions and new information.', 'cognitive', 'auto-learn', 'auto-learn', '{"code": "LEARN-004", "capabilities": ["behavior_updating", "dynamic_adaptation", "condition_responsiveness", "information_integration"]}', 0, 100, true, 'system'),
('Curriculum Building', 'Plans what to learn next based on capability gaps and strategic priorities.', 'cognitive', 'auto-learn', 'auto-learn', '{"code": "LEARN-005", "capabilities": ["learning_planning", "gap_analysis", "priority_alignment", "curriculum_design"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Behavioral Pattern Recognition', 'Detects habits and routines in user behavior and system operations.', 'cognitive', 'patterns', 'patterns', '{"code": "PATTERN-001", "capabilities": ["habit_detection", "routine_identification", "behavioral_analysis", "trend_recognition"]}', 0, 100, true, 'system'),
('Predictive Modeling', 'Forecasts likely outcomes based on historical patterns and current signals.', 'cognitive', 'patterns', 'patterns', '{"code": "PATTERN-002", "capabilities": ["outcome_forecasting", "historical_analysis", "signal_processing", "probability_estimation"]}', 0, 100, true, 'system'),
('Anomaly Detection', 'Flags unusual deviations from expected patterns for investigation and response.', 'cognitive', 'patterns', 'patterns', '{"code": "PATTERN-003", "capabilities": ["deviation_flagging", "unusual_detection", "investigation_triggering", "response_initiation"]}', 0, 100, true, 'system'),
('Optimization Patterns', 'Reuses high-performing strategies identified through success analysis.', 'cognitive', 'patterns', 'patterns', '{"code": "PATTERN-004", "capabilities": ["strategy_reuse", "success_analysis", "performance_optimization", "best_practice_extraction"]}', 0, 100, true, 'system'),
('Cross-Domain Transfer', 'Applies patterns discovered in one domain to solve problems in new contexts.', 'cognitive', 'patterns', 'patterns', '{"code": "PATTERN-005", "capabilities": ["domain_transfer", "analogical_application", "context_adaptation", "cross_pollination"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- FRAMEWORK LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Modular Composition', 'Supports interchangeable components through well-defined interfaces and contracts.', 'cognitive', 'frameworks', 'frameworks', '{"code": "FRAME-001", "capabilities": ["component_interchange", "interface_definition", "contract_enforcement", "modular_design"]}', 0, 100, true, 'system'),
('Dependency Management', 'Tracks relationships between modules to prevent conflicts and ensure compatibility.', 'cognitive', 'frameworks', 'frameworks', '{"code": "FRAME-002", "capabilities": ["relationship_tracking", "conflict_prevention", "compatibility_ensuring", "dependency_resolution"]}', 0, 100, true, 'system'),
('Version Control Awareness', 'Handles updates safely through versioning, rollback, and compatibility checks.', 'cognitive', 'frameworks', 'frameworks', '{"code": "FRAME-003", "capabilities": ["safe_updates", "versioning_support", "rollback_capability", "compatibility_checking"]}', 0, 100, true, 'system'),
('Runtime Adaptation', 'Adjusts system behavior live without requiring restarts or redeployment.', 'cognitive', 'frameworks', 'frameworks', '{"code": "FRAME-004", "capabilities": ["live_adjustment", "hot_reloading", "dynamic_reconfiguration", "zero_downtime"]}', 0, 100, true, 'system'),
('Framework Governance', 'Maintains architecture standards through automated review and enforcement.', 'cognitive', 'frameworks', 'frameworks', '{"code": "FRAME-005", "capabilities": ["standard_maintenance", "automated_review", "architecture_enforcement", "governance_automation"]}', 0, 100, true, 'system');

-- ═══════════════════════════════════════════════════════════════════════
-- META LAYER (5 skills)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO skills (name, description, skill_type, category, layer, config, proficiency, max_proficiency, enabled, created_by) VALUES
('Self-Assessment', 'Measures capability gaps and performance metrics for continuous improvement.', 'cognitive', 'meta', 'meta', '{"code": "META-001", "capabilities": ["gap_measurement", "performance_metrics", "capability_auditing", "improvement_identification"]}', 0, 100, true, 'system'),
('Strategic Planning', 'Aligns long-term growth with organizational goals and resource constraints.', 'cognitive', 'meta', 'meta', '{"code": "META-002", "capabilities": ["growth_alignment", "goal_planning", "resource_constraint_handling", "strategic_forecasting"]}', 0, 100, true, 'system'),
('Resilience Engineering', 'Ensures stability under stress through redundancy, graceful degradation, and recovery.', 'cognitive', 'meta', 'meta', '{"code": "META-003", "capabilities": ["stress_stability", "redundancy_design", "graceful_degradation", "recovery_engineering"]}', 0, 100, true, 'system'),
('Autonomy Calibration', 'Balances independence vs oversight through configurable autonomy levels.', 'cognitive', 'meta', 'meta', '{"code": "META-004", "capabilities": ["independence_balancing", "oversight_management", "autonomy_levels", "calibration_controls"]}', 0, 100, true, 'system'),
('Continuous Evolution', 'Maintains relevance over time through self-directed improvement and adaptation.', 'cognitive', 'meta', 'meta', '{"code": "META-005", "capabilities": ["relevance_maintenance", "self_improvement", "adaptive_evolution", "continuous_adaptation"]}', 0, 100, true, 'system');
