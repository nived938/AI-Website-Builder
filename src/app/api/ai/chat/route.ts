import { NextRequest, NextResponse } from "next/server";
import { ollamaClient } from "@/lib/ai/ollama";
import { contextBudgeter, estimateTokenCount } from "@/lib/ai/context-budgeter";
import { memoryManager } from "@/lib/ai/memory";
import { toolRegistry, extractStructuredJsonAction, validateToolCall } from "@/lib/ai/tools";
import { dbStore } from "@/lib/db/store";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { EffortLevel, estimateTaskCredits, validateEffortForPlan } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      conversationId,
      message,
      effortLevel = "LOW",
      userId = "usr_alex_vance",
    } = body;

    if (!projectId || !message) {
      return NextResponse.json({ error: "projectId and message are required" }, { status: 400 });
    }

    // 1. Rate Limiting Check
    const rateCheck = await rateLimiter.checkRateLimit("ai_request", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many AI requests. Please retry in ${rateCheck.retryAfterSeconds}s.` },
        {
          status: 429,
          headers: { "Retry-After": rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    // 2. Plan Entitlement & Effort Validation
    const subscription = dbStore.getSubscription(userId);
    const effort = (effortLevel as EffortLevel) || "LOW";
    if (!validateEffortForPlan(subscription.planId, effort)) {
      return NextResponse.json(
        {
          error: `Effort level '${effort}' is not permitted on the ${subscription.planId} plan. Please upgrade your subscription to unlock higher reasoning effort.`,
        },
        { status: 403 }
      );
    }

    // 3. Balance Check & Reservation
    const estimatedTokens = estimateTokenCount(message) + 800;
    const estimatedCredits = estimateTaskCredits(estimatedTokens, effort);

    const creditAccount = dbStore.getCreditAccount(userId);
    if (creditAccount.totalAvailable < estimatedCredits) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Required ~${estimatedCredits} credits, but you have ${creditAccount.totalAvailable.toFixed(1)} available. Please top-up or wait for daily reset.`,
        },
        { status: 402 }
      );
    }

    // 4. Retrieve Project, Memory & Files
    const project = dbStore.getProject(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const files = dbStore.getProjectFiles(projectId);
    const memory = dbStore.getProjectMemory(projectId);
    const summaryRecord = dbStore.getConversationSummary(conversationId || "conv_default");
    const rawMessages = conversationId ? dbStore.getMessages(conversationId) : [];

    // Search relevant context for prompt
    const { relevantChunks, relevantFiles } = memoryManager.searchRelevantContext({
      query: message,
      memoryChunks: memory.decisions.map((d) => ({ category: "decision", content: d })),
      files: files.map((f) => ({ path: f.path, content: f.content })),
    });

    const webSources = dbStore.getWebSources(projectId);

    // 5. Context Budgeting (Strict <= 4,000 tokens envelope)
    const systemDirective = `You are VEYRA Studio AI, an elite full-stack web designer and software engineer.
You build production-grade, accessible, responsive websites adhering to the Midnight Atelier design tokens:
- Background: #0B1020
- Graphite surfaces: #111827
- Porcelain text: #F4F3EF
- Luminous mint for primary actions: #C8FF70
- Electric violet for AI/accent features: #8B75FF
- Secondary text: #929BAD

When creating or modifying files, you can use tool calling OR output an action block in JSON:
\`\`\`json
{
  "action": "create_project_file",
  "params": {
    "path": "index.html",
    "content": "..."
  }
}
\`\`\`
Always provide complete, robust, beautiful HTML, CSS, or JS code. Never leave placeholders or uncompleted sections.`;

    const packedPrompt = contextBudgeter.packPrompt({
      systemDirective,
      projectSummary: memory.summary || `${project.name}: ${project.description}`,
      technicalDecisions: memory.decisions,
      conversationSummary: summaryRecord.summary,
      relevantMemoryChunks: relevantChunks,
      relevantFiles,
      webCitations: webSources.map((s) => ({ title: s.title, url: s.url, snippet: s.snippet })),
      recentMessages: rawMessages.slice(-4).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      currentUserMessage: message,
    });

    // Save user message
    if (conversationId) {
      dbStore.createMessage(
        conversationId,
        projectId,
        "user",
        message,
        estimateTokenCount(message)
      );
    }

    // 6. Execute Streaming Call to Ollama with Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponseContent = "";
        let promptTokensUsed = packedPrompt.estimatedPromptTokens;
        let completionTokensUsed = 0;

        try {
          // Send thinking stage event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "stage", stage: "Understanding requirements & planning" })}\n\n`
            )
          );

          const generator = ollamaClient.streamChat({
            messages: packedPrompt.messages,
            tools: toolRegistry.map((t) => ({
              type: t.type,
              function: t.function,
            })),
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "stage", stage: "Generating website code & components" })}\n\n`
            )
          );

          for await (const chunk of generator) {
            if (chunk.contentChunk) {
              fullResponseContent += chunk.contentChunk;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "chunk", content: chunk.contentChunk })}\n\n`
                )
              );
            }

            if (chunk.done && chunk.totalTokens) {
              promptTokensUsed = chunk.totalTokens.prompt || promptTokensUsed;
              completionTokensUsed = chunk.totalTokens.completion || completionTokensUsed;
            }
          }

          // 7. Check for structured actions (File mutations)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "stage", stage: "Validating file modifications & saving checkpoint" })}\n\n`
            )
          );

          const actions = extractStructuredJsonAction(fullResponseContent);
          const modifiedFiles: string[] = [];

          if (actions.length > 0) {
            // Create checkpoint prior to mutating
            dbStore.createCheckpoint(
              projectId,
              `Pre-mutation checkpoint: ${message.slice(0, 30)}`,
              "Auto-saved prior to AI code modifications"
            );

            for (const act of actions) {
              const validation = validateToolCall(act.name, act.args);
              if (validation.valid) {
                if (act.name === "create_project_file" || act.name === "edit_project_file") {
                  const args = act.args as { path: string; content: string };
                  dbStore.saveProjectFile(projectId, args.path, args.content);
                  modifiedFiles.push(args.path);
                } else if (act.name === "delete_project_file") {
                  const args = act.args as { path: string };
                  dbStore.deleteProjectFile(projectId, args.path);
                  modifiedFiles.push(`deleted: ${args.path}`);
                }
              }
            }
          }

          // 8. Save Assistant Message & Update Incremental Memory
          if (conversationId) {
            dbStore.createMessage(
              conversationId,
              projectId,
              "assistant",
              fullResponseContent,
              completionTokensUsed
            );

            // Update rolling conversation summary
            const { updatedSummary, extractedDecisions } = memoryManager.summarizeDialog({
              existingSummary: summaryRecord.summary,
              existingDecisions: summaryRecord.decisions,
              messagesToSummarize: [
                { role: "user", content: message },
                { role: "assistant", content: fullResponseContent },
              ],
            });

            dbStore.updateConversationSummary(conversationId, updatedSummary, extractedDecisions);
            dbStore.updateProjectMemory(projectId, { newDecisions: extractedDecisions });
          }

          // 9. Settle Credit Deduction
          const totalTokens = promptTokensUsed + completionTokensUsed;
          const actualCredits = estimateTaskCredits(totalTokens, effort);

          dbStore.deductCredits(
            userId,
            actualCredits,
            `AI generation (${effort} effort, ${totalTokens} tokens)`,
            projectId
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                creditsDeducted: actualCredits,
                tokensUsed: totalTokens,
                modifiedFiles,
              })}\n\n`
            )
          );

          controller.close();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: msg,
                troubleshooting: [
                  "Ensure your local Ollama node is running on 127.0.0.1:11434",
                  "Verify OLLAMA_MODEL is set in .env.local and matches an installed model",
                  "Check GPU/CPU memory allocation",
                ],
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
