# Claude Code Platform Tooling Guidelines: VEYRA Studio

## Build & Test Commands
- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev`
- **Production Build**: `npm run build`
- **Linting & Code Quality**: `npm run lint`
- **Type Checking**: `npm run type-check`
- **Unit & Integration Tests**: `npm run test`
- **E2E Browser Tests**: `npx playwright test`
- **Database Migrations**: `npm run db:migrate`

## Architectural Guidelines
- **Framework**: Next.js 15+ (App Router), React 19, TypeScript (Strict Mode).
- **Styling**: Tailwind CSS with custom Midnight Atelier theme variables.
- **Server Routes**: Next.js Server Actions & API Route Handlers in `src/app/api/...`.
- **Validation**: Strict schema validation using Zod for all API inputs, tool calls, and environment variables.
- **State Management**: React Server Components where applicable, Zustand or lightweight React Context for workspace UI state.
- **Editor**: CodeMirror / Monaco editor integration with custom theme and syntax highlighting.
- **Database**: PostgreSQL via Supabase client, parameterized queries, and Row Level Security.
- **AI Backend**: Server-orchestrated Ollama API streaming client with context budgeting.
