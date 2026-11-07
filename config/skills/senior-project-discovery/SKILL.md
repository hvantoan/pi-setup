---
name: senior-project-discovery
description: Discover an unfamiliar software project and create evidence-backed onboarding documentation that helps a newcomer reach Level 2 (UNDERSTAND). Use for project onboarding, architecture and workflow discovery, or scoped engineering readiness assessment.
---

# Senior Project Discovery

Produce a navigable explanation of how a project works, where changes belong, and what must be verified before contributing. The default target is **L2 — UNDERSTAND**, especially for a human newcomer. Reading every file is not the goal.

## Inputs and scope

Accept a repository path, optional application/domain scope, audience, report language, existing documentation location, important workflows, and target readiness level. Infer missing inputs from repository instructions and manifests; default to the current repository, a newcomer audience, the user's language, and L2. Preserve source identifiers in their original language.

Before writing, state the scope, intended outcome, constraints, and acceptance criteria. Inspect repository instructions and existing docs first. Ask only about material decisions the repository cannot resolve. In a large repository, map the whole at shallow depth and name the bounded scope to investigate deeply.

Invocation examples:

- “Use senior-project-discovery to create Vietnamese onboarding docs so a new developer can understand the billing application at L2.”
- “Discover this legacy service's architecture and critical workflows; runtime access is unavailable.”

## Boundaries

- Default discovery reads source and writes only agreed discovery documents. Do not edit application source, tests, configuration, lockfiles, or infrastructure; do not create a PR. Document generation does not authorize implementation.
- Do not deploy, change production resources, run destructive migrations, or alter infrastructure without explicit authorization for the actual action. Never expose secrets or personal records. Inspect configuration names and schemas rather than secret values.
- Review scripts and environment targets before executing them. A command named `test`, `build`, or `start` may write data or call live services. Follow the execution guidance in [operational-analysis.md](references/operational-analysis.md).
- Do not invent behavior, deployment boundaries, design rationale, or defects. Distinguish **observed**, **documented/intended**, **inferred**, and **unknown** claims. Documentation alone does not verify implementation.
- Attach repository-relative paths and symbols to important conclusions; include line numbers and revision when available. Identify missing evidence and the next safe verification step.
- Keep discovery incremental. Missing tools, dependencies, or runtime access reduce verified scope, not the obligation to report useful partial findings. Do not automatically refactor or recommend replacing technology.

## Workflow and resource routing

Read [discovery-workflow.md](references/discovery-workflow.md) to establish evidence conventions, output ownership, and the L2 reading path. Then load only the resource for the active phase.

| Phase | Investigation and owning output | Resource |
|---|---|---|
| 1. Business & domain | Purpose, actors, capabilities, rules, entities, journeys, requirements; `PROJECT_OVERVIEW.md` owns glossary and workflow inventory. | [Project overview template](templates/project-overview.md) |
| 2. Architecture | Actual boundaries, stack, communications, identity, integrations, infrastructure, decisions; `ARCHITECTURE.md` owns context, container/module, and dependency diagrams. | [Architecture analysis](references/architecture-analysis.md), [template](templates/architecture.md) |
| 3. Codebase & data flow | Startup, configuration, handlers, logic, persistence, transactions, jobs, conventions; `CODEBASE_GUIDE.md` owns 2–3 vertical workflow trace reports, sequence diagrams, and code index. | [Codebase analysis](references/codebase-analysis.md), [template](templates/codebase-guide.md) |
| 4. Runtime & operations | Setup, commands, tests, pipelines, deployment, migrations, telemetry, incidents, rollback; `DEVELOPMENT_GUIDE.md` owns runbook and environment dependency inventory. | [Operational analysis](references/operational-analysis.md), [template](templates/development-guide.md) |
| 5. Quality & risk | Evidence-backed quality assessment; `TECHNICAL_ASSESSMENT.md` owns findings and improvement backlog; `RISK_REGISTER.md` owns risk prioritization. | [Quality assessment](references/quality-assessment.md), [assessment template](templates/technical-assessment.md), [risk template](templates/risk-register.md) |
| 6. Readiness | Validate explanation, navigation, workflow tracing, runtime/debug knowledge, dependencies, impact, regression tests, and risks. `ENGINEERING_READINESS.md` owns gaps, first tasks, and final understanding report. | [Readiness checklist](checklists/readiness-checklist.md), [template](templates/engineering-readiness.md) |

Run the six phases in order initially; revisit earlier claims when later evidence contradicts them. Select workflows by business criticality and architectural coverage, not by which files are easiest to read. If fewer than two workflows exist, trace all and record why.

Use [discovery-checklist.md](checklists/discovery-checklist.md) at phase transitions and before handoff. Fill the templates with findings; remove instructional prompts from generated reports. Use the seven report sections defined in the workflow reference, including for any separately requested major report.

## Tools and portability

Use available file listing, bounded text search, and targeted reads as the baseline. Prefer `rg` or native symbol navigation when available; fall back to the host's file/search tools. Follow calls, imports, schemas, and tests across boundaries rather than indiscriminately loading directories.

Git metadata, language servers, dependency graphs, test runners, Mermaid renderers, browser tools, connected specs, and live telemetry are optional enhancements. Record unavailable capabilities; never require a specific MCP server, shell, provider, or another skill. See [optional integrations](references/discovery-workflow.md#optional-integrations).

Use standard Markdown, YAML frontmatter, relative resource links, and fenced Mermaid source. Agents supporting the Agent Skills convention can load this directory; invocation and installation depend on the host. Do not promise identical host support or change host configuration.

## Completion

Deliver the seven reports or update their existing owning equivalents, with an explicit output mapping. Include a reading route, 2–3 evidenced workflow traces, verified code locations, command verification status, findings, open gaps, and scoped readiness results. Link sections instead of duplicating glossary, runbook, backlog, or final report into extra files.

The readiness checklist defines measurable L1/L2/L3 gates. Report **demonstrated**, **partial**, or **not assessed** for each criterion and distinguish the agent's evidence from a human reader's demonstrated understanding. Never claim L2 for an untested reader, or L3 merely because reports were generated. Without implementation authorization, finish with proposed first tasks and an implementation plan only.

If essential evidence is unavailable, finish as **partial discovery** with the blocked scope, impact, and next verification actions. Do not invent a passing readiness level to satisfy completion.
