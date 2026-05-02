const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";

export class OpenAIRequestError extends Error {
  status: number;
  details: string;

  constructor(status: number, details: string) {
    super(`OpenAI API error: ${status}`);
    this.name = "OpenAIRequestError";
    this.status = status;
    this.details = details;
  }
}

export type ChatCompletionRequest = {
  model?: string;
  messages: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

function resolveModel(model?: string): string {
  const envModel = Deno.env.get("OPENAI_MODEL")?.trim();
  if (envModel) return envModel;

  // Lovable gateway model ids use provider prefixes. OpenAI does not accept them.
  if (!model || model.includes("/")) return DEFAULT_OPENAI_MODEL;
  return model;
}

function shouldStripSamplingParams(model: string): boolean {
  return /^(gpt-5|o[1-9]|o[1-9]-)/.test(model);
}

function normalizeRequest(request: ChatCompletionRequest): Record<string, unknown> {
  const model = resolveModel(request.model);
  const payload: Record<string, unknown> = {
    ...request,
    model,
    store: request.store ?? false,
  };

  if (payload.max_tokens && !payload.max_completion_tokens) {
    payload.max_completion_tokens = payload.max_tokens;
    delete payload.max_tokens;
  }

  if (shouldStripSamplingParams(model)) {
    delete payload.temperature;
    delete payload.top_p;
    delete payload.presence_penalty;
    delete payload.frequency_penalty;
  }

  const reasoningEffort = Deno.env.get("OPENAI_REASONING_EFFORT")?.trim();
  if (reasoningEffort) {
    payload.reasoning_effort = reasoningEffort;
  }

  return payload;
}

export async function createOpenAIChatCompletion(request: ChatCompletionRequest) {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const organization = Deno.env.get("OPENAI_ORG_ID")?.trim();
  if (organization) headers["OpenAI-Organization"] = organization;

  const project = Deno.env.get("OPENAI_PROJECT_ID")?.trim();
  if (project) headers["OpenAI-Project"] = project;

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(normalizeRequest(request)),
  });

  if (!response.ok) {
    throw new OpenAIRequestError(response.status, await response.text());
  }

  return response.json();
}

export function getOpenAIModel(model?: string): string {
  return resolveModel(model);
}
