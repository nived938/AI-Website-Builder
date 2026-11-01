# Persistent AI Memory Engine Architecture (4,000-Token Budget)

## 1. Challenge & Context Budgeting
Most local Ollama models run comfortably within a 4,096 token context window (`OLLAMA_NUM_CTX=4096`). In complex web-building interactions where users prompt iteratively (e.g., "Build a landing page" -> "Change the navbar" -> "Make hero taller" -> "Add gallery"), a naive LLM client will quickly exceed the context window or drop critical early instructions.

VEYRA Studio solves this through a multi-tier database-backed retrieval and incremental summarization system.

## 2. Dynamic Context Budget Breakdown

| Component | Target Token Allocation | Strategy |
| :--- | :--- | :--- |
| **System Directives** | ~500 tokens | Concise, unyielding rules for code generation & tool formatting |
| **Project Summary** | ~400 tokens | High-level site description, stack, and active files |
| **Technical Decisions** | ~300 tokens | Cumulative architectural choices (fonts, colors, frameworks) |
| **Conversation Summary**| ~500 tokens | Incremental rolling summary of past dialog rounds |
| **Retrieved Memory Chunks**| ~700 tokens | RAG snippets matched via PostgreSQL full-text search (`tsvector`) |
| **Recent Turns** | ~600 tokens | Raw user/assistant exchanges from the last 2-3 turns |
| **Current User Prompt** | ~300 tokens | Current instruction plus attached references |
| **Output Reservation** | ~796 tokens | Dedicated headroom for Ollama streaming response |
| **Total Budget** | **4,096 tokens** | Fully predictable, bounded context envelope |

## 3. Incremental Rolling Summarization
When the conversation approaches token threshold:
1. Messages older than the last 3 turns are summarized in an atomic background step.
2. New summaries are merged into the existing `conversation_summaries` row.
3. Explicit technical decisions (e.g., "Always use mint buttons #C8FF70") are extracted and written to `project_decisions`.
4. Original raw messages are preserved in the `messages` table for full-text search and audit, never deleted.

## 4. Continuity Across Sessions
When a user reloads the browser, logs out, or returns days later:
1. The workspace loads the latest project summary and conversation summary.
2. The user can type: "Now add a contact form."
3. The AI retrieves the existing file tree and active CSS classes, successfully continuing work without asking the user to re-explain the project.
