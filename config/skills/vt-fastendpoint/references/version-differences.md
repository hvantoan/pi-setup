# FastEndpoints version differences

Concrete API differences between FastEndpoints 5.x (late 5.3x, e.g. 5.34 on
net8) and 7.x/8.x (e.g. 8.3 on net9/net10), plus behaviors that changed at the
v6/v7 split. Verified against the published `FastEndpoints` 5.34.0 and 8.3.0
assemblies and docs XML; use it when the project's `PackageReference` version
differs from the current major the docs describe.

## Sending responses (v6 and earlier vs v7+)

The largest dialect change. v7 moved response-send methods behind a `Send`
property (`ResponseSender<TRequest, TResponse>`, a struct). On v7+, custom
send extensions target `IResponseSender`; that interface is absent in 5.34.

| v5.x / v6.x (e.g. 5.34) | v7+ (e.g. 8.3) |
| --- | --- |
| `SendAsync(response)` | `Send.ResponseAsync(response)` |
| `SendOkAsync(response?)` | `Send.OkAsync(response?)` |
| `SendCreatedAtAsync<T>(routeValues, body)` | `Send.CreatedAtAsync<T>(routeValues, body)` |
| 5.34: `SendAsync(body, 202)` or `SendResultAsync(Results.Accepted(...))` | `Send.AcceptedAtAsync(...)` |
| `SendNoContentAsync()` | `Send.NoContentAsync()` |
| `SendNotFoundAsync()` | `Send.NotFoundAsync()` |
| `SendUnauthorizedAsync()` | `Send.UnauthorizedAsync()` |
| `SendForbiddenAsync()` | `Send.ForbiddenAsync()` |
| `SendErrorsAsync(statusCode?)` | `Send.ErrorsAsync(statusCode?)` |
| `SendStringAsync(...)` | `Send.StringAsync(...)` |
| `SendBytesAsync(...)` | `Send.BytesAsync(...)` |
| `SendFileAsync(...)` | `Send.FileAsync(...)` |
| `SendStreamAsync(...)` | `Send.StreamAsync(...)` |
| `SendResultAsync(IResult)` | `Send.ResultAsync(IResult)` |
| `SendRedirectAsync(...)` | `Send.RedirectAsync(...)` |
| `SendEventStreamAsync(...)` | `Send.EventStreamAsync(...)` |
| `SendInterceptedAsync(...)` | `Send.InterceptedAsync(...)` |
| `SendEmptyJsonObject()` | `Send.EmptyJsonObject()` |
| `SendHeadersAsync(...)` | `Send.HeadersAsync(...)` |
| — | `Send.StatusCodeAsync(code)`, `Send.NotModifiedAsync(...)` (v7+/v8 additions) |

Notes:

- `SendMapped()`/`SendMappedAsync()` on mapper-enabled endpoint base types
  keep the same names in both eras.
- `HandleAsync` implementations that only set `Response` and return
  `Task.CompletedTask` work in both eras (FE auto-sends when no send method ran).
- Send methods return awaitable tasks; return from the handler after sending
  when subsequent code should not execute.

## Endpoint discovery and source generation

| Concern | v5.x (5.34) | v7+/v8 |
| --- | --- | --- |
| Manual discovery config | `AddFastEndpoints(o => { o.Assemblies = …; o.AssemblyFilter = …; o.DisableAutoDiscovery = true; o.Filter = …; })` — `EndpointDiscoveryOptions` | Same options; `AddFastEndpoints()`/`AddFastEndpoints(o => …)` both exist |
| Generator-based discovery | `EndpointDiscoveryOptions.SourceGeneratorDiscoveredTypes` | `AddFastEndpoints(params List<Type>[])` — pass each assembly's generated `DiscoveredTypes.All` (`FastEndpoints.Generator`); the `Assemblies`/`DisableAutoDiscovery` options are inapplicable when the generator provides types |

## Package layout (5.34 vs 8.3)

- 5.34 implements job queues (`IJobStorageProvider`, `JobQueueOptions`,
  `QueueJobAsync`), commands, and events inside the core `FastEndpoints`
  assembly. It already depends on separate `FastEndpoints.Attributes` and
  `FastEndpoints.Messaging.Core` packages.
- In 8.3, queue and command/event implementations live in
  `FastEndpoints.JobQueues` and `FastEndpoints.Messaging`. The `FastEndpoints`
  package references these transitively; add direct package references only
  when the project references individual pieces instead of that package.
  Package boundaries changed without necessarily changing namespaces.
- `FastEndpoints.Swagger` (NSwag) exists in both eras; `SwaggerDocument()` and
  `UseSwaggerGen()` are the registration pair in both.

## Binding attributes

- `[BindFrom]` (both eras): renames the incoming **route param, query param, or
  form field** name relative to the DTO property. It does not rename the JSON
  body field — that stays under STJ's control, so `[JsonPropertyName]` applies
  only to JSON-body binding and is ignored for route/query/form/claim/header.
- `[QueryParam]`, `[RouteParam]`, `[FormField]` (both eras): `DontBindAttribute`
  subclasses that disable the *other non-JSON* sources for a property
  (`[QueryParam]` disables route+form; it does not disable JSON body).
- `DontBindAttribute.IsRequired` / `[QueryParam(IsRequired = true)]` etc.
  exist in 8.3 and are absent in 5.34. They produce a validation-style
  "A value is required!" failure when a non-body source supplies nothing.
  Check the exact package before using these on intermediate versions.
- In 8.3, `[FromCookie]` binds cookies; `[HttpQuery]` declares an endpoint's
  HTTP `QUERY` route (it is not a query-string DTO binding attribute).
- Both eras have `[FromBody]`, `[FromForm]`, `[FromQuery]` (one root complex
  property per DTO), `[FromClaim]`, `[FromHeader]`, `[From]` (claim name),
  `[HasPermission]`, `[BindFrom]`, `[DontBind]`, `[ToHeader]`,
  `[HideFromDocs]`, `[Throttle]`, `[HttpGet]`-style verb attributes.

## `required` DTO members and STJ

- STJ enforces C# `required` members when it deserializes the JSON body.
  FastEndpoints binds route/query/claims/headers/cookies *after* the body step,
  so an unannotated `required` property sourced from a non-body source fails
  during deserialization (surfaced as a bind/400 failure) in both eras.
- In 8.3, FastEndpoints registers an STJ `TypeInfoResolver` modifier that
  clears `required` for properties carrying `NonJsonBindingAttribute`
  (`[RouteParam]`, `[QueryParam]`, `[FormField]`, `[FromHeader]`,
  `[FromClaim]`, `[DontBind]` and friends). `[BindFrom]` alone is not that
  marker and does not clear the check.
- 5.34 has no `NonJsonBindingAttribute` and no corresponding source-attribute
  clearing. Remove `required` on non-body members and validate their presence.
  Do not substitute `[JsonIgnore(Condition = Always)]`: the request binder
  excludes those properties too, preventing route/query binding.
- GET/DELETE endpoints that take no body never run the STJ step, so `required`
  there is harmless — but it still buys nothing.

## Validators, mappers, processors (lifetimes)

Both eras create shared singleton instances of validators, mappers, and pre/post
processors, not one instance per request. Resolve scoped services (DbContext,
repositories) inside the rule/mapper method via `Resolve<T>()`/`TryResolve<T>()`
or an explicit `CreateScope()`; those helpers exist on `Validator<T>` and mapper
base types in both versions. Dispose an explicitly created scope.

## Versioning config

- `Config.Versioning.Prefix`, `.PrependToRoute`, `.DefaultVersion` exist in
  both eras. `Versioning.RouteTemplate` (full control of the version segment
  placement) is v8+.
- Endpoints that never call `Version(n)` get `DefaultVersion` as their
  effective version. A Swagger document's `MaxEndpointVersion` filters on the
  effective version: `MaxEndpointVersion = 0` (unset) plus `DefaultVersion = 1`
  hides every unversioned endpoint.
- `DocumentOptions.MaxEndpointVersion`/`MinEndpointVersion` and
  `ReleaseVersion` are mutually exclusive — combining them throws
  `NotSupportedException` at doc-generation time.
- `DontVersion()` (v9+) keeps an endpoint at version 0 even when
  `DefaultVersion` is set. On 5.x–8.x there is no per-endpoint opt-out: every
  unversioned endpoint inherits `DefaultVersion`, so keep `DefaultVersion` at
  0 on those majors if any route must stay unversioned.

## Startup and first-request failures

- `UseFastEndpoints()` throws `InvalidOperationException: Duplicate routes
  detected!` when two endpoints resolve to the same verb+route (not applicable
  when `Asp.Versioning` mode is on).
- `InvalidOperationException` also fires when an endpoint both overrides
  `Configure()` and carries `[Http*]` attributes, or does neither.
- A request DTO with no public readable/writable properties throws
  `NotSupportedException` when its binder is first resolved (usually the first
  request), unless `AllowEmptyRequestDtos` is set. Boot alone does not check it;
  8.3 can also instantiate binders through endpoint warmup.
- Multiple validators for one DTO throw during startup for `Configure()`-based
  endpoints unless `Validator<TValidator>()` selects one. Attribute-configured
  endpoints can instead end up without validation; avoid ambiguous registrations.

## Testing

- `WebApplicationFactory<TProgram>`/`AppFixture<TProgram>` needs a referenceable
  `Program` type: top-level-statement hosts must end `Program.cs` with
  `public partial class Program;`.
- `FastEndpoints.Testing` exists across majors; check the package version that
  matches the referenced `FastEndpoints` major. Plain
  `WebApplicationFactory`/`Microsoft.AspNetCore.Mvc.Testing` works on any
  version and is the safer default on legacy (5.x) codebases.
