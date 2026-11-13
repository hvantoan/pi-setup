import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

// Error classification mirrors pi-ai utils/retry.js (pi 1.3.0). Kept in-file so the
// extension needs no internal imports. Recheck against upstream when pi updates.
const NON_RETRYABLE_PATTERN = new RegExp(
  [
    "GoUsageLimitError",
    "FreeUsageLimitError",
    "Monthly usage limit reached",
    "available balance",
    "insufficient_quota",
    "out of budget",
    "quota exceeded",
    "billing",
    "subscription_sharing_usage_limit_exceeded",
    "subscription_sharing_workplace_individual_usage_limit_exceeded",
    '"code"\\s*:\\s*"?1308(?![0-9])',
  ].join("|"),
  "i",
);

const RETRYABLE_PATTERN = new RegExp(
  [
    "overloaded",
    "server_busy",
    "servers are currently busy",
    "currently experiencing high demand",
    "model is at capacity",
    "rate.?limit",
    "too many requests",
    "(?<![a-z0-9])(?:429|500|502|503|504|520|524)(?![a-z0-9])",
    "service.?(?:is.?)?(?:temporarily.?)?unavailable",
    "server.?error",
    "internal.?error",
    "provider.?returned.?(?:an.?)?error",
    "exceeded request buffer limit while retrying upstream",
    "unable to forward upstream",
    "upstream.?request.?failed",
    "upstream_stream_read_error",
    "stream was interrupted",
    "http/?2 stream failed",
    "network.?error",
    "connection.?error",
    "connection.?refused",
    "connection.?lost",
    "other side closed",
    "fetch failed",
    "request to \\S+ failed, reason:",
    "getaddrinfo",
    "ENOTFOUND",
    "EAI_AGAIN",
    "upstream.?connect",
    "reset before headers",
    "socket hang up",
    "socket connection was closed",
    "timed? out",
    "timeout",
    "terminated",
    "websocket.?closed",
    "websocket.?error",
    "ended without",
    "stream ended before message_stop",
    "stream ended before a terminal response event",
    "http2 request did not get a response",
    "stream disconnected before completion",
    "cut short after the reply had begun",
    "pending stream has been canceled",
    "retry delay",
    "you can retry your request",
    "try your request again",
    "please retry your request",
    "ResourceExhausted",
    "subscription_sharing_usage_unavailable",
    "subscription_sharing_user_unavailable",
  ].join("|"),
  "i",
);

// Context-overflow wording mirrors pi-ai utils/overflow.js intent: these errors are
// handled by compaction recovery, not by retry.
const OVERFLOW_PATTERN = new RegExp(
  [
    "context.?length",
    "context.?window",
    "too many tokens",
    "maximum.?tokens",
    "prompt is too long",
    "input.?too.?long",
    "exceeds?.?the?.?context",
    "context.?overflow",
  ].join("|"),
  "i",
);

type AssistantErrorInfo = { errorMessage?: string; retryable: boolean; overflow: boolean };

function classify(errorMessage: string | undefined): AssistantErrorInfo {
  if (!errorMessage) return { retryable: false, overflow: false };
  const overflow = OVERFLOW_PATTERN.test(errorMessage);
  const retryable = !NON_RETRYABLE_PATTERN.test(errorMessage) && RETRYABLE_PATTERN.test(errorMessage);
  return { errorMessage, retryable, overflow };
}

const DEFAULTS = { maxRetries: 3, baseDelayMs: 2000, maxDelayMs: 30000 };
const config = { enabled: true, ...DEFAULTS };
let attempt = 0;
let cachedPrompt: string | undefined;

function sleep(ms: number, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(true), ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        resolve(false);
      },
      { once: true },
    );
  });
}

function backoffDelay(retryAttempt: number): number {
  const cap = Math.min(config.maxDelayMs, config.baseDelayMs * 2 ** retryAttempt);
  return Math.floor(Math.random() * (cap + 1));
}

function lastAssistantError(branch: readonly unknown[]): AssistantErrorInfo | undefined {
  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i] as {
      type?: string;
      message?: { role?: string; stopReason?: string; errorMessage?: string };
    };
    const msg = entry?.type === "message" ? entry.message : undefined;
    if (msg?.role !== "assistant") continue;
    if (msg.stopReason !== "error") return undefined;
    return classify(msg.errorMessage);
  }
  return undefined;
}

function lastUserPromptText(ctx: ExtensionCommandContext): string | undefined {
  const branch = ctx.sessionManager.getBranch();
  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i] as { type?: string; message?: { role?: string; content?: unknown } };
    if (entry.type !== "message" || entry.message?.role !== "user") continue;
    const content = entry.message.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      const text = content
        .filter((c): c is { type: "text"; text: string } => c?.type === "text")
        .map((c) => c.text)
        .join("\n")
        .trim();
      if (text) return text;
    }
  }
  return undefined;
}

function statusLine(): string {
  return [
    `llm-retry: ${config.enabled ? "on" : "off"}`,
    `attempts=${config.maxRetries}`,
    `base=${config.baseDelayMs}ms`,
    `cap=${config.maxDelayMs}ms`,
    "backoff=exponential+full-jitter",
  ].join(" | ");
}

const USAGE =
  "Usage: /retry [on|off|status|attempts=<n>|base=<ms>|cap=<ms>] — bare /retry resends the last prompt";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", (event) => {
    if (event.messageType === "user") {
      cachedPrompt = event.prompt;
      attempt = 0;
    }
  });

  pi.on("agent_before_settle", async (event, ctx) => {
    if (event.outcome !== "error") {
      attempt = 0;
      return;
    }
    const last = lastAssistantError(ctx.sessionManager.getBranch());
    if (!last || last.overflow) {
      attempt = 0;
      return;
    }
    if (!last.retryable) {
      attempt = 0;
      ctx.ui.notify(
        `LLM error is not retryable (${(last.errorMessage ?? "unknown").slice(0, 120)}) — not retrying`,
        "warning",
      );
      return;
    }
    if (!config.enabled || attempt >= config.maxRetries) {
      attempt = 0;
      return;
    }
    const delay = backoffDelay(attempt);
    attempt += 1;
    ctx.ui.notify(
      `LLM call failed — retry ${attempt}/${config.maxRetries} in ${(delay / 1000).toFixed(1)}s`,
      "warning",
    );
    if (!(await sleep(delay, ctx.signal)) || ctx.signal?.aborted) return;
    return { continue: true };
  });

  pi.registerCommand("retry", {
    description:
      "Retry last prompt / configure LLM auto-retry. Args: on|off|status|attempts=<n>|base=<ms>|cap=<ms>",
    handler: async (args, ctx) => {
      const arg = (args ?? "").trim().toLowerCase();

      if (arg === "on" || arg === "off") {
        config.enabled = arg === "on";
        ctx.ui.notify(statusLine(), "info");
        return;
      }
      if (arg === "status" || arg === "?") {
        ctx.ui.notify(`${statusLine()}\n${USAGE}`, "info");
        return;
      }

      const kv = arg.match(/^(attempts|base|cap|maxdelay)=(\d+)$/);
      if (kv) {
        const value = Number(kv[2]);
        if (kv[1] === "attempts") config.maxRetries = Math.max(1, Math.min(10, value));
        else if (kv[1] === "base") config.baseDelayMs = Math.max(100, value);
        else config.maxDelayMs = Math.max(config.baseDelayMs, value);
        ctx.ui.notify(statusLine(), "info");
        return;
      }

      if (arg !== "") {
        ctx.ui.notify(USAGE, "error");
        return;
      }

      if (!ctx.isIdle()) {
        ctx.ui.notify("Agent is busy — wait for the current run to finish", "warning");
        return;
      }
      const prompt = cachedPrompt ?? lastUserPromptText(ctx);
      if (!prompt) {
        ctx.ui.notify("No user prompt found to retry", "error");
        return;
      }
      attempt = 0;
      await pi.sendUserMessage(prompt);
    },
  });
}
