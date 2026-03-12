# Demo Workflows

This document demonstrates typical workflows for using Code Vibe Reading.

## Demo 1: Understanding a New Codebase

### Scenario
You've just joined a project and need to understand the authentication flow.

### Steps

1. **Open the workspace**
   ```
   code ~/projects/sample-app
   ```

2. **Open Vibe sidebar**
   - Click the "Vibe" icon in the Activity Bar
   - Click "Refresh Index" to build the code map

3. **Explore the Map**
   - Expand folders to see files
   - Expand files to see exported symbols
   - Find `auth.ts` → `login()` function

4. **Ask about the login flow**
   - Open `auth.ts`
   - Select the `login()` function
   - Right-click → "Vibe: Ask About Selection"
   - Type: "How does the login flow work?"

5. **Review the answer**
   - See grounded explanation with citations
   - Click citations to jump to referenced code
   - Understand the flow: `login()` → `validateCredentials()` → `createSession()`

6. **Save as a Card**
   - Click "Save as Card" in the thread view
   - Title: "Auth Flow"
   - Type: `FlowCard`

7. **Organize on Canvas**
   - Open Canvas
   - Drag the "Auth Flow" card onto canvas
   - Create cards for other key concepts
   - Connect related cards with edges

## Demo 2: Debugging a Bug

### Scenario
You're investigating why orders are being created twice.

### Steps

1. **Find the order creation code**
   - Use Map view to find `order.ts`
   - Locate `createOrder()` function

2. **Trace the call path**
   - Right-click on `createOrder()`
   - Select "Vibe: Trace Call Path"
   - See callers: `placeOrder()` ← `handleCheckout()`

3. **Ask about potential issues**
   - Select `createOrder()` function
   - Right-click → "Vibe: Ask About Selection"
   - Type: "What could cause this to be called twice?"

4. **Review evidence-based answer**
   - See citations to event listeners, hooks, or API endpoints
   - Identify the duplicate trigger

5. **Document the bug hypothesis**
   - Save the answer as a `BugCard`
   - Title: "Double order creation"
   - Add tags: ["bug", "order", "checkout"]

6. **Create a fix plan on Canvas**
   - Add cards for: Bug hypothesis, Root cause, Fix approach
   - Connect with `causes` and `implements` relations

## Demo 3: Code Review

### Scenario
You're reviewing a PR that adds payment retry logic.

### Steps

1. **Index the PR branch**
   - Switch to PR branch
   - Refresh index to see new code

2. **Explore new files**
   - Use Map view to find new `payment-retry.ts`
   - See exported functions: `retryPayment()`, `calculateBackoff()`

3. **Understand the retry logic**
   - Select `retryPayment()` function
   - Ask: "What are the retry conditions and limits?"
   - Review grounded answer with citations

4. **Check error handling**
   - Select error handling block
   - Ask: "Are all error cases handled?"

5. **Save review notes as Cards**
   - Create `DecisionCard` for: "Approve retry logic"
   - Create `QuestionCard` for: "Should we add metrics?"

6. **Organize review on Canvas**
   - Layout: New code → Questions → Decisions
   - Share canvas with team

## Demo 4: Onboarding Documentation

### Scenario
You're creating documentation for new team members.

### Steps

1. **Create concept cards**
   - Navigate to key modules
   - For each, ask: "What is the purpose of this module?"
   - Save answers as `ConceptCard`s

2. **Document data flows**
   - Trace important paths (e.g., user registration)
   - Create `FlowCard`s for each major flow

3. **Organize on Canvas**
   - Group by domain: Auth, Orders, Payments, etc.
   - Connect related concepts
   - Add `explains` edges from concepts to flows

4. **Export understanding**
   - Canvas layout persists with workspace
   - New team members can explore the map

## Demo 5: Refactoring Planning

### Scenario
You're planning to refactor the database layer.

### Steps

1. **Map current dependencies**
   - Find database-related files
   - Trace which modules depend on them

2. **Identify coupling**
   - Use call path tracing
   - Find tight coupling points

3. **Create refactoring cards**
   - `DecisionCard`: "Extract repository pattern"
   - `QuestionCard`: "How to handle transactions?"

4. **Plan on Canvas**
   - Current state → Target state
   - Migration steps as intermediate cards
   - `depends_on` edges show ordering

5. **Track progress**
   - Mark cards as complete
   - Update canvas as refactoring proceeds

## Tips for Effective Use

### Keyboard Shortcuts
- Use command palette for quick access
- Right-click context menus for contextual actions

### Best Practices
- Keep cards focused on single concepts
- Use consistent naming conventions
- Link related cards with appropriate relation types
- Update cards as understanding evolves

### When to Use Each Card Type
- **SymbolCard**: Specific functions, classes, variables
- **FlowCard**: Processes, workflows, sequences
- **BugCard**: Bugs, issues, investigations
- **ConceptCard**: Architecture patterns, design decisions
- **DecisionCard**: Choices made with rationale
- **QuestionCard**: Open questions, TODOs

### Canvas Organization Tips
- Group related cards spatially
- Use consistent edge types
- Leave space for future additions
- Use viewport to focus on relevant areas
