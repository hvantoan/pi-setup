# Development Guide

Use this template for `DEVELOPMENT_GUIDE.md`. Distinguish inspected commands from executed commands, and safe diagnostics from mutating operational procedures.

## 1. Executive Summary

State how a developer builds, runs, tests, and debugs the selected scope; identify critical dependencies and what was actually verified. Highlight missing prerequisites and operational constraints.

## 2. Scope and Methodology

Record revision, OS/toolchain context when relevant, inspected scripts/configuration/pipelines, runtime access, and execution limits. Record that production procedures were inspected rather than executed unless a separately authorized action occurred.

## 3. Verified Findings

### Environment Dependency Inventory

| Dependency/toolchain | Purpose/version source | Required config key names | Approved source/local substitute | Readiness diagnostic | Verification status |
|---|---|---|---|---|---|
| Runtime, DB, cache, queue, external service as applicable | Manifest/config reference | Names only, no values | Existing supported setup or unknown | Inspected safe check | Source-only, executed, failed, or unavailable |

Explain configuration loading/precedence and environment selection. Include only actual setup steps in dependency order; record unsupported or inaccessible prerequisites explicitly.

### Commands and testing

| Purpose | Exact command and working directory | Prerequisites/target | Side effects and safety boundary | Status and evidence |
|---|---|---|---|---|
| Install/build/start/test/debug as actually supported | Source-backed invocation | Local disposable environment or unknown | Include hooks/network/data writes; approval if required | Inspected only, successful, failed, or blocked/not attempted |

Map test types, important assertions, fixtures/isolation, safe focused commands, and existing gaps. Explain how to debug each selected workflow: entry breakpoint/log, correlation/state inspection, expected signal, and evidence. Do not present a plan as an executed debug session.

### Delivery and migrations

Trace CI triggers/checks, artifacts, deployment environments, gates, migration order/ownership, and post-deploy checks. Link actual pipeline/manifests/runbooks. Describe compatibility, backup, rollback/roll-forward, and data recovery constraints; mark unsupported recovery claims unknown.

### Operational Runbook

| Symptom/scenario | Read-only diagnostic and expected observation | Evidence/telemetry location | Recovery procedure reference and required authorization | Verification/escalation |
|---|---|---|---|---|
| Relevant failed request/job, dependency outage, or failed rollout | Safe command/query/log route, with sensitive output excluded | Logging/metrics/tracing/alerts/health source | Documented action; do not execute mutating recovery | What confirms recovery and known owner role or unknown |

Cover the actual observability and incident path, including gaps. Record command, PID/session, port, worktree, and cleanup for any processes started during discovery; write “none started” when appropriate.

## 4. Supporting Evidence

Link setup docs, version declarations, scripts, tests, CI/CD files, migration tooling, telemetry wiring, and recovery instructions. For attempted commands include date, working directory, safe target, result, and sanitized failure/output summary.

## 5. Assumptions and Unknowns

List unverified commands, inaccessible environments, missing dependencies, unapplied schema uncertainty, and missing recovery/owner information. Give specific next actions; do not imply the application ran when it did not.

## 6. Risks and Impact

Link operational risks and explain consequences: unintended environment targeting, irreversible data changes, unavailable dependencies, or insufficient diagnostics. Assess existing controls before labeling a defect.

## 7. Recommended Next Actions

Give the shortest safe sequence for a newcomer to reach a local workflow and observe a failure. Clearly separate ready-to-run diagnostics from steps awaiting authorization, credentials, or dependency setup.
