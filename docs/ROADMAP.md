# Roadmap

This document outlines the future direction for Code Vibe Reading.

## Current State (MVP)

The MVP provides:
- ✅ TypeScript/JavaScript code analysis
- ✅ Workspace code map (files, symbols, imports, calls)
- ✅ Grounded Q&A with citations
- ✅ Card creation and persistence
- ✅ Canvas for visual organization
- ✅ Source jump from citations
- ✅ Local-first architecture

## Phase 1: Foundation Hardening

### Short-term (Next 1-2 months)

#### Testing & Quality
- [ ] Comprehensive test coverage for all packages
- [ ] Integration tests with real-world repositories
- [ ] Performance benchmarks for large codebases
- [ ] Error recovery and corruption handling

#### Documentation
- [ ] API documentation for package interfaces
- [ ] Contribution guidelines
- [ ] Architecture decision records (ADRs)
- [ ] Video tutorials

#### Stability
- [ ] Robust parsing error handling
- [ ] Incremental index performance optimization
- [ ] Memory usage optimization for large workspaces
- [ ] Better progress indicators for long operations

### Medium-term (3-6 months)

#### Language Support
- [ ] Python analyzer
- [ ] Rust analyzer
- [ ] Go analyzer
- [ ] Language-agnostic parser abstraction

#### Enhanced Retrieval
- [ ] Optional embeddings for semantic search
- [ ] Hybrid retrieval (structural + semantic)
- [ ] Query expansion with synonyms
- [ ] Cross-file relationship inference

#### AI Improvements
- [ ] Streaming responses for better UX
- [ ] Multi-turn conversations in threads
- [ ] Follow-up question suggestions
- [ ] Confidence scoring for answers

## Phase 2: Advanced Features

### Code Understanding

#### Deeper Analysis
- [ ] Type inference and type flow
- [ ] Control flow analysis
- [ ] Data flow analysis
- [ ] Design pattern detection

#### Documentation Generation
- [ ] Auto-generate module overviews
- [ ] Create architecture diagrams from code
- [ ] Export reading paths as documentation
- [ ] Generate onboarding guides

### Collaboration

#### Sharing
- [ ] Export/import canvas layouts
- [ ] Share cards with team members
- [ ] Export threads as markdown
- [ ] Create shareable reading paths

#### Team Features
- [ ] Shared team canvas
- [ ] Card comments and discussions
- [ ] Reading progress tracking
- [ ] Knowledge base building

### Integration

#### Version Control
- [ ] Git commit-based snapshots
- [ ] Diff analysis between commits
- [ ] PR review mode
- [ ] Branch comparison

#### CI/CD
- [ ] CLI mode for automated analysis
- [ ] Generate reports in CI
- [ ] Breaking change detection
- [ ] Documentation drift detection

#### IDE Integrations
- [ ] JetBrains plugin
- [ ] Neovim plugin
- [ ] Standalone desktop app

## Phase 3: Ecosystem

### Platform

#### Cloud Features (Optional)
- [ ] Optional cloud sync (user-controlled)
- [ ] Team workspace sharing
- [ ] Advanced analytics
- [ ] Hosted model options

#### Marketplace
- [ ] Card template marketplace
- [ ] Community reading paths
- [ ] Analyzer plugins
- [ ] Integration plugins

### Intelligence

#### Advanced AI
- [ ] Fine-tuned models for code comprehension
- [ ] Multi-modal (diagram understanding)
- [ ] Agent-based exploration
- [ ] Automatic hypothesis generation

#### Learning
- [ ] Learn from user corrections
- [ ] Personalized retrieval ranking
- [ ] Predictive card suggestions
- [ ] Code change impact prediction

## Technical Debt & Infrastructure

### Performance
- [ ] SQLite backend option
- [ ] Parallel indexing
- [ ] Lazy loading for large workspaces
- [ ] Caching layer

### Architecture
- [ ] Plugin system for analyzers
- [ ] Plugin system for retrievers
- [ ] Plugin system for model providers
- [ ] Headless mode for scripting

### Developer Experience
- [ ] Hot reload for development
- [ ] Better debugging tools
- [ ] Profiling tools
- [ ] Benchmark suite

## Out of Scope (Intentionally)

These features are explicitly not planned to maintain focus:

- ❌ Autonomous code rewriting (this is a reading tool, not an agent)
- ❌ Automatic code generation
- ❌ Real-time collaboration (async only)
- ❌ Cloud-only features (always local-first option)
- ❌ Generic chatbot (structure-first only)
- ❌ IDE-agnostic LSP server (VS Code focus for MVP)

## Contributing to the Roadmap

We welcome input on priorities:

1. **Open an issue** describing your use case
2. **Vote on existing issues** to help prioritize
3. **Propose ADRs** for major architectural changes
4. **Contribute PRs** for roadmap items

## Decision Criteria

Features are prioritized based on:

1. **User value** - How much does this help code comprehension?
2. **Alignment** - Does it fit the navigation-first, evidence-first principles?
3. **Complexity** - Can we maintain this long-term?
4. **Performance** - Does it stay responsive on large codebases?
5. **Privacy** - Does it respect local-first principles?

## Release Cadence

- **Patch releases** - Bug fixes, performance improvements (as needed)
- **Minor releases** - New features, enhancements (monthly)
- **Major releases** - Breaking changes, architecture shifts (as needed)

## Long-term Vision

Code Vibe Reading aims to become the standard tool for:

1. **Onboarding** - New team members understanding existing code
2. **Refactoring** - Understanding before changing
3. **Review** - Comprehending PRs thoroughly
4. **Debugging** - Tracing through complex systems
5. **Documentation** - Capturing and sharing knowledge

The ultimate goal is to make "vibe coding" sustainable by ensuring the resulting code remains comprehensible, maintainable, and documented.
