# Architecture

Use this template for `ARCHITECTURE.md`. Create diagrams from repository evidence; replace all authoring instructions in the final report.

## 1. Executive Summary

Explain the actual architecture style, runtime/deployment boundaries, state ownership, and main interaction model. State confidence and the most consequential difference between implementation and documented intent, if one exists.

## 2. Scope and Methodology

Record revision, application/domain scope, configuration/manifests and representative call sites inspected, and runtime visibility. Name uninspected modules and external systems whose internals cannot be verified.

## 3. Verified Findings

### Components and technology

| Component/unit | Responsibility | Runtime/deployment status | Technology/version source | Entry point | Evidence |
|---|---|---|---|---|---|
| Actual module/application | What it owns | In-process, runnable, declared deployment, observed runtime, or unknown | Manifest/lock/runtime distinction | Path/symbol | Evidence ID or direct reference |

### System Context Diagram

Insert a fenced `mermaid` flowchart with actual actors, scoped system, external systems, labeled interactions, and trust boundaries. Link nodes/edges to evidence in section 4. Label inferred or documented-only edges explicitly.

### Container/Module Diagram

Insert a fenced `mermaid` flowchart grouping internal modules inside their runtime owner. Distinguish independently deployed units from folders and packages; a monolith can have one runtime with several modules.

### Dependency Map

Insert a fenced `mermaid` dependency graph showing relevant imports/calls, data access, producers/consumers, shared libraries, and external integrations. Accompany it with:

| From → to | Purpose/contract | Protocol or in-process call | State owner | Failure behavior | Evidence/status |
|---|---|---|---|---|---|
| Observed dependency edge | Operation/schema/event | Actual transport | Database/cache/queue owner if applicable | Timeout/retry/propagation or unknown | Caller and receiver/configuration references |

### Identity and decisions

Explain authentication, authorization, resource/tenant boundaries, and important integration access paths. Include database/cache/queue/event roles. Map each to enforcement/configuration evidence.

| Decision or documented intention | Rationale source | Implementation observation | Trade-off | Agreement/gap |
|---|---|---|---|---|
| Actual ADR/design choice or clearly labeled inference | Exact document section or unknown | Code/config path | Observable consequence; historical reason only if evidenced | Match, mismatch, or unresolved |

## 4. Supporting Evidence

Map diagram nodes/edges and important conclusions to paths, symbols, keys, and revision. Include direct caller/receiver evidence for critical boundaries. Deployment declarations and live topology evidence must have different labels.

## 5. Assumptions and Unknowns

List uncertain topology, undocumented rationale, dynamic dependencies, conflicting designs, and inaccessible integrations. Give an impact and a safe verification action for each.

## 6. Risks and Impact

Explain which boundaries and contracts a newcomer must preserve. Link specific coupling, trust, resilience, or deployment risks to the assessment/register; do not infer defects merely from architecture style.

## 7. Recommended Next Actions

Link to the first two vertical traces and explain what architecture questions each resolves. Identify remaining boundary verification work and one question testing the reader's understanding of module versus deployment boundaries.
