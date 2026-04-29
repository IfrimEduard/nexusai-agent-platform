import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tool, params } = await req.json();

    if (!tool) {
      return new Response(
        JSON.stringify({ error: "Tool name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: Record<string, unknown>;

    switch (tool) {
      case "web_search": {
        result = {
          tool: "web_search",
          status: "completed",
          query: params?.query || "",
          results: [],
          message: "Web search executed",
        };
        break;
      }
      case "code_execute": {
        result = {
          tool: "code_execute",
          status: "completed",
          language: params?.language || "javascript",
          output: "",
          message: "Code execution completed",
        };
        break;
      }
      case "file_read": {
        result = {
          tool: "file_read",
          status: "completed",
          path: params?.path || "",
          content: "",
          message: "File read completed",
        };
        break;
      }
      case "file_write": {
        result = {
          tool: "file_write",
          status: "completed",
          path: params?.path || "",
          message: "File written successfully",
        };
        break;
      }
      case "memory_store": {
        result = {
          tool: "memory_store",
          status: "completed",
          key: params?.key || "",
          message: "Information stored for later retrieval",
        };
        break;
      }
      case "memory_retrieve": {
        result = {
          tool: "memory_retrieve",
          status: "completed",
          key: params?.key || "",
          value: null,
          message: "Memory retrieval completed",
        };
        break;
      }
      default: {
        result = {
          tool,
          status: "unknown",
          message: `Unknown tool: ${tool}`,
        };
      }
    }

    return new Response(JSON.stringify(result), {
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
