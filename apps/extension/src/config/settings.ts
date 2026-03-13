import * as vscode from "vscode";

import type { ModelConfig } from "@code-vibe/shared";

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: "mock",
  baseUrl: "https://api.moonshot.cn/v1",
  apiKey: "",
  model: "kimi-k2-0905-preview",
  temperature: 0.1,
  maxTokens: 8192
};

export function getModelConfig(): ModelConfig {
  const config = vscode.workspace.getConfiguration("vibe.model");

  return {
    provider: config.get<ModelConfig["provider"]>("provider", DEFAULT_MODEL_CONFIG.provider),
    baseUrl: config.get<string>("baseUrl", DEFAULT_MODEL_CONFIG.baseUrl),
    apiKey: config.get<string>("apiKey", DEFAULT_MODEL_CONFIG.apiKey),
    model: config.get<string>("model", DEFAULT_MODEL_CONFIG.model),
    temperature: config.get<number>("temperature", DEFAULT_MODEL_CONFIG.temperature),
    maxTokens: config.get<number>("maxTokens", DEFAULT_MODEL_CONFIG.maxTokens)
  };
}

export function assertModelConfigured(modelConfig: ModelConfig): void {
  if (modelConfig.provider === "mock") {
    return;
  }

  if (!modelConfig.baseUrl || !modelConfig.apiKey || !modelConfig.model) {
    throw new Error(
      [
        "AI is not configured.",
        "For Moonshot Open Platform: set vibe.model.baseUrl=https://api.moonshot.cn/v1 and a valid Moonshot model id.",
        "For Kimi Code direct access: set vibe.model.baseUrl=https://api.kimi.com/coding/v1 and vibe.model.model=kimi-for-coding.",
        "For OpenClaw gateway: set vibe.model.baseUrl=http://127.0.0.1:<port>/v1 and vibe.model.model=openclaw:<agentId>."
      ].join(" ")
    );
  }
}
