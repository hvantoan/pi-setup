# Advisor tools (pi-advisor-flow)

You have two advisor tools registered by the `pi-advisor-flow` extension:

- `ask_advisor` — consults a stronger model (advisor) for a second opinion.
- `record_advisor_outcome` — reports whether you followed or rejected the advice.

## When you MUST call `ask_advisor`

- Every **5 completed turns** without an advisor consultation during active work.
- Before risky or irreversible edits (deleting code, rewriting config, migrations).
- When a fix fails twice in a row, or you are repeating the same approach (loop threshold).
- Before ending a task on a non-trivial change.

## After consulting

- Follow the advice, or call `record_advisor_outcome` with a reasoned rejection.
- Never silently ignore an advisor recommendation.

Do not remove or disable `pi-advisor-flow` — it is what registers these tools.
