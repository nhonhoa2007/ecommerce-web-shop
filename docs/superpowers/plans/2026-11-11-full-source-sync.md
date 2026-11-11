# Full Source Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the tracked application code and supporting project files in `ecommerce-web-shop` match the current committed `shop-qr-payment` source while retaining the target repository history and its unique progress plans.

**Architecture:** Import the source commit's tracked tree into an isolated clone, remove target-only runtime/test files superseded by source, and preserve target-only progress documents. Validate file parity by content hashes and run the project's verification command before applying the same change to the target repository.

**Tech Stack:** Next.js 16, TypeScript, Prisma, Node.js, Git.

**Spec:** User request on 2026-11-11 to import all remaining source code, with prior requirement that final code match the original project and remain free of errors or conflicts.

## Global Constraints

- Source: `/home/nhonhoa/shop-qr-payment` committed `master` tree; do not include untracked files or private `.env`.
- Target: `/home/nhonhoa/ecommerce-web-shop` local `main`; preserve its Git history and target-only progress plans.
- Commit messages use Conventional Commits in English, without AI attribution.
- No push is requested.

## Review Focus

- Missing source files after overlay: compare Git-tracked path and SHA-256 manifests.
- Stale target-only runtime files: remove them to prevent duplicate or dead behavior.
- Missing dependencies or Prisma client drift: run package and build verification.
- Unexpected tracked secrets or generated files: import only Git-tracked source content and inspect the staged file list.
- Existing target-only progress documents: preserve and confirm they remain tracked.

---

### Task 1: Import committed source tree

**Files:** Source tracked files across `src`, `prisma`, `public`, `scripts`, `tests`, project configuration, design and documentation paths.

- [ ] Record source and target commit hashes and clean tracked status.
- [ ] Overlay `git archive HEAD` from source into isolated target clone.
- [ ] Remove target-only runtime and test files absent from source.
- [ ] Compare all imported tracked file hashes with source.

### Task 2: Verify integrated project

**Files:** Imported project files.

- [ ] Restore dependencies from the source lockfile, generate Prisma client, and run `npm run verify` in isolation.
- [ ] Investigate and fix only concrete failures caused by the sync; repeat verification.
- [ ] Check target-only progress documents and Git diff for unintended deletions or secrets.

### Task 3: Apply and commit

**Files:** Same reviewed diff in `/home/nhonhoa/ecommerce-web-shop`.

- [ ] Apply the verified sync through the sandbox approval boundary.
- [ ] Run parity comparison and `npm run verify` in the target checkout.
- [ ] Commit with a Conventional Commit message and confirm a clean working tree.
