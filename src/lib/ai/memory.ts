export interface ProjectMemoryRecord {
  projectId: string;
  summary: string;
  primaryGoals: string[];
  techStackDetails: {
    framework: string;
    styling: string;
    keyPackages: string[];
    colorPalette: Record<string, string>;
  };
  designSystemNotes: string;
  knownIssues: string[];
  completedMilestones: string[];
  pendingTasks: string[];
  decisions: Array<{ topic: string; decision: string; rationale?: string }>;
}

export interface ConversationSummaryRecord {
  conversationId: string;
  projectId: string;
  summary: string;
  keyDecisions: string[];
  lastProcessedMessageIndex: number;
}

export class MemoryManager {
  /**
   * Generates or incrementally updates a conversation summary from a batch of older messages.
   * Extracts technical decisions, active requirements, and pending tasks.
   */
  summarizeDialog(params: {
    existingSummary: string;
    existingDecisions: string[];
    messagesToSummarize: Array<{ role: string; content: string }>;
  }): {
    updatedSummary: string;
    extractedDecisions: string[];
  } {
    const { existingSummary, existingDecisions, messagesToSummarize } = params;
    const newDecisions: string[] = [...existingDecisions];

    const messagePoints: string[] = [];

    for (const msg of messagesToSummarize) {
      if (msg.role === "user") {
        // Extract intents and decisions
        const lower = msg.content.toLowerCase();
        if (lower.includes("color") || lower.includes("theme") || lower.includes("font") || lower.includes("style")) {
          newDecisions.push(`Visual preference: "${msg.content.slice(0, 120)}"`);
        } else if (lower.includes("framework") || lower.includes("library") || lower.includes("package")) {
          newDecisions.push(`Tech stack choice: "${msg.content.slice(0, 120)}"`);
        }
        messagePoints.push(`User requested: ${msg.content.slice(0, 140)}`);
      } else if (msg.role === "assistant") {
        // Capture completed mutations
        const firstLine = msg.content.split("\n")[0].slice(0, 140);
        messagePoints.push(`Assistant implemented: ${firstLine}`);
      }
    }

    // Merge into concise running summary
    const incrementalText = messagePoints.join("; ");
    const updatedSummary = existingSummary
      ? `${existingSummary} | Recent updates: ${incrementalText}`.slice(0, 1500)
      : incrementalText.slice(0, 1500);

    // Deduplicate decisions
    const uniqueDecisions = Array.from(new Set(newDecisions)).slice(0, 15);

    return {
      updatedSummary,
      extractedDecisions: uniqueDecisions,
    };
  }

  /**
   * Search memory chunks and project files using keywords and full-text matching.
   */
  searchRelevantContext(params: {
    query: string;
    memoryChunks: Array<{ category: string; content: string }>;
    files: Array<{ path: string; content: string }>;
    limit?: number;
  }): {
    relevantChunks: string[];
    relevantFiles: Array<{ path: string; snippet: string }>;
  } {
    const queryTerms = params.query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);

    if (queryTerms.length === 0) {
      return {
        relevantChunks: params.memoryChunks.slice(0, 3).map((c) => c.content),
        relevantFiles: params.files.slice(0, 2).map((f) => ({
          path: f.path,
          snippet: f.content.slice(0, 500),
        })),
      };
    }

    // Score memory chunks
    const scoredChunks = params.memoryChunks
      .map((chunk) => {
        let score = 0;
        const text = chunk.content.toLowerCase();
        for (const term of queryTerms) {
          if (text.includes(term)) score += 2;
        }
        return { chunk, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, params.limit || 5)
      .map((item) => item.chunk.content);

    // Score files
    const scoredFiles = params.files
      .map((file) => {
        let score = 0;
        const lowerPath = file.path.toLowerCase();
        const lowerContent = file.content.toLowerCase();

        for (const term of queryTerms) {
          if (lowerPath.includes(term)) score += 5; // Path matches are high priority
          if (lowerContent.includes(term)) score += 1;
        }

        return { file, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({
        path: item.file.path,
        snippet: item.file.content.slice(0, 1200),
      }));

    return {
      relevantChunks: scoredChunks,
      relevantFiles: scoredFiles,
    };
  }
}

export const memoryManager = new MemoryManager();
