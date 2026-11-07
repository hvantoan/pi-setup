# Discovery workflow and reporting contract

## Start and exploration order

1. Read repository instructions, metadata, top-level structure, README, docs navigation, manifests, and existing discovery reports. Identify the revision and any uncommitted changes without modifying them.
2. Find build systems, executable entry points, runtime dependencies, and deployment declarations. Build a shallow map of important modules and responsibilities.
3. Infer a candidate domain model from specs, UI/API vocabulary, tests, schemas, and implemented rules. Separate intended product goals from observed capabilities; code cannot prove business intent.
4. Select 2–3 workflows: the core value path, a high-impact state change, and a distinct asynchronous/integration path where present. Avoid redundant traces. Record why these represent the scope.
5. Follow each vertically through real calls, persistence, and side effects. Inspect tests, operations, and failure behavior at the boundaries encountered.
6. Reconcile implementation with documented architecture. Record contradictions and unknowns, then assess risk and readiness.

Use bounded searches within candidate modules. Exclude generated/vendor/build output unless it is the only evidence for a relevant boundary. Broaden a search when an edge is unresolved. Stop deepening a workflow once entry, important rules, state changes, side effects, failure behavior, and tests have traceable evidence; list remaining gaps.

## Evidence model

For an important claim, record: claim, classification, repository-relative path, symbol or configuration key, optional line range, revision, and what the evidence actually proves. Link evidence close to the claim. Assign compact evidence IDs when several reports reuse the same source; keep the owning entry in its subject report and link to it.

| Classification | Meaning |
|---|---|
| Observed | Direct implementation/configuration/test evidence. Source inspection verifies structure or logic, not successful runtime execution. |
| Documented/intended | README, specification, ADR, or stated design; cross-check implementation separately. |
| Inferred | Plausible interpretation with supporting clues; explain reasoning and how to verify. |
| Unknown | Evidence absent, inaccessible, contradictory, or outside scope. Name the next verification action. |

A test definition shows what is asserted; a passing execution shows what passed in that specific environment. A deployment manifest shows a declared topology, not proof of a running production topology. Record command date, working directory, safe environment, outcome, and sanitized output summary. Do not paste secret-bearing logs.

Every unknown should have an impact, next evidence source/action, and owner role when identifiable. Do not invent an assigned person. State search scope before concluding something was not found; absence in a sample is not proof of global absence.

## Phase 1: business and domain

Use [project-overview.md](../templates/project-overview.md). Establish purpose, business goals, target users/roles, capabilities, use cases, business rules, invariants, entities/relationships, and critical journeys. Link available requirements and mark missing product context. Use concrete actor/action/outcome language.

Build a glossary connecting business terms to code vocabulary and state transitions. Inventory critical workflows with trigger, outcome, importance, likely entry point, and trace selection. Prioritize using product evidence where available; explain inferred priorities. Do not ask the user to restate information already available in the repository.

## Output ownership and format

Discover existing documentation conventions before choosing a destination; default to `docs/discovery/` if there is no owning surface. Reports are scoped snapshots, not automatic replacements for product authority. Read existing files before updating; preserve unrelated content. If writing docs is prohibited by repository policy, return the content in the conversation.

Create these seven major reports, or map each to an existing equivalent and its sections:

| Report | Embedded deliverables |
|---|---|
| `PROJECT_OVERVIEW.md` | Domain glossary, entity relationships, critical workflow inventory, onboarding reading route |
| `ARCHITECTURE.md` | System context, container/module diagrams, dependency map, observed/intended differences |
| `CODEBASE_GUIDE.md` | Key code location index, workflow trace reports, Mermaid sequence diagrams, change-impact examples |
| `DEVELOPMENT_GUIDE.md` | Environment dependency inventory, commands, testing/debugging guidance, operational runbook |
| `TECHNICAL_ASSESSMENT.md` | Quality coverage, detailed findings, prioritized improvement backlog |
| `RISK_REGISTER.md` | Risk register linked to findings, mitigations, and verification gaps |
| `ENGINEERING_READINESS.md` | Readiness evidence, knowledge gaps, suggested first tasks, final project understanding report |

Each major report contains these seven sections, translated consistently if needed:

1. Executive Summary — what a newcomer needs to know and the current confidence.
2. Scope and Methodology — revision, investigated scope, exclusions, and verification methods.
3. Verified Findings — source-backed results, clearly separated from documented intent and inference.
4. Supporting Evidence — precise paths/symbols and sanitized execution evidence.
5. Assumptions and Unknowns — unresolved items and how to resolve them.
6. Risks and Impact — scoped consequences, linking canonical findings/risks.
7. Recommended Next Actions — ordered reading, verification, or engineering actions.

Place specialized content inside these sections. Templates are authoring instructions, not report content to copy unchanged. Replace prompts with actual evidence; use “not applicable” with a reason, or “unknown” with a next step. Check report links relative to the report destination, not the installed skill directory. Split sections into extra files only if size or requested scope justifies it; preserve navigation and the report contract.

## Optimize the handoff for L2

Build a progressive reading route in `PROJECT_OVERVIEW.md`: product/domain → system boundaries → first vertical trace → second contrasting trace → local execution/debugging → risks/readiness. Link directly to relevant sections; give each stop a learning outcome and a short check question.

Define domain vocabulary before using it. Explain each component through its responsibility, callers, dependencies, important state, and failure behavior. Show one concrete request/event's journey with sanitized or schematic inputs, explicitly labeled illustrative if not captured evidence. Distinguish mandatory invariants from conventions. Capture design rationale only if documented; explain observable trade-offs as inference otherwise.

In `ENGINEERING_READINESS.md`, provide answerable exercises and a separate answer key with code references. Ask the learner to explain architecture, trace state and failures, locate a rule, and plan a small change and regression tests. An agent producing an answer key does not demonstrate that a human reader passed the exercises. Offer a teach-back session, but deliver documents even when the reader is unavailable.

## Large monorepos and legacy systems

- Monorepo: map applications/packages, shared libraries, ownership clues, build graph, deploy units, and cross-package contracts. Deep-dive the selected application/domain and its dependencies; label untraced siblings. Report readiness per scope, never extrapolate a sample to the whole repository.
- Legacy: start from actual entry points, scheduler/configuration wiring, schema, and characterization tests. Trace dynamic dispatch, stored procedures, scripts, and implicit coupling when relevant. Treat missing docs or framework age as context, not a defect. Mark rationale unknown instead of retrofitting a modern architecture.
- If the scope exceeds available time/context, prioritize the selected workflows, checkpoint completed evidence, and list uncovered modules. Do not silently drop phases; give each a result or explicit limitation.

## Recovery and resumption

Missing docs: reconstruct behavior from source and tests; keep business intent unverified. Missing dependency/runtime: inspect manifests, wiring, and test definitions; list exact prerequisites and safe commands without claiming execution. Missing service access: stop at the client boundary and describe the contract plus unknown remote behavior. Contradictory evidence: record both sources and scope/version differences; do not silently pick a convenient answer.

Before pausing, record scope/revision, completed phases and traces, unresolved edges, commands already attempted, process cleanup, and the next safe action in the readiness report. Resume from that record; revalidate evidence if source changed. Bound failed setup attempts to diagnosing the concrete error; do not retry unchanged commands or install tools automatically.

## Optional integrations

| Capability, if available | Use | Fallback/limit |
|---|---|---|
| Git and language/symbol tools | Revision, caller/callee and import navigation | File paths, textual searches, explicit uncertainty for dynamic resolution |
| Dependency graph or repository index | Discover candidate boundaries and reverse dependencies | Validate important edges in source; graph output is not independent proof |
| Test runner/debugger | Verify a safe local path and regression coverage | Review definitions; label execution not verified |
| Mermaid renderer | Check diagram syntax and labels | Deliver fenced Mermaid source and mark rendering unverified |
| Connected requirements or telemetry | Resolve product intent or observed runtime behavior within authorized access | Repository evidence plus named knowledge gaps; do not request broad access as a prerequisite |

Do not upload source to external services or expand access merely because a tool is installed. No integration is required to complete a partial, honest discovery report.
