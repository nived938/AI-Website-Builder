# Contributing to VEYRA Studio

Thank you for your interest in contributing to **VEYRA Studio**! We welcome contributions to our AI-powered website builder.

## Codebase Principles
1. **Safety & Security First**: Never expose private keys, credentials, or internal endpoints to browser bundles. Never bypass server-side validation or credit ledger checks.
2. **Deterministic Context Budgeting**: All prompts to local Ollama instances must respect the strict context budget (~4,000 tokens by default) using persistent memory retrieval and incremental summaries.
3. **Design Fidelity**: All interfaces must adhere strictly to the **Midnight Atelier** design tokens (Graphite `#111827`, Deep background `#0B1020`, Porcelain `#F4F3EF`, Electric Violet `#8B75FF`, Luminous Mint `#C8FF70`).

## Development Workflow
1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run migrations and local database setup:
   ```bash
   npm run db:migrate
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Pull Request Guidelines
- Branch names: `feature/your-feature-name`, `fix/your-bug-fix`, or `docs/improvement`.
- Ensure strict TypeScript typing (`npm run type-check`).
- Run automated tests (`npm run test`) and linting (`npm run lint`).
- Keep commits atomic and write clear commit messages adhering to Conventional Commits:
  - `feat: add isolated iframe sandbox communication bridge`
  - `fix: prevent negative balance in credit ledger reservations`
  - `docs: update Ollama context budgeting guide`
- Update relevant documentation files whenever changing architecture or APIs.
