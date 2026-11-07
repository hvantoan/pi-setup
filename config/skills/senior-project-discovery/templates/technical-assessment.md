# Technical Assessment

Use this template for `TECHNICAL_ASSESSMENT.md`. Apply the rating rubric in the quality assessment reference; do not manufacture findings to populate the report.

## 1. Executive Summary

State the strongest observed engineering properties, the most consequential evidence-backed concerns, confidence, and coverage limits. Distinguish confirmed defects, risks, opportunities, and hypotheses.

## 2. Scope and Methodology

Record revision, sampled components/workflows, review methods, safe executed checks, and exclusions. For architecture/coupling, tests, errors, security, integrity/concurrency, performance/queries/cache, resilience/observability, debt, and single points of failure, record inspected/partial/not inspected/not applicable with reason.

## 3. Verified Findings

Repeat this finding record only for supported findings. Keep pending hypotheses explicitly separate from verified conclusions.

### Finding: assign a stable ID and descriptive title

| Field | Required content |
|---|---|
| Finding ID / category | Stable report-local ID; confirmed defect, risk, improvement opportunity, or hypothesis |
| Description | Actual behavior and concrete trigger/preconditions |
| Evidence | Reachable path, observed logic/result, relevant controls/counterevidence, and limits |
| File references | Repository-relative paths and precise symbols/config keys; revision/lines when available |
| Severity | Critical/High/Medium/Low with consequence-based rationale |
| Likelihood | High/Medium/Low/Unknown with exposure/prerequisite evidence |
| Business/technical impact | Affected users, invariant, data, availability, cost, or maintenance consequence |
| Recommendation | Cause-aligned action and measurable validation criterion |
| Confidence | High/Medium/Low and remaining assumptions |
| Verification status | Source-observed, safely reproduced, pending verification, or not reproduced with limits |

### Prioritized improvement backlog

| Priority and rationale | Finding/risk links | Proposed action | Expected outcome/acceptance check | Dependencies | Effort uncertainty/owner role |
|---|---|---|---|---|---|
| Order by impact, likelihood/exposure, controls, and prerequisites | Link canonical records | Verify a hypothesis before prescribing a fix when needed | Concrete observable result | Required evidence or preceding task | Estimate only with a basis; unknown is acceptable |

## 4. Supporting Evidence

Index source, assertion, or sanitized execution evidence reused across findings. Separate source-derived risks from measured runtime behavior. Include counterexamples that constrain a finding's scope.

## 5. Assumptions and Unknowns

List unmeasured performance, inaccessible runtime behavior, unresolved safeguards, and coverage gaps. State the exact investigation needed and the decision it would enable.

## 6. Risks and Impact

Link the risk register and summarize the most important interactions or shared causes. Explain exposure and existing controls; do not count duplicate symptoms as independent risks.

## 7. Recommended Next Actions

Select the highest-value verification and engineering proposals from the backlog. Give expected outcomes and stop conditions. Recommendations do not authorize implementation, load testing, exploit execution, or replacing the stack.
