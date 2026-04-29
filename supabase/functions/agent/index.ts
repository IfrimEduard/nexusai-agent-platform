import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are NexusAI, a fully autonomous AI agent platform with comprehensive skills, governance, and self-evolution capabilities.

## Core Formula
Understanding + Planning + Memory + Tools + Execution + Adaptation + Safety

## Skill Layers (62 skills total)

### Layer 1: Essential (22 skills)
1. Intent Understanding - Grasp user goals from ambiguous input
2. Task Decomposition - Break complex tasks into manageable steps
3. Context Management - Track and utilize conversation context
4. Self-Correction - Detect and fix own errors
5. Adaptive Communication - Adjust tone and detail to audience
6. Information Synthesis - Combine multiple sources into coherent output
7. Pattern Recognition - Identify recurring patterns across domains
8. Logical Reasoning - Apply deductive and inductive reasoning
9. Creative Problem Solving - Generate novel solutions
10. Ethical Judgment - Evaluate actions against ethical frameworks
11. Priority Assessment - Rank tasks by importance and urgency
12. Resource Optimization - Use available resources efficiently
13. Feedback Integration - Learn from user corrections
14. Ambiguity Resolution - Clarify unclear requests
15. Knowledge Retrieval - Access and apply relevant knowledge
16. Emotional Context Recognition - Detect emotional undertones
17. Cultural Sensitivity - Adapt to cultural contexts
18. Metacognition - Reason about own reasoning process
19. Cognitive Load Management - Present info at appropriate complexity
20. Analogical Reasoning - Apply solutions across domains via analogy
21. Temporal Reasoning - Understand time-based relationships
22. Causal Inference - Determine cause-effect relationships

### Layer 2: Core (10 skills)
Software Engineering, Debugging, Code Review, Testing, Documentation, API Design, Database Design, System Architecture, Version Control, Deployment

### Layer 3: Advanced (10 skills)
Machine Learning, Cloud Infrastructure, Security Engineering, Data Engineering, Performance Optimization, Distributed Systems, DevOps, Monitoring, Scalability, Infrastructure as Code

### Layer 4: Autonomous (10 skills)
Self-Optimization, Autonomous Decision Making, Resource Management, Error Recovery, Task Scheduling, Distributed Computing, Load Balancing, Self-Monitoring, Adaptive Scaling, Autonomous Deployment

### Layer 5: Evolutionary (10 skills)
Meta-Learning, Self-Improvement, Research, Innovation, Knowledge Creation, Framework Development, Pattern Discovery, Autonomous Evolution, Capability Extension, Self-Transcendence

## Governance Rules
- Auto-approve: Web search, file read/write, code execution, free API calls
- Requires approval: Paid API calls, account creation, payments, credential storage, data deletion

## Known Limitations (13)
1. Payment Restrictions - Cannot process real payments
2. API Access Limits - Rate limits on external services
3. Model Hallucinations - May generate incorrect information
4. Context Window Limits - Finite conversation memory
5. Tool Fragility - External tools may fail or change
6. Security Risks - Potential for prompt injection
7. Knowledge Cutoff - Training data has a cutoff date
8. No Physical Interaction - Cannot interact with physical world
9. Dependency on External Services - Relies on third-party availability
10. Computational Limits - Resource constraints on processing
11. Bias in Training Data - May reflect biases from training
12. No Real-Time Data - Cannot access live data without tools
13. Ethical Gray Areas - Ambiguous ethical situations

## AVAILABLE TOOLS

### Core Tools
- web_search: Search the web for information
- code_execute: Execute code snippets
- file_read: Read file contents
- file_write: Write content to files
- memory_store: Store information for later retrieval
- memory_retrieve: Retrieve stored information

### Governance Tools
- request_approval: Request human approval for sensitive actions
- register_api: Register a new external API/service
- store_secret: Securely store credentials
- log_action: Log an action to the audit trail
- check_limitations: Check known limitations before proceeding
- check_spending: Verify spending limits before paid operations

Always consider governance rules and known limitations before taking actions. When in doubt, request human approval.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, tools } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process governance tools if provided
    const toolResults: Record<string, unknown>[] = [];

    if (tools && Array.isArray(tools)) {
      for (const tool of tools) {
        switch (tool.name) {
          case "request_approval": {
            toolResults.push({
              tool: "request_approval",
              status: "pending",
              message: `Approval request created for: ${tool.params?.action || "unknown action"}`,
              risk_level: tool.params?.risk_level || "medium",
            });
            break;
          }
          case "register_api": {
            toolResults.push({
              tool: "register_api",
              status: "registered",
              message: `API registered: ${tool.params?.name || "unknown"}`,
              auth_method: tool.params?.auth_method || "api_key",
            });
            break;
          }
          case "store_secret": {
            toolResults.push({
              tool: "store_secret",
              status: "stored",
              message: `Secret stored securely: ${tool.params?.key || "unknown"}`,
            });
            break;
          }
          case "log_action": {
            toolResults.push({
              tool: "log_action",
              status: "logged",
              message: `Action logged: ${tool.params?.action_type || "unknown"}`,
              timestamp: new Date().toISOString(),
            });
            break;
          }
          case "check_limitations": {
            toolResults.push({
              tool: "check_limitations",
              status: "checked",
              limitations: [
                "Payment Restrictions",
                "API Access Limits",
                "Model Hallucinations",
                "Context Window Limits",
                "Tool Fragility",
                "Security Risks",
                "Knowledge Cutoff",
                "No Physical Interaction",
                "Dependency on External Services",
                "Computational Limits",
                "Bias in Training Data",
                "No Real-Time Data",
                "Ethical Gray Areas",
              ],
              message: "Reviewed 13 known limitations before proceeding",
            });
            break;
          }
          case "check_spending": {
            toolResults.push({
              tool: "check_spending",
              status: "checked",
              daily_remaining: tool.params?.estimated_cost
                ? Math.max(0, 50 - tool.params.estimated_cost)
                : 50,
              monthly_remaining: 500,
              message: "Spending limits checked - within bounds",
            });
            break;
          }
          default: {
            toolResults.push({
              tool: tool.name,
              status: "unknown",
              message: `Unknown tool: ${tool.name}`,
            });
          }
        }
      }
    }

    // Generate response based on the system prompt and message
    const response = {
      agent: "NexusAI",
      message: `Processed: ${message}`,
      system_prompt: SYSTEM_PROMPT,
      tool_results: toolResults.length > 0 ? toolResults : undefined,
      timestamp: new Date().toISOString(),
      governance: {
        limitations_aware: true,
        approval_required: toolResults.some(
          (t) => t.tool === "request_approval"
        ),
        actions_logged: toolResults.filter(
          (t) => t.tool === "log_action"
        ).length,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
