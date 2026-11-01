# Dependencies & Technology Ledger: VEYRA Studio

## 1. Runtime Environment
- **Node.js**: `v24.x` (LTS)
- **NPM**: `v11.x`
- **Database**: PostgreSQL 15+ (Supabase)
- **AI Inference Engine**: Ollama (Local/Self-hosted)

## 2. Core Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `^15.2.0` | React application framework (App Router) |
| `react` / `react-dom` | `^19.0.0` | Frontend UI library |
| `typescript` | `^5.7.0` | Static typing and compiler |
| `@supabase/supabase-js` | `^2.49.0` | PostgreSQL client & Supabase Auth integration |
| `@supabase/ssr` | `^0.5.2` | Supabase server-side authentication for Next.js App Router |
| `tailwindcss` | `^3.4.17` | Utility-first CSS styling engine |
| `lucide-react` | `^0.475.0` | Clean, customizable modern icon set |
| `zod` | `^3.24.2` | Runtime schema declaration and validation |
| `razorpay` | `^2.9.5` | Official Razorpay Node.js SDK for payment gateway integration |
| `jszip` | `^3.10.1` | In-memory ZIP archive generation for website code export |
| `@codemirror/view` / `@codemirror/state` | `^6.x` | High-performance in-browser code editor |
| `framer-motion` | `^12.4.0` | Fluid animations, drag handles, and transition orchestration |
| `clsx` / `tailwind-merge` | `^2.x` | Conditional CSS class merging utility |

## 3. Development & Testing Dependencies
- `playwright`: End-to-end browser automation and screenshot testing.
- `vitest`: Ultra-fast unit and integration test runner.
- `eslint` & `prettier`: Code formatting and quality linter.
