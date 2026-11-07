# Quality and technical risk assessment

## Evidence-led sampling

Use the mapped architecture and vertical traces as the assessment boundary. Evaluate the following and record each as inspected, partially inspected, not applicable with reason, or not inspected:

- Architecture consistency, dependency direction, coupling, maintainability, and shared conventions.
- Testing effectiveness for business invariants, failure paths, integration contracts, and regression detection.
- Validation, error handling, authentication/authorization boundaries, tenant/resource access, and sensitive data handling.
- Data integrity, transactions, concurrency/races, idempotency, migration safety, and cache consistency.
- Performance bottlenecks, query shapes/index alignment, unbounded work, and external-call cost/latency.
- Reliability, retries/timeouts, resilience, observability, single points of failure, and technical debt.

Base findings on actual assets, trust boundaries, input reachability, state, and execution paths. Do not infer a vulnerability from a library name or a missing check in one function without checking upstream/downstream enforcement. A dependency version alone is not proof of exploitable behavior; if advisory checking is available and authorized, cite the advisory, resolved version, and reachability limitations.

For performance, source can reveal unbounded loops or query patterns, but cannot prove production latency without measurements. Treat unmeasured bottlenecks as hypotheses and propose a bounded measurement. Do not run load tests, exploits, or production probes during discovery.

## Finding record

Each finding in `TECHNICAL_ASSESSMENT.md` contains:

- **Finding ID** and description; classify as confirmed defect, risk, improvement opportunity, or hypothesis.
- **Evidence and file references:** path/symbol, reachable scenario, relevant safeguards, test or command status, counterevidence, and scope limits.
- **Severity, likelihood, business/technical impact, and confidence.**
- **Recommendation:** cause-aligned action plus a concrete validation criterion; no automatic refactor or technology replacement.
- **Verification status:** source-observed, reproduced in a safe environment, pending verification, or not reproduced with stated limits.

Use [technical-assessment.md](../templates/technical-assessment.md) for the record and backlog, and [risk-register.md](../templates/risk-register.md) for prioritization. Risk entries link canonical finding details rather than copying them. Unknowns with meaningful consequences can be risk entries without being called defects.

## Rating rubric

| Dimension | Values and interpretation |
|---|---|
| Severity | Critical: broad compromise, catastrophic loss, or critical service unavailable; High: substantial access/integrity/availability or core workflow impact; Medium: bounded failure or operational burden; Low: localized maintainability/usability cost. Explain the specific consequence. |
| Likelihood | High: expected in an ordinary reachable scenario or observed repeatedly; Medium: plausible with identified prerequisites; Low: unusual prerequisites plus effective controls; Unknown: insufficient exposure/frequency evidence. |
| Confidence | High: direct complete path or reproducible evidence; Medium: partial path with explicit unresolved assumptions; Low: hypothesis or limited sampling. |

Severity is potential consequence, not confidence; do not lower severity to conceal uncertainty. Prioritize using impact, exposure/likelihood, existing controls, dependency ordering, and effort. State reasons; avoid fabricated numeric precision or assigning people and deadlines without evidence.

## Final review

Check each finding against its actual execution context and counterexamples. If later evidence disproves it, remove or reclassify it and state the verification source. Do not reverse a verified design choice because of an abstract concern. Present recommendations as proposals; discovery does not authorize their implementation.

The prioritized backlog links finding/risk IDs, proposed action, expected outcome, dependencies, effort uncertainty, and acceptance checks. Include verification tasks before fixes for unconfirmed high-impact hypotheses. It is valid to report no confirmed defects with limited coverage; never manufacture a risk quota.
