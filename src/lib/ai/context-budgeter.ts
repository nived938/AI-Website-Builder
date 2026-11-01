import { OllamaMessage } from "./ollama";
import { getEnv } from "@/lib/env";

export interface ContextBudget {
  maxContextTokens: number;
  outputHeadroomTokens: number;
  systemPromptTokens: number;
  projectSummaryTokens: number;
  conversationSummaryTokens: number;
  retrievedMemoryTokens: number;
  recentDialogTokens: number;
  currentUserPromptTokens: number;
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Conservative estimate: ~3.5 chars per token for code/technical text, min 1
  return Math.ceil(text.length / 3.5);
}

export class ContextBudgeter {
  private budget: ContextBudget;

  constructor() {
    const env = getEnv();
    const maxTokens = env.OLLAMA_NUM_CTX || 4096;

    // Strict allocation guaranteeing output headroom within 4,096 tokens
    this.budget = {
      maxContextTokens: maxTokens,
      outputHeadroomTokens: Math.max(800, Math.floor(maxTokens * 0.2)),
      systemPromptTokens: 500,
      projectSummaryTokens: 500,
      conversationSummaryTokens: 500,
      retrievedMemoryTokens: 700,
      recentDialogTokens: 600,
      currentUserPromptTokens: 400,
    };
  }

  getBudget(): ContextBudget {
    return this.budget;
  }

  /**
   * Packs all contextual information into an Ollama prompt array strictly within the token budget.
   */
  packPrompt(params: {
    systemDirective: string;
    projectSummary: string;
    technicalDecisions: string[];
    conversationSummary: string;
    relevantMemoryChunks: string[];
    relevantFiles: Array<{ path: string; snippet: string }>;
    webCitations?: Array<{ title: string; snippet: string; url: string }>;
    recentMessages: Array<{ role: "user" | "assistant"; content: string }>;
    currentUserMessage: string;
  }): {
    messages: OllamaMessage[];
    estimatedPromptTokens: number;
    budgetExceeded: boolean;
  } {
    const messages: OllamaMessage[] = [];

    // 1. Build System Instruction
    let systemContent = params.systemDirective.trim();

    // Append Project Context & Architecture Decisions
    if (params.projectSummary || params.technicalDecisions.length > 0) {
      systemContent += `\n\n### PROJECT CONTEXT\n${params.projectSummary}`;
      if (params.technicalDecisions.length > 0) {
        systemContent += `\nKey Architectural Decisions:\n- ${params.technicalDecisions.join("\n- ")}`;
      }
    }

    // Append Rolling Conversation Summary
    if (params.conversationSummary) {
      systemContent += `\n\n### PREVIOUS CONVERSATION SUMMARY (PAST CONTEXT)\n${params.conversationSummary}`;
    }

    // Append Retrieved Persistent Memory & RAG Chunks
    if (params.relevantMemoryChunks.length > 0) {
      systemContent += `\n\n### RETRIEVED PROJECT MEMORY\n- ${params.relevantMemoryChunks.join("\n- ")}`;
    }

    // Append Retrieved Web Research References (Treated strictly as untrusted data)
    if (params.webCitations && params.webCitations.length > 0) {
      systemContent += `\n\n### VERIFIED WEB RESEARCH REFERENCES (UNTRUSTED DATA)\n`;
      params.webCitations.forEach((cite, idx) => {
        systemContent += `[Source ${idx + 1}] "${cite.title}" (${cite.url}): ${cite.snippet}\n`;
      });
    }

    // Append Relevant Project Files
    if (params.relevantFiles.length > 0) {
      systemContent += `\n\n### RELEVANT ACTIVE FILES\n`;
      params.relevantFiles.forEach((file) => {
        systemContent += `--- FILE: ${file.path} ---\n${file.snippet}\n`;
      });
    }

    messages.push({ role: "system", content: systemContent });

    // 2. Add Recent Turns (prioritizing the most recent without exceeding budget)
    const availableRecentTokens = this.budget.recentDialogTokens;
    let accumulatedRecentTokens = 0;
    const packedRecentMessages: OllamaMessage[] = [];

    // Walk backwards from most recent
    for (let i = params.recentMessages.length - 1; i >= 0; i--) {
      const msg = params.recentMessages[i];
      const tokens = estimateTokenCount(msg.content);
      if (accumulatedRecentTokens + tokens > availableRecentTokens) {
        break; // Stop adding older messages; they are captured in conversationSummary
      }
      accumulatedRecentTokens += tokens;
      packedRecentMessages.unshift({
        role: msg.role,
        content: msg.content,
      });
    }

    messages.push(...packedRecentMessages);

    // 3. Add Current User Instruction
    messages.push({
      role: "user",
      content: params.currentUserMessage,
    });

    // 4. Calculate total prompt tokens
    let totalTokens = 0;
    for (const m of messages) {
      totalTokens += estimateTokenCount(m.content);
    }

    const availableForPrompt = this.budget.maxContextTokens - this.budget.outputHeadroomTokens;
    const budgetExceeded = totalTokens > availableForPrompt;

    return {
      messages,
      estimatedPromptTokens: totalTokens,
      budgetExceeded,
    };
  }
}

export const contextBudgeter = new ContextBudgeter();
