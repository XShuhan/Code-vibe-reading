import * as vscode from "vscode";

import type { ModelConfig } from "@code-vibe/shared";

export function getModelConfig(): ModelConfig {
  const config = vscode.workspace.getConfiguration("vibe.model");
  return {
    provider: config.get<ModelConfig["provider"]>("provider", "openai-compatible"),
    baseUrl: config.get<string>("baseUrl", ""),
    apiKey: config.get<string>("apiKey", ""),
    model: config.get<string>("model", ""),
    temperature: config.get<number>("temperature", 0.1),
    maxTokens: config.get<number>("maxTokens", 900)
  };
}

