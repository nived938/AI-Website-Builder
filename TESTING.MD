# Testing Protocols & QA Guide: VEYRA Studio

## 1. Testing Philosophy
VEYRA Studio is a mission-critical SaaS platform. We maintain multi-layer automated verification across:
- Authentication & RLS Authorization.
- AI Context Budgeting & Memory Continuity.
- Concurrency-safe Credit Accounting & Reservation Locks.
- Dual-mode Billing Gateways (`TEST=YES` vs `TEST=NO`).
- Safe Iframe Sandbox Isolation & SSRF Filtering.
- End-to-End Website Creation & Export Workflows.

## 2. Test Suites & Execution Commands

### Unit & Integration Testing
```bash
# Run all unit tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

### End-to-End (E2E) Browser Testing
```bash
# Run Playwright test suite
npx playwright test

# Run Playwright with UI dashboard
npx playwright test --ui

# Run specific website generation flow
npx playwright test tests/e2e/website-builder.spec.ts
```

## 3. Critical Verification Gates
1. **Billing Concurrency**: Verify that concurrent AI requests cannot drive a user's credit balance negative.
2. **Context Budget Enforcement**: Verify that prompt construction strictly caps total estimated tokens under 4,000 for local Ollama models.
3. **SSRF Protection**: Verify that web research rejects `127.0.0.1`, `localhost`, `169.254.169.254` (cloud metadata), and internal private RFC 1918 subnets.
4. **Iframe Isolation**: Verify that code running in the preview iframe cannot access parent cookies, `localStorage`, or top-level window location.
