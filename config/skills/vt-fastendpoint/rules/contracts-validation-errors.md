# FastEndpoints validation and error contracts

## Purpose

Define the default FastEndpoints validation path so request-shape failures,
application-rule failures, and error responses stay consistent across endpoints.

## Default guidance

- Use `Validator<TRequest>` with FluentValidation as the default request
  validation mechanism. FastEndpoints auto-discovers and registers these
  validators, so endpoint code should assume they are part of the request
  pipeline by convention.
- Keep validators stateless. FastEndpoints creates one validator instance per
  endpoint (singleton) and reuses it across requests. A scoped service
  constructor-injected into a validator is therefore resolved outside any
  request scope: it either fails at first use (`ObjectDisposedException` /
  scope errors) or keeps a stale instance alive for the app lifetime — the
  same failure class as a captured DbContext. Resolve scoped dependencies per
  execution instead: call `Resolve<T>()`/`TryResolve<T>()` inside the rule or
  `ValidateAsync` (available on `Validator<T>` in both eras), or use
  `CreateScope()` when the dependency must live outside the request scope.
  Never store request state on the validator instance.
- Let the automatic 400 failure response handle invalid request DTOs by default.
  This keeps request-shape validation declarative and prevents handlers from
  re-implementing plumbing that FastEndpoints already provides.
- Use `DontThrowIfValidationFails()` only when the handler must inspect
  `ValidationFailures` and choose a non-default control flow or response.
- For application or business-rule failures discovered during handler execution,
  add failures with `AddError()` and stop processing with `ThrowIfAnyErrors()`
  or `ThrowError()` so the endpoint still returns FastEndpoints validation-style
  error payloads.
- If the solution contains duplicate validators for the same request DTO, or if
  you want the binding between endpoint and validator to be explicit, specify
  the validator in endpoint configuration.
- Use DataAnnotations only as an intentional lightweight alternative. Do not
  assume DataAnnotations and FluentValidation will both run for the same
  endpoint; if both exist, the fluent validator wins.
- Keep validation error property names aligned with the app naming policy unless
  the API contract explicitly requires otherwise. If the error envelope shape
  must change, customize it centrally in FastEndpoints configuration instead of
  hand-crafting per-endpoint error bodies.

## Avoid

- Do not keep mutable per-request state on validators.
- Do not manually register validators with DI when FastEndpoints already
  discovers them automatically.
- Do not constructor-inject scoped services (repositories, DbContext) into a
  validator: the validator instance is a singleton, so the scoped service is
  captured permanently and either throws `ObjectDisposedException` or serves
  stale state to later requests. Resolve it inside the rule with
  `Resolve<T>()`/`CreateScope()` instead.
- Do not continue handler execution after known validation failures unless the
  endpoint intentionally opted into manual failure handling.
- Do not use request validators for side effects or business operations that
  belong in handler or domain logic.
- Do not mix multiple validation strategies on one endpoint and expect both to
  contribute to the final error response.

## Review checklist

- Each endpoint has one clear validation strategy, with FluentValidation as the
  default unless there is a documented reason otherwise.
- Validators are stateless and safe to run as singletons.
- Endpoints that disable automatic validation failures inspect
  `ValidationFailures` intentionally and return a deliberate response.
- Business-rule failures discovered during handling are added with
  `AddError()` / `ThrowIfAnyErrors()` / `ThrowError()` instead of ad hoc error
  payload construction.
- Any custom error response shape is configured centrally rather than duplicated
  across handlers.

## Related files

- [Request DTOs and binding](./contracts-request-dtos-binding.md)
- [Pre/post processors](./pipeline-pre-post-processors.md)
- [Configuration options](./foundation-configuration-options.md)
- [Request pipeline map](../references/request-pipeline-map.md)
- [Version differences](../references/version-differences.md) — validator
  resolution helpers exist on `Validator<T>` in both eras.

## Source anchors

- [FastEndpoints validation](https://fast-endpoints.com/docs/validation)
- [FastEndpoints misc conveniences](https://fast-endpoints.com/docs/misc-conveniences)
