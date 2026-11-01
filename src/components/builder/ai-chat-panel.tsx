"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Send,
  StopCircle,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { EffortLevel, EFFORT_MULTIPLIERS } from "@/lib/billing/plans";
import { formatCredits } from "@/lib/utils";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  stage?: string;
  tokens?: number;
  credits?: number;
}

interface AIChatPanelProps {
  projectId: string;
  conversationId?: string;
  initialMessages?: MessageItem[];
  userPlanId?: string;
  availableCredits?: number;
  onGenerationComplete?: (modifiedFiles: string[]) => void;
}

export function AIChatPanel({
  projectId,
  conversationId = "conv_default",
  initialMessages = [],
  userPlanId = "PRO",
  availableCredits = 10200,
  onGenerationComplete,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [inputPrompt, setInputPrompt] = useState("");
  const [effortLevel, setEffortLevel] = useState<EffortLevel>("LOW");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [ollamaModel, setOllamaModel] = useState<string>("Local Ollama");
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean>(true);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check Ollama status on mount
  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.health) {
          setOllamaHealthy(data.health.available && data.health.modelAvailable);
          setOllamaModel(data.health.configuredModel || "Not configured");
          if (!data.health.modelAvailable) {
            setOllamaError(
              data.health.errorMessage || "Configured model not found in Ollama"
            );
          }
        }
      })
      .catch(() => {
        setOllamaHealthy(false);
        setOllamaError("Cannot connect to local Ollama at 127.0.0.1:11434");
      });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStage]);

  // Estimate credits for current input
  const estimatedCredits = Math.ceil(
    Math.max(1, (inputPrompt.length / 400) * 10) * EFFORT_MULTIPLIERS[effortLevel]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    const userPrompt = inputPrompt.trim();
    setInputPrompt("");

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: userPrompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setCurrentStage("Connecting to local Ollama inference node...");

    const assistantMsgId = `asst_${Date.now()}`;
    const assistantMsg: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          conversationId,
          message: userPrompt,
          effortLevel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "stage") {
                setCurrentStage(data.stage);
              } else if (data.type === "chunk") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + data.content }
                      : m
                  )
                );
              } else if (data.type === "done") {
                setCurrentStage("");
                onGenerationComplete?.(data.modifiedFiles || []);
              } else if (data.type === "error") {
                setOllamaError(data.error);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content:
                            m.content + `\n\n⚠️ Error during generation: ${data.error}`,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && err.name === "AbortError") {
        setCurrentStage("Generation cancelled by user.");
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + `\n\n⚠️ Request Failed: ${msg}` }
              : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setCurrentStage("");
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <aside className="w-80 lg:w-96 border-l border-border bg-graphite-300 flex flex-col h-full select-none text-xs">
      {/* Copilot Header */}
      <div className="p-3 border-b border-border bg-graphite-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-dim border border-violet/30 text-violet">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-sans font-bold text-porcelain text-xs flex items-center gap-1.5">
              <span>AI Architect</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  ollamaHealthy ? "bg-mint animate-pulse" : "bg-red-400"
                }`}
                title={ollamaHealthy ? "Ollama Active" : "Ollama Warning"}
              />
            </div>
            <div className="font-mono text-[10px] text-porcelain-muted truncate max-w-[160px]">
              {ollamaModel}
            </div>
          </div>
        </div>

        {/* Available Credits Indicator */}
        <div className="flex items-center gap-1 rounded bg-graphite-100 px-2 py-1 text-[11px] font-mono text-mint border border-border">
          <Zap className="h-3 w-3 text-mint" />
          <span>{formatCredits(availableCredits)}</span>
        </div>
      </div>

      {/* Effort Level Selector Bar */}
      <div className="p-2.5 border-b border-border bg-graphite-400 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-porcelain-muted">Reasoning Effort:</span>
        <div className="flex items-center gap-1 bg-graphite-200 p-0.5 rounded border border-border">
          {(["LOW", "MEDIUM", "HIGH", "MAX"] as EffortLevel[]).map((level) => {
            const isSelected = effortLevel === level;
            const isFreeRestricted = userPlanId === "FREE" && level !== "LOW";

            return (
              <button
                key={level}
                type="button"
                disabled={isGenerating || isFreeRestricted}
                onClick={() => setEffortLevel(level)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  isSelected
                    ? "bg-violet text-porcelain shadow-sm"
                    : isFreeRestricted
                    ? "text-porcelain-muted/40 cursor-not-allowed"
                    : "text-porcelain-muted hover:text-porcelain"
                }`}
                title={
                  isFreeRestricted
                    ? `Upgrade plan to unlock ${level} effort`
                    : `${level} (${EFFORT_MULTIPLIERS[level]}x credit multiplier)`
                }
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Alert Banner if not healthy */}
      {ollamaError && (
        <div className="bg-red-950/40 border-b border-red-800/50 p-2.5 text-[11px] text-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-bold">Ollama Configuration Notice:</span>{" "}
            {ollamaError}
          </div>
        </div>
      )}

      {/* Conversation Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-graphite-100 text-porcelain border border-border"
                  : "bg-graphite-400 text-porcelain border border-border/80 shadow-md"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-border text-[10px] font-mono text-violet font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>VEYRA Copilot</span>
                </div>
              )}
              <div className="whitespace-pre-wrap font-sans">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Live Stage Status Progress */}
        {currentStage && (
          <div className="flex items-center gap-2 p-2 rounded bg-violet-dim border border-violet/30 text-violet text-[11px] animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="font-semibold">{currentStage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Input Dock */}
      <div className="p-3 border-t border-border bg-graphite-200/90">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="relative">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask VEYRA to generate pages, change colors, add animations..."
              rows={3}
              disabled={isGenerating}
              className="w-full rounded-md border border-border bg-graphite-100 p-2.5 text-xs text-porcelain placeholder:text-porcelain-muted focus:border-mint focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-porcelain-muted">
              <span className="font-mono text-[10px] text-mint">
                ~{estimatedCredits} credits ({effortLevel})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 transition"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-mint px-4 py-1.5 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Build / Generate ↵
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
}
