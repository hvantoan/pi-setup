# Discovery completion checklist

Use at phase transitions and before handoff. An unchecked item must have a named limitation and next action; it must not silently become a verified claim.

## Scope and evidence

- [ ] Repository instructions, revision, intended audience/language, scope, exclusions, and target L2 recorded.
- [ ] Existing docs inspected; seven outputs mapped to owning files/sections with no duplicate glossary/runbook/backlog.
- [ ] Important conclusions cite actual paths/symbols and distinguish observed, documented/intended, inferred, and unknown.
- [ ] Static source, test definitions, executed tests, declared deployment, and observed runtime are distinguished.
- [ ] Search/sampling limits and contradictions recorded; no global claims based on a small sample.

## Phase 1 — Business and domain

- [ ] Purpose/goals, actors/roles, capabilities/use cases, rules/invariants, entities/relationships, and requirements covered.
- [ ] Glossary connects business terms to code/schema terms and lifecycle.
- [ ] Critical workflow inventory includes triggers, outcomes, importance, and trace selection rationale.

## Phase 2 — Architecture

- [ ] Actual style, component responsibilities, stack, communication, identity/authorization, and integrations mapped.
- [ ] Database/cache/queue/event roles and state owners mapped where present.
- [ ] Decisions/trade-offs distinguish documented rationale from inference and implementation mismatch.
- [ ] Mermaid source exists for system context, container/module diagram, and dependency map; edges have evidence.
- [ ] Internal modules are not shown as deployed services without deployment evidence.

## Phase 3 — Codebase and data flow

- [ ] Entry/init/config/wiring/dispatch, business logic, persistence/schema/migrations, shared conventions mapped.
- [ ] Transactions/concurrency, validation/errors, and background/event processing covered where present.
- [ ] 2–3 justified vertical traces include actual stages, state, side effects, response/completion, and material failure paths; fewer workflows justified by inventory.
- [ ] Sequence diagrams match trace steps, caller/callee evidence, and async boundaries.
- [ ] Key code index and bounded change-impact/regression-test example are actionable.

## Phase 4 — Runtime and operations

- [ ] Setup/toolchains/configuration, environment dependency inventory, commands, and safe target documented without secrets.
- [ ] Commands have prerequisites, working directory, side effects, verification status, and sanitized outcomes.
- [ ] Test strategy, debugging routes, CI/CD/artifacts/deploy/migrations, telemetry/incidents/recovery/rollback covered or explicitly unknown.
- [ ] Runbook separates diagnostics from authorized mutating procedures; no discovery action deployed or changed infrastructure/data.
- [ ] Owned processes tracked and cleaned up; unavailable environments do not cause invented runtime claims.

## Phase 5 — Quality and risk

- [ ] Architecture/maintainability/testing/errors/security/integrity/concurrency/performance/query/cache/resilience/observability/debt/single-failure-point coverage recorded.
- [ ] Findings include ID, description, evidence, file references, severity, likelihood, impact, recommendation, confidence, and verification status.
- [ ] Defect claims have sufficient evidence, controls/counterevidence considered, and recommendations fit actual causes.
- [ ] Risk register and prioritized backlog link canonical findings and concrete acceptance checks; no invented assignees or acceptance decisions.

## Phase 6 — Readiness and handoff

- [ ] Readiness checklist applied per scope; agent and human results distinguished.
- [ ] L2 reading route, project-specific exercises, and separate evidence-backed answer key delivered.
- [ ] Architecture explanation, rule navigation, traces, runtime/debugging knowledge, dependency/impact/test reasoning, and risks assessed with limits.
- [ ] Knowledge gaps, suggested first tasks, and final project understanding report present.
- [ ] Without explicit implementation authorization, no source changes or PR; only proposed implementation plan.

## Report/package checks

- [ ] Every major report contains the seven required sections with substantive findings or explicit limitations.
- [ ] Links resolve from output locations; path/symbol references and diagram edges checked against the inspected revision.
- [ ] Instructional template text removed from final reports; no fabricated sample data or empty placeholders presented as findings.
- [ ] Completion is “partial discovery” when essential evidence remains unavailable; no unsupported readiness claim.
