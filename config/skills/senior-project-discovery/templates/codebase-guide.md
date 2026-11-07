# Codebase Guide

Use this template for `CODEBASE_GUIDE.md`. Keep the location index selective. Repeat the workflow trace subsection for 2–3 representative workflows, or all workflows if fewer than two exist and explain that limit.

## 1. Executive Summary

Explain how to enter and navigate the code, where the main business rules live, and which traces teach the most. State the traced scope and important unresolved edges.

## 2. Scope and Methodology

Record revision, modules inspected, workflow selection rationale, symbol/search methods, and static versus executed verification. List boundaries where calls could not be followed.

## 3. Verified Findings

### Key Code Location Index

| Concern | Owning path/symbol | Responsibility | Caller/dependency or convention | Evidence/status |
|---|---|---|---|---|
| Entry/bootstrap, config, wiring, routing, identity, rules, data, jobs, tests, shared libraries | Exact location for each relevant concern | What belongs here | Explain an important relationship, not just a folder name | Implementation/test reference |

Explain initialization and config precedence, dependency injection or equivalent wiring, shared conventions, validation, and exception/error translation. Mark architecture stages absent where appropriate.

### Persistence and concurrency

| Entity/state | Schema and migration | Reader/writer | Constraints and transaction boundary | Concurrency/cache behavior | Evidence |
|---|---|---|---|---|---|
| Actual workflow state | Paths and applied-state verification status | Symbols | Identity, invariants, commit/rollback ownership | Lock/version/idempotency/invalidation or unknown | Source/test/configuration |

### Workflow Trace Report: use the actual workflow name

Explain actor/trigger, input, preconditions, outcome, and business invariant. Reference the domain glossary. Describe one concrete path without including sensitive records; label schematic examples as illustrative.

| Step/stage | Caller → callee | Path/symbol | Rule, contract, or state change | Failure/side-effect behavior | Evidence |
|---|---|---|---|---|---|
| Number steps in actual order | Actual participants | Precise source location | What the step ensures | Denial/error, transaction ordering, async completion, retry | Source and relevant assertion |

Account for entry, authentication, validation, logic, access to data, side effects, and response/completion using the actual design. Explain absent stages. Cover at least one material failure and relevant concurrency behavior; mark untraced branches unknown.

Insert a fenced `mermaid` `sequenceDiagram` with actual participants and messages corresponding to numbered steps. Include evidenced branches with `alt`/`opt`. Distinguish enqueue/acceptance from eventual completion.

List existing tests by path/test symbol, the invariant each checks, execution status, and meaningful gaps. Add a source-derived debugging route or link to the development guide.

### Change-impact example

State one bounded hypothetical requirement. Identify the owning rule, affected callers/contracts/storage/events/integrations, and candidate dependencies requiring more inspection. Map relevant regression tests and verification commands. Explain compatibility and failure risks. Propose a plan only; no code changes are authorized by this exercise.

## 4. Supporting Evidence

Index reused evidence IDs and important paths/symbols. Link existing tests and schema/config declarations. Differentiate reviewed assertions from successful test execution.

## 5. Assumptions and Unknowns

Record unresolved dynamic calls, database behavior, remote contracts, implicit conventions, and failure branches. For each explain what understanding is limited and how to verify it.

## 6. Risks and Impact

Link real transaction, side-effect, concurrency, contract, or shared-library concerns to the assessment/register. State which apparently small changes can cross these boundaries and why.

## 7. Recommended Next Actions

Order remaining trace/test verification work. Give the reader a rule-location question and a state/failure-path question; link answers from the readiness report rather than copying the traces.
