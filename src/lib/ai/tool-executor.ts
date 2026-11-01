import { dbStore } from "@/lib/db/store";
import { toolRegistry, validateToolCall } from "@/lib/ai/tools";

const CHAT_TOOL_NAMES = new Set([
  "list_project_files",
  "read_project_file",
  "create_project_file",
  "edit_project_file",
  "delete_project_file",
  "search_project_files",
  "get_project_structure",
  "get_project_memory",
  "update_project_memory",
  "create_checkpoint",
  "run_project_validation",
]);

const MUTATION_TOOLS = new Set([
  "create_project_file",
  "edit_project_file",
  "delete_project_file",
]);

export function getChatToolDefinitions() {
  return toolRegistry
    .filter((tool) => CHAT_TOOL_NAMES.has(tool.function.name))
    .map((tool) => ({ type: tool.type, function: tool.function }));
}

function normalizePath(input: string): string {
  const normalized = input.trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
  const segments = normalized.split("/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.includes("\0") ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Invalid file path. Use a relative path inside this project.");
  }
  return segments.join("/");
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function executeProjectTool(
  name: string,
  rawArguments: unknown,
  projectId: string,
  allowMutations: boolean
): Promise<Record<string, unknown>> {
  if (!CHAT_TOOL_NAMES.has(name)) {
    return { success: false, error: "This tool is not enabled in the project executor." };
  }
  if (MUTATION_TOOLS.has(name) && !allowMutations) {
    return {
      success: false,
      executed: false,
      error: "The user did not request a project change. Do not modify files. Reply conversationally.",
    };
  }

  const validation = validateToolCall(name, asObject(rawArguments));
  if (!validation.valid) return { success: false, error: validation.error };
  const args = validation.data as Record<string, unknown>;

  switch (name) {
    case "list_project_files": {
      const directory = String(args.directory || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
      const prefix = directory ? directory.replace(/\/?$/, "/") : "";
      const files = dbStore.getProjectFiles(projectId)
        .filter((file) => !directory || file.path === directory || file.path.startsWith(prefix))
        .map((file) => ({ path: file.path, sizeBytes: file.sizeBytes, updatedAt: file.updatedAt }));
      return { success: true, files };
    }
    case "read_project_file": {
      const filePath = normalizePath(String(args.path));
      const file = dbStore.getProjectFiles(projectId).find((item) => item.path === filePath);
      if (!file) return { success: false, error: "File not found: " + filePath };
      return {
        success: true,
        path: filePath,
        content: file.content.slice(0, 30000),
        truncated: file.content.length > 30000,
      };
    }
    case "create_project_file":
    case "edit_project_file": {
      const filePath = normalizePath(String(args.path));
      const content = String(args.content ?? "");
      if (!content.trim()) return { success: false, error: "Refusing to save an empty file." };
      if (content.length > 1000000) {
        return { success: false, error: "File exceeds the 1 MB generation limit." };
      }
      const saved = dbStore.saveProjectFile(projectId, filePath, content);
      return {
        success: true,
        saved: true,
        path: saved.path,
        sizeBytes: saved.sizeBytes,
        message: "Saved " + saved.path + " to the current project.",
      };
    }
    case "delete_project_file": {
      const filePath = normalizePath(String(args.path));
      const deleted = dbStore.deleteProjectFile(projectId, filePath);
      return deleted
        ? { success: true, deleted: true, path: filePath }
        : { success: false, error: "File not found: " + filePath };
    }
    case "search_project_files": {
      const query = String(args.query).toLowerCase();
      const results = dbStore.getProjectFiles(projectId)
        .map((file) => {
          const index = file.content.toLowerCase().indexOf(query);
          if (index < 0) return null;
          return {
            path: file.path,
            snippet: file.content.slice(Math.max(0, index - 180), Math.min(file.content.length, index + query.length + 240)),
          };
        })
        .filter((result) => result !== null)
        .slice(0, 10);
      return { success: true, results };
    }
    case "get_project_structure":
      return { success: true, files: dbStore.getProjectFiles(projectId).map((file) => file.path).sort() };
    case "get_project_memory":
      return { success: true, memory: dbStore.getProjectMemory(projectId) };
    case "update_project_memory": {
      const memory = dbStore.updateProjectMemory(projectId, {
        summary: typeof args.summary === "string" ? args.summary : undefined,
        newDecisions: Array.isArray(args.newDecisions) ? args.newDecisions as string[] : undefined,
        pendingTasks: Array.isArray(args.pendingTasks) ? args.pendingTasks as string[] : undefined,
      });
      return { success: true, memory };
    }
    case "create_checkpoint": {
      const checkpoint = dbStore.createCheckpoint(
        projectId,
        String(args.name),
        typeof args.description === "string" ? args.description : undefined
      );
      return { success: true, checkpointId: checkpoint.id, createdAt: checkpoint.createdAt };
    }
    case "run_project_validation": {
      const files = dbStore.getProjectFiles(projectId);
      const htmlFiles = files.filter((file) => file.path.endsWith(".html"));
      const checks = [
        { name: "index.html exists", passed: files.some((file) => file.path === "index.html") },
        { name: "at least one HTML page exists", passed: htmlFiles.length > 0 },
        { name: "project has at least one file", passed: files.length > 0 },
      ];
      return { success: true, passed: checks.every((check) => check.passed), checks, filesChecked: files.length };
    }
    default:
      return { success: false, error: "Unsupported project tool: " + name };
  }
}
