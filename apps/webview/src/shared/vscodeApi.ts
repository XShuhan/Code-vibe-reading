import type { WebviewToExtensionMessage } from "@code-vibe/shared";

type VsCodeApi = {
  postMessage(message: WebviewToExtensionMessage): void;
  setState(state: unknown): void;
  getState(): unknown;
};

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

export const vscodeApi: VsCodeApi = typeof acquireVsCodeApi === "function"
  ? acquireVsCodeApi()
  : {
      postMessage: () => undefined,
      setState: () => undefined,
      getState: () => undefined
    };

