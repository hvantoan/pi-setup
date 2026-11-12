import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type JsonRecord = Record<string, unknown>;

interface ClassifierResult {
  api: string;
  provider: string;
  model: string;
  answers: JsonRecord;
  usage?: { inputTokens: number; outputTokens: number; cost?: number };
  stopReason: "stop" | "error" | "aborted";
  errorMessage?: string;
  timestamp: number;
}

interface ClassifierModelShape {
  id: string;
  api: string;
  provider: string;
  baseUrl: string;
}

interface ClassifierContextShape {
  state: JsonRecord;
  questions: Record<string, { type: string }>;
}

interface ClassifierOptionsShape {
  apiKey?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const SYSTEM_ONE_API = "typesafe-system-one";

/**
 * TypeSafe System One classification over 9router. Mirrors pi-ai's
 * typesafe-system-one transport: public `bool` questions go on the wire as
 * `noul`, and `noul` answers come back as `bool { probability }`.
 */
const classifySystemOne = async (
  model: ClassifierModelShape,
  context: ClassifierContextShape,
  options?: ClassifierOptionsShape
): Promise<ClassifierResult> => {
  const output: ClassifierResult = {
    api: model.api,
    provider: model.provider,
    model: model.id,
    answers: {},
    stopReason: "stop",
    timestamp: Date.now(),
  };

  try {
    if (!options?.apiKey) throw new Error(`No API key for provider: ${model.provider}`);

    const questions = Object.fromEntries(
      Object.entries(context.questions).map(([id, q]) => [
        id,
        q.type === "bool" ? { ...q, type: "noul" } : q,
      ])
    );

    const url = `${model.baseUrl.replace(/\/+$/u, "")}/systemone`;
    const timeout = options?.timeoutMs !== undefined ? AbortSignal.timeout(options.timeoutMs) : undefined;
    const signal =
      options?.signal && timeout ? AbortSignal.any([options.signal, timeout]) : (options?.signal ?? timeout);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: model.id, questions, state: context.state }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`System One API error: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as { answers?: JsonRecord; usage?: JsonRecord };

    for (const [id, question] of Object.entries(context.questions)) {
      const answer = body.answers?.[id] as JsonRecord | undefined;
      if (!answer || typeof answer !== "object") {
        throw new Error(`System One API did not return an answer for ${id}`);
      }
      if (question.type === "choice") {
        output.answers[id] = {
          type: "choice",
          choice: answer.choice,
          probabilities: answer.probabilities ?? {},
          confidence: answer.confidence ?? 0,
        };
      } else if (question.type === "score") {
        output.answers[id] = { type: "score", score: answer.score, confidence: answer.confidence ?? 0 };
      } else {
        output.answers[id] = { type: "bool", probability: answer.noul ?? 0 };
      }
    }

    const usage = body.usage as JsonRecord | undefined;
    if (usage) {
      output.usage = {
        inputTokens: Number(usage.input_tokens ?? usage.inputTokens ?? 0),
        outputTokens: Number(usage.output_tokens ?? usage.outputTokens ?? 0),
        ...(typeof usage.cost === "number" ? { cost: usage.cost } : {}),
      };
    }
  } catch (error) {
    output.stopReason = options?.signal?.aborted ? "aborted" : "error";
    output.errorMessage = error instanceof Error ? error.message : String(error);
  }

  return output;
};

/**
 * Gives the custom `9router` provider (models.json) a native classifier
 * surface. 9router exposes a TypeSafe System One endpoint at /v1/systemone;
 * this registers `oc/jev-1.13-free` as a classifier model plus the System One
 * implementation keyed by the model's `api` value.
 *
 * The extension `models` list replaces the provider's whole model list, so
 * the chat models from models.json are re-declared here verbatim. Registering
 * the classifier in models.json instead would silently produce a chat model —
 * `modelFromJson` ignores `type` — and the registry dispatch needs the
 * `classifiers` map only this path accepts.
 *
 * pi-advisor-flow's Jev screening resolves the classifier through pi's
 * registry, so authentication reuses the provider's models.json apiKey — no
 * separate key is needed.
 */
export default function register(pi: ExtensionAPI) {
  pi.registerProvider("9router", {
    models: [
      {
        type: "chat",
        id: "ocg/deepseek-v4.1-flash",
        name: "ocg/deepseek-v4.1-flash",
        api: "openai-completions",
        baseUrl: "http://127.0.0.1:20128/v1",
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 1000000,
        maxTokens: 64000,
      },
      {
        type: "chat",
        id: "ocg/muse-spark-1.3-contributor",
        name: "ocg/muse-spark-1.3-contributor",
        api: "openai-completions",
        baseUrl: "http://127.0.0.1:20128/v1",
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 1000000,
        maxTokens: 64000,
      },
      {
        type: "chat",
        id: "openrouter/openai/text-embedding-3-large",
        name: "openrouter/openai/text-embedding-3-large",
        api: "openai-completions",
        baseUrl: "http://127.0.0.1:20128/v1",
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 64000,
      },
      {
        type: "classifier",
        id: "oc/jev-1.13-free",
        name: "Jev 1.13 Free (9router)",
        api: SYSTEM_ONE_API,
        baseUrl: "http://127.0.0.1:20128/v1",
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 32000,
      },
    ],
    classifiers: {
      [SYSTEM_ONE_API]: { classify: classifySystemOne },
    },
  });
}
