# Project Governance: VEYRA Studio

## 1. Overview
VEYRA Studio is governed by a meritocratic structure comprising Core Maintainers, Technical Committee Leads, and Community Contributors.

## 2. Roles & Responsibilities

### Contributors
Anyone who submits issues, feature discussions, documentation, or code pull requests.

### Core Maintainers
Trusted engineers responsible for code review, architecture adherence, security triage, and package releases. Maintainers have write and merge permissions to the primary repository.

### Technical Steering Committee (TSC)
The TSC guides long-term strategic decisions, including major architectural shifts (e.g., database schema evolutions, AI context management protocols, external payment provider integrations).

## 3. Decision-Making & Voting Process

1. **Lazy Consensus**: Routine modifications, bug fixes, performance tuning, and documentation enhancements proceed via lazy consensus—if a PR receives approval from at least one Core Maintainer and no objections within 48 hours, it may be merged.
2. **Substantial Technical Changes (RFCs)**: Architectural redesigns, changes to the credit ledger schema, or modifications to security boundaries require a formal RFC.
3. **Voting Quorum**:
   - For RFC approval: Simple majority (>50%) of active TSC members.
   - For security policy modifications or maintainer appointments: Two-thirds (66%) supermajority.
   - In case of a tie: The Project Lead casts the deciding vote.

## 4. Conflict Resolution
In the event of an impasse, discussions are escalated to the TSC. Decisions are documented transparently in repository discussions.
