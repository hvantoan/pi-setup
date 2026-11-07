# Runtime and operations discovery

## Inspect before executing

Read setup docs, tool version declarations, package/build scripts, task runners, environment examples, container/compose files, CI workflows, deployment manifests, migration entry points, and telemetry configuration. Configuration inspection should record variable names, purpose, required/optional status, and approved credential source names, never secret values.

Classify commands as **inspected only**, **executed successfully**, **failed**, or **blocked/not attempted**. Record working directory, prerequisites, target environment, side effects, and evidence. Inspect hooks and indirect scripts before execution. A local command can still connect to production or run migrations.

Only execute bounded checks when the target is confirmed disposable/local and the effects fit the user's authorization and repository rules. Do not run installs, lifecycle hooks, builds, tests, services, migrations, or networked checks merely to improve report completeness. For a command needing additional authorization, document it as not attempted and continue independent discovery. Avoid secret output and exporting source/data to external systems.

## Development and environment inventory

Identify required runtimes/toolchains and version sources, install/build/start/debug commands, environment selection and config precedence, port usage, databases, caches, queues, emulators, seed/fixture needs, and integration endpoints by safe category. Verify examples against scripts rather than copying stale docs.

For each dependency record purpose, local substitute if supported, configuration key names, startup/readiness check, access requirement, and verification status. Do not invent mocks, seeds, credentials, or supported substitutes.

Before starting a long-running process, inspect existing owners on the declared port and reuse an appropriate existing instance. Track command, PID/session, port, and repository/worktree for anything started. Stop owned processes when checks finish; do not kill another session's process or silently select a new port. If ownership is unclear, report the blocker.

## Testing and debugging

Map unit, integration, contract, end-to-end, static, and performance checks that actually exist. For critical workflow tests, identify the assertions, fixtures/dependencies, isolation, and safe invocation. Test presence or line coverage alone does not prove effective business-rule coverage.

Document one debugging route per selected workflow: entry breakpoint or log, correlation identifier if present, state/query inspection route, and expected failure signal. Distinguish a source-derived debugging plan from a debugging session actually performed. If execution fails, report the exact sanitized failure and missing prerequisite; do not change configuration or dependencies to make discovery pass.

## Delivery and operational runbook

Trace CI trigger → checks → artifact → environment/deployment → health verification using actual configuration. Include manual approval gates if present. Explain migration ownership/order, backward compatibility constraints, backups, rollback/roll-forward, and data recovery only to the extent evidence supports them. Never imply that reversing a binary safely reverses data changes.

Capture logs, metrics, tracing, alerts, health checks, incident triage, dependency outages, failed jobs, and recovery paths. A useful runbook entry has symptom, safe diagnostic, expected observation, escalation/owner role if known, authorized recovery procedure reference, and verification. Separate read-only diagnostics from mutating procedures and mark unverified recovery steps.

Use [development-guide.md](../templates/development-guide.md). Missing rollback or telemetry evidence is a gap to investigate; assess risk with its actual operational consequence rather than asserting a defect.
