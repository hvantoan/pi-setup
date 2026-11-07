# Measurable engineering readiness gates

Apply levels cumulatively **within an explicitly named scope**, not to an entire repository by association. Record each gate as demonstrated, partial, or not assessed with a concrete artifact/response and evidence. All required gates for a level must be demonstrated; do not average scores.

Assess agent evidence and human learner responses separately. Report generation proves neither human comprehension nor engineering ownership. If a human has not attempted the exercises, state “L2 learning material delivered; learner readiness not assessed.” Use [engineering-readiness.md](../templates/engineering-readiness.md) for results.

## Level 1 — KNOW

The learner can identify what exists and where it is located.

- [ ] State the product purpose, main actors, and selected business capability, identifying unverified intent.
- [ ] Identify major applications/modules, executable entry points, state stores, and external dependencies in scope with correct source locations.
- [ ] Locate the entry, owning business rule, data access/schema, and related tests for at least one important workflow.
- [ ] Find supported setup/build/test/run instructions and distinguish inspected from successfully executed commands.

Acceptance: every listed item has a correct explanation or lookup plus evidence. Missing a central entry point, state owner, or business rule prevents an L1 pass for that scope.

## Level 2 — UNDERSTAND (default target)

The learner can explain how major components/workflows function and why design decisions exist where rationale is evidenced.

- [ ] Satisfy L1 and explain at least two important domain invariants, their enforcement locations, and user-visible consequences.
- [ ] Explain the scoped context/container/dependency diagrams: responsibilities, actual runtime boundaries, communication, trust, and state ownership. Distinguish intended architecture from implementation.
- [ ] Explain 2–3 selected workflows end-to-end, including inputs, identity/validation where applicable, rules, state transitions, transaction/side-effect ordering, completion, and at least one material failure each. If fewer than two exist, inventory evidence must justify tracing all instead.
- [ ] For one bounded hypothetical change, locate the owning symbol, trace relevant callers/dependencies, predict affected contracts/state/integrations, and identify relevant regression tests or genuine test gaps.
- [ ] Explain dependency prerequisites, config selection, safe run/test commands, and a debugging route using entry/log/state evidence. Explicitly distinguish source-derived knowledge from performed runtime verification; unavailable runtime does not by itself prevent conceptual L2.
- [ ] Explain at least two material risks or unresolved knowledge gaps, their impact, supporting evidence, and next verification actions. Do not invent risks to reach a count; absence of findings must include assessment coverage and limits.
- [ ] Explain major documented design rationales with references; identify unknown historical rationale and separate inferred trade-offs.

Acceptance: all gates demonstrated without unresolved contradictions on critical paths. A code-location lookup alone is insufficient: explanations must connect cause, state, boundaries, and outcome. Use project-specific exercises and an evidence-backed answer key. For a human, evaluate actual teach-back responses; an unattempted exercise remains not assessed.

## Level 3 — OWN

The learner can safely take engineering responsibility for a defined scope.

- [ ] Satisfy L2 and produce a bounded change plan with impact analysis, compatibility risks, regression cases, validation, and rollback/recovery limits.
- [ ] Actually run the relevant application/workflow and focused checks in a safe, authorized environment; use observed signals to diagnose a real or controlled failure without risking production data.
- [ ] Complete an explicitly authorized, low-risk task in that scope with a review of the change, successful relevant checks, and evidence that critical invariants/contracts remain intact. Record review method, findings, and resolution. Existing reviewed engineering work may supply evidence if its scope and applicability are verified.
- [ ] Explain operational dependencies, failure/diagnostic/escalation routes, and remaining risks sufficiently to support the defined change. Distinguish documented recovery plans from exercised procedures.

Acceptance: concrete reviewed engineering and runtime evidence are required; documentation, an impact plan, test definitions, or confidence alone cannot establish L3. Source/environment access restrictions may leave L3 unassessed. Without implementation authorization, stop at a proposed task/plan and do not edit source or create a PR.

## Reporting incomplete readiness

Name the highest fully demonstrated level, then list partial higher-level criteria and what would verify them. If L1 itself is incomplete, say so. A scoped L2 result must not be presented as whole-project ownership. Keep unknowns explicit and distinguish incomplete discovery from an unassessed human learner.
