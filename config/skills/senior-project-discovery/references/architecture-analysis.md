# Architecture discovery

## Find actual boundaries

Read manifests, bootstrap/configuration, executable/service declarations, build packaging, deployment descriptors, and representative imports/calls. Separate repository packages, in-process modules, independently runnable programs, and independently deployed services. A folder named `services` or an internal HTTP abstraction does not establish microservices.

Identify the architecture style from dependency direction and runtime behavior. Allow mixed styles. Record applications, components, responsibilities, entry points, ownership clues, and state. Distinguish technology versions declared by manifests from resolved versions in lockfiles and running versions, if observed.

## Map communication and trust

For each important boundary, inspect callers and receivers, transport, contract/schema, authentication, authorization, error semantics, and sync/async behavior. Follow identity establishment through session/token validation to role, resource ownership, or tenant checks. Distinguish a UI restriction from server enforcement. Record relevant trust boundaries without exposing credentials.

Map external systems and database/cache/queue/event infrastructure. For each dependency capture purpose, access path, state ownership, configuration key names, failure handling, and evidence. A configured dependency is not necessarily used on the selected workflow; confirm its call sites.

## Diagrams

Generate actual fenced `mermaid` source in `ARCHITECTURE.md`:

- **System context:** actors, scoped system, external systems, labeled interactions and trust boundaries.
- **Container/module:** executable or deployable units with in-process modules grouped inside their owner. Label deployment status as observed, declared, or unknown.
- **Dependency map:** directed, labeled imports/calls, data access, and event producer/consumer edges relevant to scope. Include external edges and shared libraries.

Use `flowchart` with simple stable node IDs and quoted readable labels. Annotate edges with protocol/action and evidence IDs; put full paths in an adjacent evidence table. Keep documented intent and inferred edges visually labeled or in separate diagrams. Do not imply unverified edges by drawing them as observed. If there is no evidence for an edge, show an unknown boundary or omit it and record the gap.

For a monolith, a single runtime containing modules is a valid container/module diagram. For a CLI/library/batch system, model actual invocation, API calls, or job scheduling; do not invent a browser/API tier. Mermaid rendering is optional; readable source is required.

## Decisions and reconciliation

Read available ADRs/design docs. For each major decision state the decision, rationale source, observable trade-offs, and whether implementation agrees. Keep inferred trade-offs separate from historical intent. Explain mismatches by version/scope where supported, otherwise record an unknown.

Finish with the boundaries a newcomer must preserve and where to investigate a cross-boundary change. Use [architecture.md](../templates/architecture.md); quality claims belong in the assessment rather than an unsupported architecture rewrite proposal.
