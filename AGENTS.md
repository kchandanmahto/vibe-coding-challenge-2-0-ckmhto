 

## Academy Desk â€” Project Instructions

### 1. Project Overview

Academy Desk is a mobile-first sports academy management web application.

### 2. Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- Mongoose
- Next.js Route Handlers
- Auth.js
- Zod
- Vitest
- Playwright

Do not introduce another backend framework without approval.

### 3. Architecture Rules

- Follow modular monolith architecture.
- Keep database operations on the server.
- Never expose database credentials or secrets to the browser.
- Separate business logic from API route handlers.
- Use reusable components.
- Validate all external inputs using Zod.
- Follow existing project folder conventions.
- Avoid unnecessary dependencies.

### 4. User Roles

The application has four primary roles:

1. Head Coach
2. Coach
3. Player
4. Scout

Implement role-based permissions on the server. Never rely only on frontend restrictions.

### 5. Development Rules

- Read relevant documentation before implementing features.
- Read the relevant installed Next.js documentation before using unfamiliar APIs.
- Review existing code before modifying files.
- Follow TypeScript strict typing.
- Do not use `any` unnecessarily.
- Do not duplicate existing functionality.
- Do not silently change business requirements.
- Ask for clarification when requirements are ambiguous.

### 6. UI and UX Rules

- Mobile-first responsive design.
- Consistent spacing, typography and colors.
- Accessible forms and navigation.
- Clear loading, error and empty states.
- Reusable UI components.
- Tables must remain usable on mobile.

### 7. Security Rules

- Enforce authentication and authorization server-side.
- Protect academy-specific data.
- Hash passwords securely.
- Validate user input.
- Prevent unauthorized record access.
- Never commit API keys, passwords or secrets.
- Maintain audit logs for sensitive operations.

### 8. Testing Rules

- Write unit tests for business logic.
- Write integration tests for APIs and database operations.
- Write E2E tests for important user workflows.
- Run lint, TypeScript and relevant tests before marking a feature complete.
- Never claim a feature is tested without actually running its tests.

### 9. AI Coding Workflow

Follow this workflow:

Think â†’ Plan â†’ Prompt â†’ Review â†’ Implement â†’ Test â†’ Review â†’ Commit â†’ Document.

Save important AI prompts in the `prompts/` directory.

### 10. Documentation

Keep these documents updated when requirements change:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPECIFICATION.md`
- `docs/SECURITY.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/TESTING.md`
- `docs/CHANGELOG.md`

### 11. Git Rules

- Use meaningful commit messages.
- Do not commit secrets or generated build folders.
- Do not overwrite unrelated user changes.
- Review Git diff before committing.

### Golden Rule

Build Academy Desk incrementally. Prioritize correctness, security, maintainability and user experience over development speed.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
