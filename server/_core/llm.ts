/**
 * LLM client — Anthropic (Claude).
 *
 * Migrated off the Manus "Forge" proxy. Keeps the original OpenAI-shaped
 * `invokeLLM(params) -> InvokeResult` interface so existing callers
 * (e.g. aiPipeline.ts) work unchanged. JSON-schema responses are produced
 * via Anthropic tool-use and surfaced as a JSON string in
 * `choices[0].message.content`.
 */
import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = { type: "text"; text: string };
export type ImageContent = {
  type: "image_url";
  image_url: { url: string; detail?: "auto" | "low" | "high" };
};
export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: { name: string; description?: string; parameters?: Record<string, unknown> };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = { type: "function"; function: { name: string } };
export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;

export type JsonSchema = { name: string; schema: Record<string, unknown>; strict?: boolean };
export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const DEFAULT_MAX_TOKENS = 8192;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: ENV.anthropicApiKey });
  }
  return _client;
}

/** Flatten arbitrary message content to plain text. */
function contentToText(content: MessageContent | MessageContent[]): string {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.type === "text") return part.text;
      if (part.type === "image_url") return part.image_url.url;
      if (part.type === "file_url") return part.file_url.url;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/** Resolve the JSON schema requested (json_schema response_format or outputSchema). */
function resolveJsonSchema(params: InvokeParams): JsonSchema | undefined {
  const rf = params.responseFormat || params.response_format;
  if (rf && rf.type === "json_schema" && rf.json_schema?.schema) {
    return rf.json_schema;
  }
  return params.outputSchema || params.output_schema;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const client = getClient();

  // Collect system prompt(s) and conversational turns.
  const systemParts: string[] = [];
  const messages: Anthropic.MessageParam[] = [];

  for (const msg of params.messages) {
    const text = contentToText(msg.content);
    if (msg.role === "system") {
      systemParts.push(text);
    } else if (msg.role === "assistant") {
      messages.push({ role: "assistant", content: text });
    } else {
      // user / tool / function → treat as user input
      messages.push({ role: "user", content: text });
    }
  }
  if (messages.length === 0) {
    messages.push({ role: "user", content: " " });
  }

  const maxTokens = params.max_tokens ?? params.maxTokens ?? DEFAULT_MAX_TOKENS;
  const jsonSchema = resolveJsonSchema(params);

  const request: Anthropic.MessageCreateParamsNonStreaming = {
    model: ENV.anthropicModel,
    max_tokens: maxTokens,
    messages,
  };
  if (systemParts.length > 0) {
    request.system = systemParts.join("\n\n");
  }

  // Structured output via forced tool-use.
  if (jsonSchema) {
    request.tools = [
      {
        name: jsonSchema.name,
        description: "Return the result strictly matching the provided schema.",
        input_schema: jsonSchema.schema as Anthropic.Tool.InputSchema,
      },
    ];
    request.tool_choice = { type: "tool", name: jsonSchema.name };
  }

  const response = await client.messages.create(request);

  // Build OpenAI-shaped content.
  let content = "";
  if (jsonSchema) {
    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    content = toolUse ? JSON.stringify(toolUse.input) : "";
  } else {
    content = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  return {
    id: response.id,
    created: Math.floor(Date.now() / 1000),
    model: response.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: response.stop_reason ?? null,
      },
    ],
    usage: response.usage
      ? {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        }
      : undefined,
  };
}
