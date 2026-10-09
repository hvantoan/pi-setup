## Web fetching

- Use `web_fetch` first for any URL. It impersonates a desktop browser TLS fingerprint and returns extracted readable content, which is what gets past bot-defended pages.
- Fall back to `fetch_content` when `web_fetch` fails or returns thin or empty content, or when a page needs JavaScript rendering. Content fetched with `fetch_content` is stored for later `get_search_content` lookups.
- Use `batch_web_fetch` when one run needs several URLs; keep its `verbose` flag off.

## Planning before editing

- Anything beyond a one-file change: write the plan to `PLAN.md` in the working folder first, and update it as steps complete. The file is the plan, not the transcript.
- Gather context in its own session, write the findings to a file, then implement in a fresh session that reads that file — do not gather context in the middle of implementing.
- Decisions that must outlive the session belong in the repository (plan file, `AGENTS.md`), not only in conversation.
