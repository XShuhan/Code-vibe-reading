# Code Vibe Reading

A VS Code extension for understanding codebases after vibe coding. Navigate, ask, cite, save, connect, and revisit your code with a structured reading workbench.

## Features

- **Code Map** - Visualize your workspace structure: files, modules, classes, functions, and their relationships
- **Ask About Selection** - Right-click any code selection to ask grounded questions with citations
- **Cards** - Save understanding as reusable reading notes (Auth flow, Bug hypothesis, etc.)
- **Canvas** - Organize cards visually with typed connections (explains, calls, depends_on, etc.)
- **Jump to Source** - Click any citation to jump directly to the source file and line
- **Trace Call Path** - Follow callers, callees, and neighbors from any symbol

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd code-vibe-reading

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Open in VS Code
code apps/extension
```

## Development

### Running the Extension

1. Open `apps/extension` folder in VS Code
2. Press F5 to launch Extension Development Host
3. Open a TypeScript/JavaScript workspace
4. Click the "Vibe" icon in the Activity Bar

### Project Structure

```
code-vibe-reading/
├── apps/
│   ├── extension/     # VS Code extension host
│   └── webview/       # React webview UI
├── packages/
│   ├── shared/        # Shared types and utilities
│   ├── analyzer/      # TS/JS code analysis
│   ├── retrieval/     # Evidence retrieval (structural/lexical)
│   ├── model-gateway/ # AI model abstraction
│   ├── persistence/   # Local storage
│   └── testkit/       # Test fixtures
└── docs/
    ├── ARCHITECTURE.md
    ├── DEMO.md
    └── ROADMAP.md
```

### Commands

| Command | Description |
|---------|-------------|
| `Vibe: Refresh Index` | Rebuild the code index |
| `Vibe: Ask About Selection` | Ask a question about selected code |
| `Vibe: Explain Current Symbol` | Explain the symbol under cursor |
| `Vibe: Save Selection as Card` | Save selection as a reading card |
| `Vibe: Open Canvas` | Open the canvas view |
| `Vibe: Trace Call Path` | Trace callers and callees |

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `vibe.model.provider` | `openai-compatible` | Model provider type |
| `vibe.model.baseUrl` | - | API base URL |
| `vibe.model.apiKey` | - | API key |
| `vibe.model.model` | - | Model identifier |
| `vibe.model.temperature` | `0.1` | Sampling temperature |
| `vibe.model.maxTokens` | `900` | Max response tokens |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Demo

See [docs/DEMO.md](docs/DEMO.md) for example workflows.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for future plans.

## License

MIT
