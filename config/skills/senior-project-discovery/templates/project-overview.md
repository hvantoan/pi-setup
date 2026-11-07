# Project Overview

Use this template to author `PROJECT_OVERVIEW.md`. Replace prompts with project-specific findings and evidence; do not leave example rows as claims. Link to existing authoritative specs rather than reproducing them.

## 1. Executive Summary

Explain who uses the product, the problem it solves, the central business outcome, and the domain/application covered. State which business goals are documented and which remain inferred. Name the intended L2 reader and the most important workflow to learn first.

## 2. Scope and Methodology

Record repository/revision, date, applications/domains inspected, sources read, exclusions, and whether findings came from source inspection, tests, or execution. List available product requirements/specifications and their scope/version; record missing business context.

## 3. Verified Findings

### Actors, capabilities, and business rules

| Actor/role | Capability/use case | Desired outcome | Enforced rule/invariant | Evidence |
|---|---|---|---|---|
| Populate from actual actor and code/spec vocabulary | Describe a concrete action | Explain business value | Cite the state/permission constraint and its enforcement site | Path and symbol; label intended versus implemented |

### Domain glossary and entity relationships

| Business term | Meaning for a newcomer | Code/schema term and location | Relationships/lifecycle | Evidence/status |
|---|---|---|---|---|
| Use product vocabulary | Explain without assuming domain knowledge | Exact identifier | Identity, ownership, state transition, or cardinality | Source or explicitly unverified intent |

Explain the relationships that govern critical workflows. Do not assume a table equals a domain aggregate.

### Critical business workflow inventory

| Workflow | Actor/trigger | Preconditions and outcome | Business importance | Entry point | Selected trace and reason |
|---|---|---|---|---|---|
| Name an actual user journey/job | Initiating action/event | Include the important state change | Cite requirement or label inferred priority | Path/symbol or unknown | Link to CODEBASE_GUIDE section, or explain exclusion |

## 4. Supporting Evidence

Index the source paths/symbols for business rules, entities, and entry points. Distinguish specification evidence for intent from implementation evidence for behavior. Include revision/line references where available; keep sensitive sample data out.

## 5. Assumptions and Unknowns

List unclear product goals, terms with conflicting meanings, undocumented rules, and inaccessible requirements. For each give its effect on understanding and the next source/action that would resolve it.

## 6. Risks and Impact

Identify misunderstandings likely to lead a newcomer to change the wrong rule or scope. Link technical findings and risks to their canonical reports. Keep unverified business assumptions visibly separate from defects.

## 7. Recommended Next Actions

### L2 reading route

Populate each stop with a direct report-section link, a learning outcome, and a short question answerable from that section:

1. Product, actors, vocabulary, and invariants in this report.
2. Runtime/module boundaries and dependency ownership in `ARCHITECTURE.md`.
3. The main value path in `CODEBASE_GUIDE.md`.
4. A contrasting write/asynchronous/integration path in `CODEBASE_GUIDE.md`.
5. Setup, debugging, and failure signals in `DEVELOPMENT_GUIDE.md`.
6. Major risks and teach-back exercises in the assessment/readiness reports.

Give a suggested reading effort only as an estimate. Finish with the highest-value product questions to resolve, not a generic onboarding checklist.
