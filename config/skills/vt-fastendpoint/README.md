# vt-fastendpoint

Version-aware FastEndpoints guidance for .NET work: endpoint design, startup
registration, DTO binding, validators, pre/post processors, OpenAPI, files,
SSE, RPC, security, testing, versioning, and Native AOT. The skill is built for
codebases that run different FastEndpoints majors — notably 8.x on modern
targets and 5.x (e.g. 5.34 on net8) on legacy services — where the current
online docs alone give dialect that does not compile on older majors.

## Package structure

| Path | Purpose |
| --- | --- |
| [SKILL.md](./SKILL.md) | Activation router: version detection, failure modes, rule routing, done criteria |
| [rules/](./rules) | 20 decision rules grouped by workstream (see `rules/_sections.md` for the section contract) |
| [references/version-differences.md](./references/version-differences.md) | Concrete API deltas between FastEndpoints 5.x and v7+/v8/9 |
| [references/](./references) | Doc/cookbook maps linking each workstream to official sources |
| [LICENSE.txt](./LICENSE.txt) | License terms |

## What changed in this version (1.0.0)

Rationale for the rewrite, so reviewers can spot-check:

- Added the version-detection step and `references/version-differences.md`
  because the Send dialect changed at v7 (`SendXxxAsync()` → `Send.XxxAsync()`)
  and several binding attributes, versioning options, and package boundaries
  differ between 5.x and v8. Version-specific claims were checked against
  published 5.34.0/8.3.0 package XML and decompiled implementation:
  `ConfigExtensions`/`BinderExtensions` for non-JSON `required` behavior,
  `Endpoint`/`ResponseSender` for send helpers, `EndpointExtensions` for
  duplicate validators, `RequestBinder` for lazy DTO failures, and
  `DocumentProcessor` for Swagger version filtering. Current upstream source
  was used for newer APIs only; it does not establish older-version behavior.
- Added team-incident failure modes: `[JsonPropertyName]` ignored for
  route/query (use `[BindFrom]`), `[QueryParam]` semantics on POST DTOs,
  `required` vs non-body sources, singleton validators capturing scoped
  repositories, duplicate-route startup crash, `MaxEndpointVersion` vs
  `Versioning.DefaultVersion` producing empty Swagger docs, explicit
  `Assemblies` for modular hosts, and `public partial class Program` for
  `WebApplicationFactory`/`AppFixture`.
- Declared `dotnet build`/`dotnet test` and `PackageReference` versions as
  authoritative; editor/LSP diagnostics can produce false `CS0246` errors for
  FastEndpoints types in these solutions.
- Rewrote SKILL.md thin (outcome, authority, routing, done criteria) and
  removed the standalone-marketplace packaging files (`metadata.json`,
  `AGENTS.md`, `templates/`, `assets/`, `rules/_template.md`) whose
  installation/distribution guidance did not apply to how this skill ships.
- Frontmatter `description` is unchanged to preserve activation behavior;
  `metadata.version` added per skill-standard convention.

## Validation

- Consumer instructions are prose; maintainer evaluation scripts live under
  `evals/vt-fastendpoint/` at the repository root — outside the installed
  skill package — with the pre-rewrite baseline committed at
  `evals/vt-fastendpoint/baselines/original-skill`.
- Behavioral evaluation uses FastEndpoints 8.3/net10 and 5.34/net8 fixtures
  plus hidden HTTP tests, comparing original, candidate, and no-skill
  sessions. Evaluation records distinguish tested behavior from unverified
  claims; a passing sample does not establish general superiority.
