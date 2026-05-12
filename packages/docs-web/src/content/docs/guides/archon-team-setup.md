---
title: Archon Team Setup
description: Share repo-local Archon workflows, commands, scripts, and progress through Git while keeping runtime state local.
category: guides
area: workflows
audience: [user]
status: current
sidebar:
  order: 8
---

Use repo-local `.archon/` files for team-shared Archon behavior. Use user-local Archon and Codex folders for runtime state, secrets, and personal automation.

## What to version

Commit reusable Archon setup in the parent Git repository:

- `.archon/workflows/`
- `.archon/commands/`
- `.archon/scripts/`
- safe MCP config examples such as `.archon/mcp/ui-stack-official.json`
- queue or progress files that are intended as team-visible ledgers
- project packages used by those workflows, such as `packages/ui-lab/`

Do not open or commit a nested `.archon/scripts/...` folder as though it were its own repository. Open the parent repository in Git tools.

## What stays local

Keep runtime and user-specific state out of Git:

- `.archon/state/`
- `.archon/logs/`
- `.archon/artifacts/`
- `.archon/bmad/*.lock`
- `~/.archon/`
- `~/.codex/automations/`

Workflow lock files represent active local execution. They should not be committed or used as team state.

## Branch-only sharing

To share setup without opening a pull request, push a branch:

```bash
git checkout codex/mcp-capability-awareness
git status --short
git add .archon/workflows .archon/scripts .archon/commands
git add .archon/mcp/ui-stack-official.json
git add .archon/bmad/ui-lab-components.queue.json
git add .archon/ralph/ui-lab packages/ui-lab
git commit -m "feat: add team-shareable Archon UI-lab automation"
git push -u origin codex/mcp-capability-awareness
```

Use explicit `git add` paths. Do not use `git add .` when the working tree contains unrelated local changes.

Team members can consume the branch:

```bash
git fetch origin
git checkout codex/mcp-capability-awareness
```

## UI-lab workflow

Run the UI-lab component automation from the repository root:

```bash
bun run cli workflow run ui-lab-component-loop --no-worktree "Implement every pending @archon/ui-lab component variant until queue is complete"
```

Check progress:

```bash
bun .archon/scripts/ui-lab/status.ts
```

The queue file is the team-visible progress ledger:

```text
.archon/bmad/ui-lab-components.queue.json
```

Commit queue snapshots after meaningful batches, such as completed components or blocked items with sanitized evidence.

## Local watchdog automation

Codex Desktop automations live in the user's local Codex config and are not shared by Git. Each teammate can create their own watchdog using this policy:

- cwd: repository root
- model: `gpt-5.5`
- cadence: hourly
- action: run `ui-lab-component-loop` only when no `.archon/bmad/ui-lab-components.queue.lock` exists and the queue has pending items

The shared workflow is versioned in Git. The schedule that invokes it is personal local setup.

## Validation

Before pushing team setup, run:

```bash
bun run cli validate workflows ui-lab-component-loop --json
bun .archon/scripts/ui-lab/status.ts
git status --short
```

Verify no runtime files, lock files, secrets, or personal automation files are staged.
