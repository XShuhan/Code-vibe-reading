import type {
  ChatMessage,
  ModelChunk,
  ModelConfig,
  ModelInfo,
  ModelRequest,
  ModelResponse
} from "@code-vibe/shared";

import type { ModelAdapter } from "../index";

export class OpenAICompatibleAdapter implements ModelAdapter {
  constructor(private readonly config: ModelConfig) {}

  async listModels(): Promise<ModelInfo[]> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      return [];
    }

    const response = await fetch(joinUrl(this.config.baseUrl, "/models"), {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ id: string }>;
    };

    return (payload.data ?? []).map((model) => ({
      id: model.id,
      label: model.id
    }));
  }

  async *streamChat(request: ModelRequest): AsyncIterable<ModelChunk> {
    const response = await this.completeChat(request);
    yield { delta: response.content, done: true };
  }

  async completeChat(request: ModelRequest): Promise<ModelResponse> {
    assertConfigured(this.config);

    const payload = {
      model: request.model,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      temperature: request.temperature,
      max_tokens: request.maxTokens
    };

    const response = await fetch(joinUrl(this.config.baseUrl, "/chat/completions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Model request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: ChatMessage }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Model response did not contain assistant content.");
    }

    return { content };
  }

  supportsVision(): boolean {
    return false;
  }

  supportsToolCalling(): boolean {
    return false;
  }

  supportsReasoning(): boolean {
    return true;
  }
}

function joinUrl(baseUrl: string, suffix: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${suffix}`;
}

function assertConfigured(config: ModelConfig): void {
  if (!config.baseUrl || !config.apiKey || !config.model) {
    throw new Error("Missing vibe model configuration. Configure provider, baseUrl, apiKey, and model.");
  }
}

