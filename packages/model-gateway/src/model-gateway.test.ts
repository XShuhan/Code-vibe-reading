import { describe, expect, it } from "vitest";

import { createModelAdapter, answerGroundedQuestion, testModelConnection } from "./index";
import type { ModelConfig, EvidenceSpan, QuestionContext } from "@code-vibe/shared";

describe("model-gateway", () => {
  describe("createModelAdapter", () => {
    it("creates mock adapter", () => {
      const config: ModelConfig = {
        provider: "mock",
        baseUrl: "",
        apiKey: "",
        model: "mock-grounded",
        temperature: 0.1,
        maxTokens: 1024
      };
      const adapter = createModelAdapter(config);
      expect(adapter).toBeTruthy();
    });

    it("creates openai-compatible adapter by default", () => {
      const config: ModelConfig = {
        provider: "openai-compatible",
        baseUrl: "http://localhost:11434",
        apiKey: "test-key",
        model: "llama3",
        temperature: 0.1,
        maxTokens: 1024
      };
      const adapter = createModelAdapter(config);
      expect(adapter).toBeTruthy();
    });
  });

  describe("answerGroundedQuestion", () => {
    it("returns grounded answer with mock adapter", async () => {
      const config: ModelConfig = {
        provider: "mock",
        baseUrl: "",
        apiKey: "",
        model: "mock-grounded",
        temperature: 0.1,
        maxTokens: 1024
      };

      const evidence: EvidenceSpan[] = [
        {
          id: "evidence_1",
          workspaceId: "ws_1",
          path: "src/auth.ts",
          startLine: 1,
          endLine: 5,
          symbolId: "fn_createSession",
          excerpt: "export function createSession(userId: string) { return issueToken(userId); }",
          score: 10,
          reason: "Active symbol"
        }
      ];

      const ctx: QuestionContext = {
        workspaceId: "ws_1",
        activeFile: "src/auth.ts",
        activeSelection: {
          startLine: 1,
          endLine: 2,
          text: "createSession"
        },
        activeSymbolId: "fn_createSession",
        nearbySymbolIds: [],
        selectedCardIds: [],
        userQuestion: "How does session creation work?"
      };

      const answer = await answerGroundedQuestion(config, ctx, evidence);

      expect(answer.answerMarkdown).toBeTruthy();
      expect(answer.citations.length).toBe(1);
      expect(answer.citations[0].path).toBe("src/auth.ts");
      expect(answer.uncertaintyFlags.length).toBe(0);
    });

    it("returns uncertainty flag when no evidence", async () => {
      const config: ModelConfig = {
        provider: "mock",
        baseUrl: "",
        apiKey: "",
        model: "mock-grounded",
        temperature: 0.1,
        maxTokens: 1024
      };

      const evidence: EvidenceSpan[] = [];

      const ctx: QuestionContext = {
        workspaceId: "ws_1",
        activeFile: "src/auth.ts",
        activeSelection: undefined,
        nearbySymbolIds: [],
        selectedCardIds: [],
        userQuestion: "How does session creation work?"
      };

      const answer = await answerGroundedQuestion(config, ctx, evidence);

      expect(answer.uncertaintyFlags.length).toBeGreaterThan(0);
    });
  });

  describe("testModelConnection", () => {
    it("returns a simple success response with mock adapter", async () => {
      const config: ModelConfig = {
        provider: "mock",
        baseUrl: "",
        apiKey: "",
        model: "mock-grounded",
        temperature: 0.1,
        maxTokens: 1024
      };

      const result = await testModelConnection(config);

      expect(result.model).toBe("mock-grounded");
      expect(result.content).toBeTruthy();
      expect(Array.isArray(result.availableModels)).toBe(true);
    });
  });
});
