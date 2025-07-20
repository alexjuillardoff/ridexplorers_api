# Contributor Guide

## Dev Environment Tips
- Use pnpm dlx turbo run where <project_name> to jump to a package instead of scanning with ls.
- Run pnpm install --filter <project_name> to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use pnpm create vite@latest <project_name> -- --template react-ts to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing Instructions
- Find the CI plan in the .github/workflows folder.
- Run pnpm turbo run test --filter <project_name> to run every check defined for that package.
- From the package root you can just call pnpm test. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: pnpm vitest run -t "<test name>".
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run pnpm lint --filter <project_name> to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
Title format: [<project_name>] <Title>

## Prompting Codex
Just like ChatGPT, Codex is only as effective as the instructions you give it. Here are some tips we find helpful when prompting Codex:

### Provide clear code pointers
Codex is good at locating relevant code, but it's more efficient when the prompt narrows its search to a few files or packages. Whenever possible, use greppable identifiers, full stack traces, or rich code snippets.

### Include verification steps
Codex produces higher-quality outputs when it can verify its work. Provide steps to reproduce an issue, validate a feature, and run any linter or pre-commit checks. If additional packages or custom setups are needed, see Environment configuration.

### Customize how Codex does its work
You can tell Codex how to approach tasks or use its tools. For example, ask it to use specific commits for reference, log failing commands, avoid certain executables, follow a template for PR messages, treat specific files as AGENTS.md, or draw ASCII art before finishing the work.

### Split large tasks
Like a human engineer, Codex handles really complex work better when it's broken into smaller, focused steps. Smaller tasks are easier for Codex to test and for you to review. You can even ask Codex to help break tasks down.

### Leverage Codex for debugging
When you hit bugs or unexpected behaviors, try pasting detailed logs or error traces into Codex as the first debugging step. Codex can analyze issues in parallel and could help you identify root causes more quickly.

### Try open-ended prompts
Beyond targeted tasks, Codex often pleasantly surprises us with open-ended tasks. Try asking it to clean up code, find bugs, brainstorm ideas, break down tasks, write a detailed doc, etc.
