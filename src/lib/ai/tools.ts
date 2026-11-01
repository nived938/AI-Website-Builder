import { z } from "zod";

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
  schema: z.ZodSchema;
}

// 1. Zod schemas for all approved tools
export const toolSchemas = {
  list_project_files: z.object({
    directory: z.string().optional().default(""),
  }),
  read_project_file: z.object({
    path: z.string().min(1, "File path is required"),
  }),
  create_project_file: z.object({
    path: z.string().min(1, "File path is required"),
    content: z.string(),
  }),
  edit_project_file: z.object({
    path: z.string().min(1, "File path is required"),
    content: z.string(),
    description: z.string().optional(),
  }),
  delete_project_file: z.object({
    path: z.string().min(1, "File path is required"),
  }),
  search_project_files: z.object({
    query: z.string().min(1, "Search query is required"),
  }),
  get_project_structure: z.object({}),
  search_web: z.object({
    query: z.string().min(1, "Search query is required"),
  }),
  fetch_web_page: z.object({
    url: z.string().url("Must be a valid URL"),
  }),
  extract_reference_content: z.object({
    assetId: z.string().min(1, "Asset ID is required"),
  }),
  analyze_uploaded_file: z.object({
    assetId: z.string().min(1, "Asset ID is required"),
  }),
  get_project_memory: z.object({}),
  update_project_memory: z.object({
    summary: z.string().optional(),
    newDecisions: z.array(z.string()).optional(),
    pendingTasks: z.array(z.string()).optional(),
  }),
  create_checkpoint: z.object({
    name: z.string().min(1, "Checkpoint name is required"),
    description: z.string().optional(),
  }),
  run_project_validation: z.object({}),
  get_build_errors: z.object({}),
  generate_code_patch: z.object({
    path: z.string(),
    patchContent: z.string(),
  }),
};

// 2. Ollama tool declarations
export const toolRegistry: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "list_project_files",
      description: "List all files and directory structure in the current website project.",
      parameters: {
        type: "object",
        properties: {
          directory: { type: "string", description: "Subdirectory to list, or empty for root" },
        },
      },
    },
    schema: toolSchemas.list_project_files,
  },
  {
    type: "function",
    function: {
      name: "read_project_file",
      description: "Read the full text content of a specific file in the project.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to the file (e.g. 'index.html', 'styles.css')" },
        },
        required: ["path"],
      },
    },
    schema: toolSchemas.read_project_file,
  },
  {
    type: "function",
    function: {
      name: "create_project_file",
      description: "Create a new file in the project with the specified content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path for the new file" },
          content: { type: "string", description: "Full code content of the file" },
        },
        required: ["path", "content"],
      },
    },
    schema: toolSchemas.create_project_file,
  },
  {
    type: "function",
    function: {
      name: "edit_project_file",
      description: "Update the content of an existing project file.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path to modify" },
          content: { type: "string", description: "Updated file content" },
          description: { type: "string", description: "Brief description of changes made" },
        },
        required: ["path", "content"],
      },
    },
    schema: toolSchemas.edit_project_file,
  },
  {
    type: "function",
    function: {
      name: "delete_project_file",
      description: "Delete an unwanted file from the project.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path of file to delete" },
        },
        required: ["path"],
      },
    },
    schema: toolSchemas.delete_project_file,
  },
  {
    type: "function",
    function: {
      name: "search_project_files",
      description: "Search across project files for specific keywords, classes, or code snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query or symbol" },
        },
        required: ["query"],
      },
    },
    schema: toolSchemas.search_project_files,
  },
  {
    type: "function",
    function: {
      name: "get_project_structure",
      description: "Get a high-level tree structure of all files and pages in the website.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    schema: toolSchemas.get_project_structure,
  },
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the internet for real-world references, product information, or design trends.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query terms" },
        },
        required: ["query"],
      },
    },
    schema: toolSchemas.search_web,
  },
  {
    type: "function",
    function: {
      name: "fetch_web_page",
      description: "Safely retrieve sanitized content from an approved web page for reference.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to fetch" },
        },
        required: ["url"],
      },
    },
    schema: toolSchemas.fetch_web_page,
  },
  {
    type: "function",
    function: {
      name: "get_project_memory",
      description: "Retrieve long-term memory, design tokens, and architectural decisions.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    schema: toolSchemas.get_project_memory,
  },
  {
    type: "function",
    function: {
      name: "update_project_memory",
      description: "Record new technical decisions, goals, or requirements in project memory.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Updated project summary" },
          newDecisions: { type: "array", items: { type: "string" }, description: "Decisions to add" },
          pendingTasks: { type: "array", items: { type: "string" }, description: "Remaining to-do items" },
        },
      },
    },
    schema: toolSchemas.update_project_memory,
  },
  {
    type: "function",
    function: {
      name: "create_checkpoint",
      description: "Create an atomic backup checkpoint of the project before making major changes.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the milestone checkpoint" },
          description: { type: "string", description: "Reason for the checkpoint" },
        },
        required: ["name"],
      },
    },
    schema: toolSchemas.create_checkpoint,
  },
  {
    type: "function",
    function: {
      name: "run_project_validation",
      description: "Validate HTML structure, CSS links, script syntax, and broken links.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    schema: toolSchemas.run_project_validation,
  },
];

/**
 * Validates a tool invocation arguments against its Zod schema.
 */
export function validateToolCall(
  toolName: string,
  args: unknown
): { valid: true; data: unknown } | { valid: false; error: string } {
  const tool = toolRegistry.find((t) => t.function.name === toolName);
  if (!tool) {
    return { valid: false, error: `Tool '${toolName}' is not registered or permitted.` };
  }

  const result = tool.schema.safeParse(args);
  if (!result.success) {
    return {
      valid: false,
      error: `Invalid arguments for tool '${toolName}': ${JSON.stringify(result.error.format())}`,
    };
  }

  return { valid: true, data: result.data };
}

/**
 * Fallback parser for models that produce structured JSON action blocks instead of native tool calls.
 * E.g.: ```json { "action": "create_project_file", "params": { ... } } ```
 */
export function extractStructuredJsonAction(content: string): Array<{
  name: string;
  args: Record<string, unknown>;
}> {
  const actions: Array<{ name: string; args: Record<string, unknown> }> = [];
  
  // Look for JSON code blocks
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  let match: RegExpExecArray | null;

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && typeof parsed === "object") {
        if (parsed.action && typeof parsed.action === "string") {
          actions.push({
            name: parsed.action,
            args: parsed.params || parsed.arguments || {},
          });
        } else if (Array.isArray(parsed.actions)) {
          for (const a of parsed.actions) {
            if (a.action && typeof a.action === "string") {
              actions.push({
                name: a.action,
                args: a.params || a.arguments || {},
              });
            }
          }
        }
      }
    } catch {
      // Non-JSON code block, ignore
    }
  }

  return actions;
}
