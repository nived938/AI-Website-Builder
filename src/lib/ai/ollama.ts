import { getEnv } from "@/lib/env";

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  images?: string[];
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }>;
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaHealthStatus {
  available: boolean;
  modelConfigured: boolean;
  modelAvailable: boolean;
  configuredModel: string;
  availableModels: string[];
  errorMessage?: string;
  troubleshooting?: string[];
}

export class OllamaClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    const env = getEnv();
    this.baseUrl = env.OLLAMA_BASE_URL.replace(/\/$/, "");
    this.defaultTimeout = env.OLLAMA_TIMEOUT_MS;
  }

  /**
   * Check Ollama node health and verify configured model availability
   */
  async checkHealth(): Promise<OllamaHealthStatus> {
    const env = getEnv();
    const configuredModel = env.OLLAMA_MODEL.trim();

    if (!configuredModel) {
      return {
        available: true,
        modelConfigured: false,
        modelAvailable: false,
        configuredModel: "",
        availableModels: [],
        errorMessage: "No OLLAMA_MODEL configured in .env.local",
        troubleshooting: [
          "Open .env.local in the root directory",
          "Set OLLAMA_MODEL=<your_model> (e.g. OLLAMA_MODEL=llama3.2 or qwen2.5-coder:7b)",
          "Run 'ollama pull <model>' in your terminal to ensure the weights are downloaded",
        ],
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          available: false,
          modelConfigured: true,
          modelAvailable: false,
          configuredModel,
          availableModels: [],
          errorMessage: `Ollama returned HTTP ${res.status}: ${res.statusText}`,
          troubleshooting: [
            "Ensure Ollama is running (`ollama serve`)",
            `Verify ${this.baseUrl} is reachable from this machine`,
          ],
        };
      }

      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const availableModels = (data.models || []).map((m) => m.name);
      
      // Match model name exact or with :latest tag
      const isAvailable = availableModels.some(
        (m) =>
          m === configuredModel ||
          m === `${configuredModel}:latest` ||
          m.startsWith(`${configuredModel}:`)
      );

      if (!isAvailable) {
        return {
          available: true,
          modelConfigured: true,
          modelAvailable: false,
          configuredModel,
          availableModels,
          errorMessage: `Configured model '${configuredModel}' is not present in local Ollama node.`,
          troubleshooting: [
            `Run in your terminal: ollama pull ${configuredModel}`,
            `Or select one of your installed models: ${availableModels.join(", ") || "(none installed)"}`,
          ],
        };
      }

      return {
        available: true,
        modelConfigured: true,
        modelAvailable: true,
        configuredModel,
        availableModels,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        available: false,
        modelConfigured: !!configuredModel,
        modelAvailable: false,
        configuredModel,
        availableModels: [],
        errorMessage: `Cannot connect to Ollama at ${this.baseUrl}: ${message}`,
        troubleshooting: [
          "Check that Ollama is installed and running (`ollama serve`)",
          "Verify OLLAMA_BASE_URL in .env.local",
          "Check firewall or port 11434 permissions",
        ],
      };
    }
  }

  /**
   * Stream chat completion from Ollama
   */
  async *streamChat(params: {
    messages: OllamaMessage[];
    tools?: Array<{
      type: "function";
      function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      };
    }>;
    temperature?: number;
    signal?: AbortSignal;
  }): AsyncGenerator<{
    contentChunk: string;
    toolCalls?: OllamaMessage["tool_calls"];
    done: boolean;
    totalTokens?: { prompt: number; completion: number };
  }> {
    const env = getEnv();
    const model = env.OLLAMA_MODEL.trim();

    if (!model) {
      throw new Error("OLLAMA_MODEL is not configured in .env.local. Please specify a model.");
    }

    const payload: Record<string, unknown> = {
      model,
      messages: params.messages,
      stream: true,
      options: {
        num_ctx: env.OLLAMA_NUM_CTX,
        temperature: params.temperature ?? env.OLLAMA_TEMPERATURE,
      },
      keep_alive: env.OLLAMA_KEEP_ALIVE,
    };

    if (params.tools && params.tools.length > 0) {
      payload.tools = params.tools;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.defaultTimeout);

    // Chain abort signals if provided
    if (params.signal) {
      params.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama API error (${res.status}): ${errorText}`);
      }

      if (!res.body) {
        throw new Error("Ollama returned empty response body.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            const contentChunk = parsed.message?.content || "";
            const toolCalls = parsed.message?.tool_calls;
            const isDone = parsed.done || false;
            const promptTokens = parsed.prompt_eval_count || 0;
            const completionTokens = parsed.eval_count || 0;

            yield {
              contentChunk,
              toolCalls,
              done: isDone,
              totalTokens: isDone
                ? { prompt: promptTokens, completion: completionTokens }
                : undefined,
            };
          } catch {
            // Incomplete JSON line, continue accumulating
          }
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (params.signal?.aborted || controller.signal.aborted) {
        throw new Error("Inference was cancelled by the user or timed out.");
      }
      throw err;
    }
  }
}

export const ollamaClient = new OllamaClient();
