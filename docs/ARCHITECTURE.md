# Architecture

## System Overview

Code Vibe Reading is a VS Code extension that helps developers understand codebases through a structured reading workflow. The system follows these principles:

- **Navigation-first**: Code comprehension over free-form chat
- **Evidence-first**: Every answer cites source locations
- **Structure-first**: Model files, symbols, imports, calls, cards, and relations
- **Local-first**: Index and persist locally, AI is optional

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Map View   │  │ Threads View│  │    Cards View       │  │
│  │  (Tree)     │  │  (Tree)     │  │    (Tree)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Webview Panel (Canvas)                     ││
│  │         React + Drag-and-Drop Cards                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Extension Services                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │IndexService │  │ThreadService│  │   CardService       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐│
│  │CanvasService│  │         VibeController                  ││
│  └─────────────┘  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Analyzer    │    │   Retrieval   │    │ Model Gateway │
│  (TS Compiler)│    │(Lexical/Graph)│    │(OpenAI/Mock)  │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │   Persistence     │
                    │ (JSON per workspace)
                    └───────────────────┘
```

## Package Responsibilities

### @code-vibe/shared
- Core TypeScript types (CodeNode, Thread, Card, Canvas, etc.)
- VS Code command constants
- Webview-extension protocol messages
- Utility functions (ID generation, path handling)

### @code-vibe/analyzer
- TypeScript/JavaScript code analysis using the TS compiler API
- Symbol extraction (classes, functions, methods, interfaces, types, variables)
- Import graph construction
- Best-effort call graph construction
- File scanning and workspace snapshot creation

### @code-vibe/retrieval
- Question context building from editor state
- Lexical search over indexed code
- Graph expansion (imports, callers, callees)
- Evidence ranking by relevance
- Prompt context assembly for AI queries

### @code-vibe/model-gateway
- Abstract model adapter interface
- OpenAI-compatible adapter for remote models
- Mock adapter for local development without API keys
- Grounded explanation prompt templates

### @code-vibe/persistence
- Workspace-local JSON storage
- Thread, Card, Canvas, and Index persistence
- Storage path management per workspace

## Data Flow

### Indexing Flow
```
Workspace Files → FileScanner → TS Analyzer → Symbol Extractor
                                                    ↓
WorkspaceIndex ←──── Import/Call Graph ←────── Code Nodes/Edges
```

### Question Flow
```
User Selection → QuestionContext → Retrieval → Evidence Spans
                                                    ↓
Answer with Citations ←── Model Gateway ←── Prompt Assembly
```

### Canvas Flow
```
User Action (drag/create edge) → Webview Message → Extension Service
                                                          ↓
Updated Canvas State ←────── Persistence ←────── State Update
```

## Key Design Decisions

### 1. No Embeddings in MVP
- Structural and lexical retrieval only
- Faster indexing, no external dependencies
- Can add embeddings later if justified

### 2. TypeScript Compiler API
- More reliable than generic parsing for TS/JS
- Provides symbol resolution and type information
- Keeps analyzer architecture language-agnostic for future expansion

### 3. Tree Views for Structure, Webview for Canvas
- Native VS Code Tree Views for Map, Threads, Cards
- Webview only for Canvas (requires custom drag-and-drop)
- Consistent with VS Code UX guidelines

### 4. Workspace-Local Persistence
- JSON files in extension storage per workspace
- No cloud dependency
- Portable, privacy-preserving

### 5. Model Gateway Abstraction
- Easy to add new providers
- Mock adapter for offline development
- No vendor lock-in

## Extension Points

### Adding Language Support
1. Create `packages/analyzer/src/{language}/`
2. Implement symbol extraction
3. Implement import/call graph construction
4. Register in `analyzer/src/index.ts`

### Adding Model Providers
1. Create adapter in `model-gateway/src/adapters/`
2. Implement `ModelAdapter` interface
3. Register in settings enum

### Adding Canvas Relations
1. Add to `CanvasRelation` type in `shared/src/types.ts`
2. Add to `canvasRelations` array in `shared/src/schemas.ts`
3. Update UI in `webview/src/canvas/`

## Performance Considerations

- Initial index: ~minutes for medium TS repo
- Incremental updates: on file save
- Retrieval: sub-second for common queries
- UI remains responsive during indexing

## Security

- API keys stored in VS Code settings (encrypted by OS)
- Code never leaves machine unless AI is configured
- Local storage only
- No telemetry
