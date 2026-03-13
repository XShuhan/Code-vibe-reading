import type {
  EvidenceSpan,
  GroundedAnswer,
  ModelChunk,
  ModelConfig,
  ModelInfo,
  ModelRequest,
  ModelResponse,
  QuestionContext
} from "@code-vibe/shared";

import { groundedExplainPrompt } from "./prompt/groundedExplainPrompt";
import { MockAdapter } from "./adapters/mockAdapter";
import { OpenAICompatibleAdapter } from "./adapters/openAICompatible";

export interface ModelAdapter {
  listModels(): Promise<ModelInfo[]>;
  streamChat(request: ModelRequest): AsyncIterable<ModelChunk>;
  completeChat(request: ModelRequest): Promise<ModelResponse>;
  supportsVision(model?: string): boolean;
  supportsToolCalling(model?: string): boolean;
  supportsReasoning(model?: string): boolean;
}

export function createModelAdapter(config: ModelConfig): ModelAdapter {
  switch (config.provider) {
    case "mock":
      return new MockAdapter();
    case "openai-compatible":
    default:
      return new OpenAICompatibleAdapter(config);
  }
}

export async function answerGroundedQuestion(
  config: ModelConfig,
  ctx: QuestionContext,
  evidence: EvidenceSpan[]
): Promise<GroundedAnswer> {
  const adapter = createModelAdapter(config);
  const prompt = groundedExplainPrompt(ctx, evidence);

  const response = await adapter.completeChat({
    model: config.model || "mock-grounded",
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    messages: [
      {
        role: "system",
        content:
          "Explain code using only the supplied evidence. Distinguish facts, inferences, and uncertainty."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const citations = evidence.map((item, index) => ({
    id: `citation_${index + 1}`,
    path: item.path,
    startLine: item.startLine,
    endLine: item.endLine,
    symbolId: item.symbolId,
    label: `${item.path}:${item.startLine}-${item.endLine}`
  }));

  const uncertaintyFlags = evidence.length === 0 ? ["No evidence matched the question."] : [];

  const suggestedCards = evidence.slice(0, 2).map((item) => ({
    title: inferCardTitle(item.path),
    type: "ConceptCard" as const,
    summary: item.reason
  }));

  const answerMarkdown = [
    response.content,
    "",
    "Source references",
    ...citations.map((citation, index) => `${index + 1}. ${citation.label}`)
  ].join("\n");

  return {
    answerMarkdown,
    citations,
    suggestedCards,
    uncertaintyFlags
  };
}

export async function testModelConnection(
  config: ModelConfig
): Promise<{ model: string; content: string; availableModels: ModelInfo[] }> {
  const adapter = createModelAdapter(config);
  const availableModels = await adapter.listModels().catch(() => []);
  const model = config.model || availableModels[0]?.id || "mock-grounded";
  const response = await adapter.completeChat({
    model,
    temperature: 0,
    maxTokens: Math.min(config.maxTokens || 64, 64),
    messages: [
      {
        role: "system",
        content: "Reply with exactly OK."
      },
      {
        role: "user",
        content: "Reply with exactly OK."
      }
    ]
  });

  return {
    model,
    content: response.content,
    availableModels
  };
}

function inferCardTitle(filePath: string): string {
  const lastSegment = filePath.split("/").at(-1) ?? filePath;
  return lastSegment.replace(/\.[^.]+$/, "");
}
