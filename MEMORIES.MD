# Persistent AI Memory Engine: Storage Schema & Retrieval Specification

## 1. Context Window Constraints
- **Target Context Budget**: 4,096 tokens (`OLLAMA_NUM_CTX=4096`).
- **Prompt Allocation Matrix**:
  - System Prompt & Safety Directives: 500 tokens
  - Project Summary & Architecture Decisions: 600 tokens
  - Incremental Conversation Summary: 500 tokens
  - Dynamically Retrieved Memory Chunks: 800 tokens
  - Recent Chat Turns (Last 2-3 exchanges): 600 tokens
  - Output Token Reservation: 1,000 tokens
  - Safety Buffer: 96 tokens

## 2. Memory Storage Representation

```json
{
  "project_id": "proj_a1b2c3d4",
  "memory_version": 4,
  "summary": "Building modern spatial audio hardware landing page with interactive canvas visualizer and luminous mint action triggers.",
  "decisions": [
    {
      "id": "dec_01",
      "topic": "styling",
      "decision": "Use Tailwind CSS with custom Midnight Atelier color tokens",
      "timestamp": "2026-11-01T10:00:00Z"
    },
    {
      "id": "dec_02",
      "topic": "framework",
      "decision": "Use HTML5, Vanilla JavaScript audio API, and Canvas 2D for maximum portable preview fidelity",
      "timestamp": "2026-11-01T10:05:00Z"
    }
  ],
  "tasks": {
    "completed": ["hero_section_setup", "navbar_responsive_mobile"],
    "pending": ["pricing_table_checkout", "contact_modal"]
  },
  "semantic_chunks": [
    {
      "chunk_id": "chk_981",
      "content": "User prefers luminous mint #C8FF70 for all high-intent buttons and electric violet #8B75FF for badges.",
      "keywords": ["color", "button", "mint", "violet", "theme"],
      "created_at": "2026-11-01T10:10:00Z"
    }
  ]
}
```

## 3. Retrieval Pipeline
1. Tokenize current user query.
2. Query PostgreSQL full-text search index (`tsvector` over `memory_chunks` and `web_sources`).
3. Rank by relevance and chronological recency.
4. Truncate context to fit the reserved 800-token dynamic retrieval budget.
5. Ingest into prompt synthesis engine.
