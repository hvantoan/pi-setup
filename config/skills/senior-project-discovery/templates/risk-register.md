# Risk Register

Use this template for `RISK_REGISTER.md`. Link detailed findings from the technical assessment instead of duplicating them. An unresolved high-impact knowledge gap can be a risk without being a confirmed defect.

## 1. Executive Summary

State the leading risks for the selected scope, their potential consequences, confidence, and the decisions/verification needed first.

## 2. Scope and Methodology

Record revision, assessed workflows/components/environments, evidence coverage, and the severity/likelihood/confidence rubric used. Explain prioritization without unsupported numeric scoring.

## 3. Verified Findings

### Risk inventory

| Risk ID | Scenario/preconditions | Finding/evidence and file references | Severity | Likelihood | Business/technical impact | Existing controls | Recommendation/mitigation | Confidence | Verification status |
|---|---|---|---|---|---|---|---|---|---|
| Stable risk ID | Cause → event → consequence | Link finding ID and source path/symbol; standalone gaps need their own evidence | Rating and rationale | Rating and rationale or unknown | Specific affected outcome | Verified protections and their limits | Concrete next action and acceptance check | Rating and assumptions | Observed/reproduced/pending/not reproduced with scope |

For each material risk, add disposition (open, mitigated with evidence, accepted by an identified decision, or unresolved), owner role if known, and next verification action/trigger. Do not invent acceptance, assignees, dates, or residual risk reduction.

## 4. Supporting Evidence

Link canonical finding records, file references, sanitized execution evidence, controls, and any explicit acceptance decisions. Include revision and describe evidence limits.

## 5. Assumptions and Unknowns

Identify unknown exposure/frequency, unavailable dependency behavior, uncertain operational controls, and missing decision owners. Name the evidence required to update each affected risk.

## 6. Risks and Impact

Explain combined effects and shared dependencies, including single points of failure where supported. Distinguish inherent consequences from residual consequences after verified controls. Explain any risk that blocks a safe first task.

## 7. Recommended Next Actions

Order mitigation/verification actions and link the improvement backlog. State what observation would close or reclassify each leading risk. Keep deferred business decisions visible for the appropriate owner.
