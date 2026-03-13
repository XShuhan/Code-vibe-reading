import ts from "typescript";

import type { CodeEdge, CodeNode, CodeNodeKind } from "@code-vibe/shared";
import type { CallReference, FileAnalysisResult } from "../core/analysisTypes";

interface AnalyzeParams {
  content: string;
  path: string;
  workspaceId: string;
}

export function analyzeSourceFile(params: AnalyzeParams): FileAnalysisResult {
  const sourceFile = ts.createSourceFile(
    params.path,
    params.content,
    ts.ScriptTarget.Latest,
    true,
    guessScriptKind(params.path)
  );

  const fileNode = createNode(
    params.workspaceId,
    "file",
    pathBasename(params.path),
    params.path,
    1,
    lineOf(sourceFile, params.content.length),
    true
  );

  const nodes: CodeNode[] = [fileNode];
  const containsEdges: CodeEdge[] = [];
  const callReferences: CallReference[] = [];
  const importSpecifiers: string[] = [];

  function visit(node: ts.Node, parentNodeId: string, classContext?: string): void {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importSpecifiers.push(node.moduleSpecifier.text);
    }

    const symbolInfo = toSymbolNode(node, sourceFile, params.workspaceId, params.path, parentNodeId);
    if (symbolInfo) {
      nodes.push(symbolInfo.node);
      containsEdges.push(
        createEdge(params.workspaceId, symbolInfo.node.parentId ?? fileNode.id, symbolInfo.node.id, "contains")
      );

      if (ts.isClassDeclaration(node) && symbolInfo.node.name) {
        node.members.forEach((member) => visit(member, symbolInfo.node.id, symbolInfo.node.name));
      }

      if (!ts.isClassDeclaration(node)) {
        ts.forEachChild(node, (child) =>
          visit(child, symbolInfo.node.id, classContext ?? symbolInfo.className)
        );
      }

      collectCallReferences(node, symbolInfo.node.id, params.path, classContext ?? symbolInfo.className, callReferences);
      return;
    }

    collectCallReferences(node, parentNodeId, params.path, classContext, callReferences);
    ts.forEachChild(node, (child) => visit(child, parentNodeId, classContext));
  }

  ts.forEachChild(sourceFile, (node) => visit(node, fileNode.id));

  return {
    fileNode,
    nodes,
    containsEdges,
    importSpecifiers,
    callReferences
  };
}

function guessScriptKind(filePath: string): ts.ScriptKind {
  return filePath.endsWith(".tsx") || filePath.endsWith(".jsx")
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
}

function pathBasename(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] ?? filePath;
}

function lineOf(sourceFile: ts.SourceFile, position: number): number {
  return sourceFile.getLineAndCharacterOfPosition(position).line + 1;
}

function createNode(
  workspaceId: string,
  kind: CodeNodeKind,
  name: string,
  filePath: string,
  startLine: number,
  endLine: number,
  exported: boolean,
  parentId?: string,
  signature?: string,
  docComment?: string
): CodeNode {
  const id = `${workspaceId}:${filePath}:${kind}:${name}:${startLine}`;
  return {
    id,
    workspaceId,
    kind,
    name,
    path: filePath,
    rangeStartLine: startLine,
    rangeEndLine: endLine,
    signature,
    docComment,
    exported,
    parentId
  };
}

function createEdge(
  workspaceId: string,
  fromNodeId: string,
  toNodeId: string,
  type: CodeEdge["type"],
  inferred = false
): CodeEdge {
  return {
    id: `${workspaceId}:${type}:${fromNodeId}:${toNodeId}`,
    workspaceId,
    fromNodeId,
    toNodeId,
    type,
    inferred
  };
}

function toSymbolNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  workspaceId: string,
  filePath: string,
  parentId: string
): { node: CodeNode; className?: string } | null {
  const exported = hasExportModifier(node);
  const docComment = extractDocComment(node, sourceFile);

  if (ts.isClassDeclaration(node) && node.name) {
    return {
      node: createNode(
        workspaceId,
        "class",
        node.name.text,
        filePath,
        lineOf(sourceFile, node.getStart(sourceFile)),
        lineOf(sourceFile, node.getEnd()),
        exported,
        parentId,
        node.name.text,
        docComment
      ),
      className: node.name.text
    };
  }

  if (ts.isInterfaceDeclaration(node)) {
    return {
      node: createNode(
        workspaceId,
        "interface",
        node.name.text,
        filePath,
        lineOf(sourceFile, node.getStart(sourceFile)),
        lineOf(sourceFile, node.getEnd()),
        exported,
        parentId,
        node.name.text,
        docComment
      )
    };
  }

  if (ts.isTypeAliasDeclaration(node)) {
    return {
      node: createNode(
        workspaceId,
        "type",
        node.name.text,
        filePath,
        lineOf(sourceFile, node.getStart(sourceFile)),
        lineOf(sourceFile, node.getEnd()),
        exported,
        parentId,
        node.name.text,
        docComment
      )
    };
  }

  if (ts.isFunctionDeclaration(node) && node.name) {
    return {
      node: createNode(
        workspaceId,
        "function",
        node.name.text,
        filePath,
        lineOf(sourceFile, node.getStart(sourceFile)),
        lineOf(sourceFile, node.getEnd()),
        exported,
        parentId,
        node.getText(sourceFile).split("{")[0]?.trim(),
        docComment
      )
    };
  }

  if (
    ts.isMethodDeclaration(node) &&
    node.name &&
    (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
  ) {
    const methodName = node.name.text;
    return {
      node: createNode(
        workspaceId,
        "method",
        methodName,
        filePath,
        lineOf(sourceFile, node.getStart(sourceFile)),
        lineOf(sourceFile, node.getEnd()),
        exported,
        parentId,
        node.getText(sourceFile).split("{")[0]?.trim(),
        docComment
      )
    };
  }

  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0];
    if (declaration && ts.isIdentifier(declaration.name)) {
      return {
        node: createNode(
          workspaceId,
          "variable",
          declaration.name.text,
          filePath,
          lineOf(sourceFile, node.getStart(sourceFile)),
          lineOf(sourceFile, node.getEnd()),
          exported,
          parentId,
          declaration.name.text,
          docComment
        )
      };
    }
  }

  return null;
}

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = (node as ts.HasModifiers).modifiers;
  return Boolean(modifiers?.some((modifier: ts.ModifierLike) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function extractDocComment(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  const jsDocs = ts.getJSDocCommentsAndTags(node);
  if (jsDocs.length === 0) {
    return undefined;
  }

  return jsDocs
    .map((doc) => doc.getText(sourceFile).replace(/^\/\*\*?/, "").replace(/\*\/$/, "").trim())
    .join("\n")
    .trim();
}

function collectCallReferences(
  node: ts.Node,
  callerNodeId: string,
  filePath: string,
  classContext: string | undefined,
  callReferences: CallReference[]
): void {
  const visitNode = (candidate: ts.Node): void => {
    if (ts.isCallExpression(candidate)) {
      const reference = getCallReference(candidate.expression);
      if (reference) {
        callReferences.push({
          callerNodeId,
          filePath,
          name: reference.name,
          receiverText: reference.receiverText,
          containerName: classContext
        });
      }
    }

    ts.forEachChild(candidate, visitNode);
  };

  if (ts.isFunctionLike(node) || ts.isClassDeclaration(node) || ts.isVariableStatement(node)) {
    ts.forEachChild(node, visitNode);
  }
}

function getCallReference(
  expression: ts.Expression
): { name: string; receiverText?: string } | null {
  if (ts.isIdentifier(expression)) {
    return { name: expression.text };
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return {
      name: expression.name.text,
      receiverText: expression.expression.getText()
    };
  }

  return null;
}
