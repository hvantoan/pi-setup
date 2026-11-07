---
name: vt-fastendpoint
description: Standalone-first FastEndpoints guidance for endpoint design, startup registration, DTO binding, validators, preprocessors, postprocessors, OpenAPI, files, SSE, RPC, security, testing, versioning, and Native AOT. Use when building or reviewing FastEndpoints services on ASP.NET Core.
license: Complete terms in LICENSE.txt
metadata:
  version: "1.0.0"
---

# VT FastEndpoints

Version-aware FastEndpoints guidance for .NET API work. The outcome is endpoint,
validator, mapper, pipeline, and startup code that compiles and behaves correctly
against the FastEndpoints version the project actually references.

Use when building or reviewing FastEndpoints services, endpoint slices, or their
framework configuration. For general ASP.NET Core work without FastEndpoints,
follow the project's backend conventions instead.

## Detect the FastEndpoints version first

FastEndpoints APIs differ between major versions, and the wrong dialect is a
compile error. Before writing or reviewing code:

1. Read the `FastEndpoints*` `PackageReference` versions in the `.csproj`
   files (or `Directory.Packages.props` for centrally managed versions).
2. Check existing endpoint code for which Send style it uses.
3. Consult [references/version-differences.md](./references/version-differences.md)
   whenever the target is not the current major — the split that matters most is
   `SendXxxAsync()` before v7 versus `Send.XxxAsync()` on v7+.

## Authority

- Treat `dotnet build` and `dotnet test` output, the `PackageReference` versions,
  and the repo's existing code as authoritative. Editor/LSP diagnostics can
  report false `CS0246`-style errors for FastEndpoints types in these
  solutions; a failed build is what proves a problem, not squiggles.
- Official docs at https://fast-endpoints.com/ describe the latest major.
  When the project runs an older major, prefer the version reference below and
  the repo's working code over current docs.

## Known failure modes

These cost real incidents in versioned FastEndpoints codebases; check them
before general review:

- `Send.OkAsync()`/`Send.ResponseAsync()` (v7+) used in a pre-v7 codebase, or
  `SendOkAsync()`/`SendAsync()` (≤ v6, e.g. 5.34) written into a v7+ codebase,
  does not compile.
- `[JsonPropertyName]` only renames JSON-body fields. Route, query, and form
  name mismatches need `[BindFrom]`; `[JsonPropertyName]` on a route- or
  query-bound property is silently ignored by non-JSON binding.
- `[QueryParam]`, `[RouteParam]`, and `[FormField]` each disable the *other
  non-JSON* sources. `[QueryParam]` on a POST body DTO property does not move
  it out of the JSON body; it only pins non-JSON binding to the query string.
- STJ enforces `required` before non-body binding on requests with a JSON body.
  On 8.3, explicit source attributes (`[RouteParam]`, `[QueryParam]`,
  `[FromHeader]`, `[FromClaim]`) clear that STJ check; `[BindFrom]` alone does
  not. Use the source attribute's `IsRequired` for presence validation.
  On 5.34, remove `required` from non-body properties and enforce presence in
  the validator; source attributes there do not clear STJ's check.
- FastEndpoints instantiates validators, mappers, and pre/post processors as
  singletons. Constructor-injecting a scoped service (repository, DbContext)
  resolves it outside the request scope — it fails at first use or stays alive
  permanently. Resolve scoped dependencies inside the rule/mapper method with
  the `Resolve<T>()`/`CreateScope()` helpers exposed on `Validator<T>` and
  `Mapper<,,>` in both eras.
- Two endpoints resolving to the same verb+route crash `UseFastEndpoints()`
  with `InvalidOperationException: Duplicate routes detected!`. Check
  `RoutePrefix`, `Versioning` prefix, and group prefixes when composing routes.
- A Swagger document whose `MaxEndpointVersion` is lower than
  `Versioning.DefaultVersion` (unversioned endpoints inherit the default)
  produces an empty document. `MaxEndpointVersion`/`MinEndpointVersion` are
  also mutually exclusive with `ReleaseVersion`.
- Endpoint assemblies that are not loaded, or are excluded by discovery filters,
  can be missed in modular hosts. Supply the intended
  `EndpointDiscoveryOptions.Assemblies` explicitly, or use the version-matched
  source generator's discovered types.
- `AppFixture<TProgram>` / `WebApplicationFactory<Program>` with top-level
  statements needs `public partial class Program;` at the end of `Program.cs`
  or the test project cannot reference the program type.

## Rule routing

Read only the rules for the workstream in front of you; each rule states its
version notes inline. Every rule follows the section contract in
[rules/_sections.md](./rules/_sections.md).

### Foundation and hosting

`AddFastEndpoints(...)`/`UseFastEndpoints(...)`, discovery, options,
scaffolding, source generation, Native AOT:

- [Startup and registration](./rules/foundation-startup-registration.md)
- [Configuration options](./rules/foundation-configuration-options.md)
- [Source generation and Native AOT](./rules/foundation-source-generation-aot.md)
- [Scaffolding](./rules/foundation-scaffolding.md)
- Map: [foundation map](./references/foundation-map.md)

### Architecture and messaging

Mappers, DI lifetimes, commands, events, job queues:

- [Mapping](./rules/architecture-mapping.md)
- [DI and service resolution](./rules/architecture-di-service-resolution.md)
- [Job queues](./rules/architecture-job-queues.md)
- [Commands and events](./rules/architecture-command-event-bus.md)
- Map: [architecture map](./references/architecture-map.md)

### Request pipeline

DTOs, binding, validation, send helpers, processors:

- [Request DTOs and binding](./rules/contracts-request-dtos-binding.md)
- [Validation and error contracts](./rules/contracts-validation-errors.md)
- [Endpoint conveniences and hooks](./rules/pipeline-endpoint-conveniences.md)
- [Pre and post processors](./rules/pipeline-pre-post-processors.md)
- Map: [request pipeline map](./references/request-pipeline-map.md)

### Transport and documentation

Swagger/OpenAPI, files, streaming, SSE, RPC:

- [Swagger and OpenAPI](./rules/docs-swagger-openapi.md)
- [Files, streaming, and SSE](./rules/transport-files-streaming-sse.md)
- [RPC and HTTP patterns](./rules/transport-rpc-http-patterns.md)
- Map: [transport and docs map](./references/transport-docs-map.md)

### Runtime and security

Auth, throttling, caching, idempotency, exceptions:

- [Authentication and authorization](./rules/security-authn-authz.md)
- [Caching and rate limits](./rules/runtime-caching-rate-limits.md)
- [Idempotency and exceptions](./rules/runtime-idempotency-exceptions.md)
- Map: [security and runtime map](./references/security-runtime-map.md)

### Testing and versioning

Integration/unit tests, release groups, API versioning:

- [Testing](./rules/testing-fastendpoints.md)
- [Versioning and release groups](./rules/versioning-release-groups.md)
- Maps: [testing and versioning map](./references/testing-versioning-map.md),
  [cookbook index](./references/cookbook-index.md)

## Done when

- New or changed endpoint code uses the Send dialect, binding attributes, and
  package names of the FastEndpoints version in the project's `.csproj`.
- `dotnet build` succeeds on the touched projects. Exercise endpoint behavior
  through existing integration tests, or real HTTP requests when no suite exists;
  compilation alone does not prove binding, validation, or authentication.
- For startup/config changes: the app boots (duplicate routes, discovery, and
  versioning errors surface at `UseFastEndpoints()`/Swagger setup, not first
  request).
- For Swagger changes: the generated document actually contains the endpoints
  (check `MaxEndpointVersion` vs `Versioning.DefaultVersion`).
