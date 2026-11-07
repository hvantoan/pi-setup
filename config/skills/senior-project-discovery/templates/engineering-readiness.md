# Engineering Readiness

Use this template for `ENGINEERING_READINESS.md`. Apply the measurable gates in the readiness checklist. A generated answer key is not evidence that a human learner passed.

## 1. Executive Summary

Provide the Final Project Understanding Report: what the system does, how major parts interact, where important changes belong, principal risks, and remaining limits. Link the other six reports rather than repeating them. State target L2, assessed scope, achieved agent level, human learner status, and whether discovery is complete or partial.

## 2. Scope and Methodology

Record revision, assessed domain/applications/workflows, agent and human participants where applicable, static/runtime checks performed, evidence limits, and criteria not attempted. Name excluded modules and unavailable environments.

## 3. Verified Findings

### Readiness results

| Level / criterion | Scope | Demonstration or artifact | Evidence and verification method | Agent result | Human result |
|---|---|---|---|---|---|
| Use each applicable gate from the readiness checklist | Concrete domain/module/workflow | Explanation, lookup, trace, impact plan, safe execution, or reviewed change | Path/symbol/output/observed response | Demonstrated, partial, or not assessed | Demonstrated, partial, or not assessed |

All required criteria must pass for a level; do not average away failed gates. State whether runtime knowledge is source-derived or demonstrated. Without actual human responses, record human L2 as “not assessed”; describe the documents as L2-oriented learning material.

### Teach-back exercises

Create questions tailored to real paths and rules, covering at least:

1. Explain the product outcome and two important domain invariants.
2. Explain runtime/module boundaries and the main external dependencies.
3. Trace two selected workflows, including state changes, side effects, and a material failure each.
4. Locate a business rule and explain its callers and enforcement, using code references.
5. Plan one bounded hypothetical change, predict affected contracts/state/dependencies, and select regression tests.
6. Explain setup/debugging steps and two material risks or unresolved gaps with their verification routes.

Adapt the two-workflow criterion only if the product has fewer workflows and the inventory proves that limit. Invite the learner to answer before reading the answer key; do not require a live session to deliver the reports.

### Evidence-backed answer key

Keep this separate from the exercise list, optionally in a Markdown `details` block. Give expected points, report-section links, and actual path/symbol references. Score explanations for causal accuracy and boundary awareness, not memorized wording. Record each observed response and gaps only when an assessment actually occurs.

## 4. Supporting Evidence

Link report sections, trace steps, code locations, reviewed assertions, command records, and any independently observed learner responses. L3 additionally needs authorized reviewed engineering evidence, successful relevant checks, and the bounded scope; document generation alone cannot provide it.

## 5. Assumptions and Unknowns

### Knowledge Gap List

| Gap | Scope and impact | Current evidence/why unresolved | Next verification action | Owner role if known | Blocks which criterion |
|---|---|---|---|---|---|
| Specific unanswered question | What cannot safely be explained or changed | Source/access/environment limitation | Concrete evidence to obtain | Role or unknown | L1/L2/L3 gate or non-blocking |

Include uncovered modules, incomplete traces, runtime/debugging limitations, and untested human comprehension. Add resumption context here if discovery pauses.

## 6. Risks and Impact

Link leading risks and explain how they restrict first contributions. State why the current evidence supports the achieved level and which missing demonstrations prevent a higher claim.

## 7. Recommended Next Actions

### Suggested First Tasks

| Proposed task | Business/learning outcome | Owning paths and affected boundaries | Preconditions/authorization | Regression and review plan | Completion criterion |
|---|---|---|---|---|---|
| Small, low-risk task grounded in actual evidence | What it teaches or improves | Actual symbols and contracts | Include unresolved evidence and required explicit implementation authorization | Existing tests/checks, expected failure coverage, review route | Observable result |

Without implementation authorization, stop at a concrete proposed implementation plan: scope, files, steps, impact, checks, risks, and rollback approach. Do not edit source or create a PR. If implementation is explicitly authorized, choose a bounded task, validate with relevant checks and review, and update readiness using actual evidence; authorization for implementation does not imply deployment or PR publication.

End with the next reading/teach-back actions and unresolved questions, if any.
