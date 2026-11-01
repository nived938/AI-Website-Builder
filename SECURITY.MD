# Security Policy

## Supported Versions

Only the latest release branch of VEYRA Studio receives active security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

The VEYRA Studio engineering team takes application, infrastructure, and user data security with the utmost seriousness.

If you believe you have discovered a vulnerability, security flaw, or potential exposure (including prompt injection risks, SSRF vectors, credit balance tampering, sandbox escape, or unauthorized cross-user access), **please do NOT open a public GitHub issue.**

Instead, please report it privately via email:
- **Contact**: `security@veyra.studio`
- **PGP Key**: Available upon request or via keybase/veyra-security
- **Subject**: `[SECURITY VULNERABILITY] - <Component/Vector>`

Please provide:
1. Detailed description of the vulnerability.
2. Step-by-step reproduction guide or proof-of-concept script.
3. Impact assessment (e.g., unauthorized data access, privilege escalation, server compromise).
4. Suggested remediation if available.

### Our Commitment
- We will acknowledge receipt of your vulnerability report within 24 hours.
- We will provide a remediation plan and estimated timeline within 72 hours.
- We will notify you once the fix has been implemented and deployed.
- We request that you maintain responsible disclosure and refrain from publicly discussing or exploiting the issue until a patch has been published.
