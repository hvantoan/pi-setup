import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

interface RefreshContextShape {
  credential?: { type?: string; key?: string };
  baseUrl?: string;
  signal: AbortSignal;
  allowNetwork?: boolean;
}

const PROVIDER_BASE_URL = "http://127.0.0.1:20128/v1";
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

const ZERO_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

type ProviderModel =
  | {
      type: "chat";
      id: string;
      name: string;
      api: "openai-completions";
      baseUrl: string;
      input: ("text" | "image")[];
      reasoning: boolean;
      cost: typeof ZERO_COST;
      contextWindow: number;
      maxTokens: number;
    }
  | {
      type: "classifier";
      id: string;
      name: string;
      api: string;
      baseUrl: string;
      input: ("text" | "image")[];
      cost: typeof ZERO_COST;
      contextWindow: number;
    };

const chatModel = (
  id: string,
  contextWindow: number,
  maxTokens: number,
  vision = false,
  reasoning = false
): ProviderModel => ({
  type: "chat",
  id,
  name: id,
  api: "openai-completions",
  baseUrl: PROVIDER_BASE_URL,
  input: vision ? ["text", "image"] : ["text"],
  reasoning,
  cost: ZERO_COST,
  contextWindow,
  maxTokens,
});

const classifierModel = (id: string, contextWindow = 32000): ProviderModel => ({
  type: "classifier",
  id,
  name: `${id} (9router)`,
  api: SYSTEM_ONE_API,
  baseUrl: PROVIDER_BASE_URL,
  input: ["text"],
  cost: ZERO_COST,
  contextWindow,
});

/**
 * Last-resort seed: used only when the YAML cache is missing AND unreadable —
 * e.g. first install before the first successful refresh. Once refreshModels
 * fetches /v1/models the cache file replaces this list permanently.
 */
const SEED_MODELS: ProviderModel[] = [
  chatModel("ocg/deepseek-v4.1-flash", 1000000, 64000, false, true),
  chatModel("ocg/muse-spark-1.3-contributor", 1000000, 64000, false, true),
  chatModel("openrouter/openai/text-embedding-3-large", 200000, 64000),
  classifierModel("openrouter/typesafe/jev-1.13"),
  classifierModel("oc/jev-1.13-free"),
];

// --- models.yaml cache -------------------------------------------------------

// Cache inside the sibling npm/ dir — anchored to this file's location so it
// survives PI_CODING_AGENT_DIR relocations — and doubly serves as a node_modules
// anchor for resolving the bundled `yaml` package.
const NPM_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "npm");
const CACHE_PATH = join(NPM_DIR, "models.yaml");

const yaml = createRequire(join(NPM_DIR, "noop.js"))("yaml") as typeof import("yaml");
const loadCachedModels = (): ProviderModel[] => {
  try {
    const doc = yaml.parse(readFileSync(CACHE_PATH, "utf8")) as ModelsYamlDoc | null;
    if (doc?.models && doc.models.length > 0) return doc.models;
  } catch {
    /* cache absent/corrupt — seed takes over */
  }
  return SEED_MODELS;
};

/** Persist the fetched catalog so the next startup skips code changes. */
const saveCachedModels = (models: ProviderModel[]) => {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    writeFileSync(
      CACHE_PATH,
      yaml.stringify({ fetchedAt: new Date().toISOString(), models }),
      "utf8"
    );
  } catch (error) {
    console.error("9router models cache write failed:", error);
  }
};

const STATIC_MODELS: ProviderModel[] = loadCachedModels();

interface OpenAIModelEntry {
  id: string;
  context_length?: number;
  max_completion_tokens?: number;
  capabilities?: {
    vision?: boolean;
    reasoning?: boolean;
    contextWindow?: number;
    maxOutput?: number;
  };
}

/**
 * Dynamic catalog: GET /v1/models (OpenAI-standard, which 9router serves),
 * mapped to chat models; ids matching the Jev decision family become
 * `typesafe-system-one` classifiers instead. Successful fetches persist to
 * models.yaml; failures return the last cached (or seed) catalog.
 */
const refreshModels = async (context: RefreshContextShape) => {
  const baseUrl = (context.baseUrl ?? PROVIDER_BASE_URL).replace(/\/+$/u, "");
  const apiKey = context.credential?.type === "api_key" ? context.credential.key : undefined;
  if (!apiKey || context.allowNetwork === false) return STATIC_MODELS;

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: context.signal,
    });
    if (!response.ok) throw new Error(`models list failed: ${response.status}`);

    const body = (await response.json()) as { data?: OpenAIModelEntry[] };
    const entries = body.data ?? [];
    if (entries.length === 0) return STATIC_MODELS;

    const models: ProviderModel[] = [];
    for (const entry of entries) {
      // jev-prefixed ids answer the TypeSafe System One contract on /v1/systemone.
      if (/jev/i.test(entry.id)) {
        models.push(classifierModel(entry.id, entry.capabilities?.contextWindow ?? entry.context_length ?? 32000));
      } else {
        models.push(
          chatModel(
            entry.id,
            entry.capabilities?.contextWindow ?? entry.context_length ?? 128000,
            entry.capabilities?.maxOutput ?? entry.max_completion_tokens ?? 16384,
            entry.capabilities?.vision === true,
            entry.capabilities?.reasoning === true
          )
        );
      }
    }
    // Keep seed classifiers alive even if the gateway drops jev ids from
    // /v1/models — advisor Jev screening must never silently lose its refs.
    const seen = new Set(models.map((m) => m.id));
    for (const m of SEED_MODELS) if (m.type === "classifier" && !seen.has(m.id)) models.push(m);
    saveCachedModels(models);
    return models;
  } catch (error) {
    console.error("9router model refresh failed, using cached catalog:", error);
    return STATIC_MODELS;
  }
};

/**
 * Gives the custom `9router` provider (models.json) a native classifier
 * surface and dynamic model discovery. 9router exposes a TypeSafe System One
 * endpoint at /v1/systemone and an OpenAI-standard /v1/models catalog; this
 * registers the System One implementation keyed by the model's `api` value
 * plus `refreshModels` so new upstream models appear without config edits.
 *
 * Registered `models` lists replace the provider's whole list, so the chat
 * models from models.json are re-declared via the models.yaml cache (seeded
 * from code only on first run). Registering the classifier in models.json
 * instead would silently produce a chat model — `modelFromJson` ignores
 * `type` — and the registry dispatch needs the `classifiers` map only this
 * path accepts.
 *
 * pi-advisor-flow's Jev screening resolves the classifier through pi's
 * registry, so authentication reuses the provider's models.json apiKey — no
 * separate key is needed.
 */
export default function register(pi: ExtensionAPI) {
  pi.registerProvider("9router", {
    models: STATIC_MODELS,
    refreshModels,
    classifiers: {
      [SYSTEM_ONE_API]: { classify: classifySystemOne },
    },
  });
}
