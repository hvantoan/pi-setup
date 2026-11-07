# Codebase and data flow discovery

## Navigation map

Find executable entry points and initialization order: configuration sources/precedence, dependency injection or equivalent wiring, routing/dispatch, authentication middleware, handlers, domain/application logic, persistence, background execution, and shared libraries. Include frameworks only where actually used. Map relevant responsibilities to precise paths and symbols; do not print an exhaustive directory tree.

Inspect schema definitions, migrations, constraints, indexes, ORM/query mapping, serialization, and API/event contracts. Describe entity identity and relationships, reads/writes, transaction boundaries, isolation/locking/version checks, and data lifecycle for selected workflows. Database constraints and application validation may protect different invariants; show both. Mark schema declared in code versus applied schema verified at runtime.

Follow validation, error mapping, retries, cancellation, timeouts, idempotency/deduplication, and concurrency control where relevant. For jobs/events, find producer, transport configuration, consumer, acknowledgment, retry and dead-letter handling. Record unknown remote/async behavior rather than assuming delivery semantics.

## Vertical trace procedure

For each of the 2–3 selected business workflows:

1. Name the actor/trigger, desired outcome, prerequisites, business importance, and selection rationale.
2. Start at a real route, command, UI action, exported function, scheduled task, or event subscription. Follow actual symbols to the result.
3. Account for `Entry Point → Authentication → Validation → Business Logic → Data Access → Side Effects → Response`. Adapt order and name stages to the real architecture. Mark absent stages with evidence/reason; do not manufacture layers. Include the client-facing boundary if present.
4. Record state transitions, business invariants, data ownership, external calls/events, and transaction versus side-effect ordering. For an asynchronous path, distinguish request acceptance from eventual completion.
5. Trace at least one material failure/denial path and relevant retry/concurrency behavior. Record tests that assert the important rule, including execution status and gaps.
6. Draw a fenced Mermaid `sequenceDiagram` of actual participants and messages. Use `alt`/`opt` for evidenced branches and annotate unresolved portions as unknown. Connect messages to numbered trace steps and an evidence table.

A trace table should include step, caller → callee, path/symbol, state/contract, and failure behavior. Pair the table with a short narrative explaining why the rule matters to a user. Use [codebase-guide.md](../templates/codebase-guide.md).

## Change impact exercise

Choose a bounded hypothetical requirement grounded in a selected workflow. Do not implement it. Identify the owning rule/symbol, callers, contracts, storage/migrations, events/integrations, configuration, and deployment surfaces it could affect. Separate confirmed dependencies from candidate dependencies needing inspection.

Propose relevant happy-path, denial/validation, failure, and concurrency regression tests only where those behaviors exist. Locate existing test utilities and execution commands. Explain compatibility risks and a safe verification sequence. This exercise demonstrates reasoning about a change; it does not establish operational ownership or authorize edits.
