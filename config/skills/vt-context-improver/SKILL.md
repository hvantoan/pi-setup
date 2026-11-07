---
name: vt-context-improver
description: Audit, evaluate, score, and improve OMP context files (AGENTS.md, CLAUDE.md, .omp/AGENTS.md) and sticky rules (.omp/RULES.md) across a codebase. Use when the user asks to check, audit, update, improve, or fix CLAUDE.md, AGENTS.md, or RULES.md files, manage project memory conventions, configure sticky rules, or optimize repo context for Oh My Pi (OMP) CLI.
tools: read, glob, grep, bash, edit, write
---

# OMP Context & Rules Improver (`vt-context-improver`)

Audit, evaluate, score, and improve project context files (`AGENTS.md`, `CLAUDE.md`, `.omp/AGENTS.md`) and sticky rules (`.omp/RULES.md`, `RULES.md`) to provide Oh My Pi (OMP) CLI and coding agents with optimal, modular, and non-bloated project memory.

**This skill can write to context and rule files.** After presenting an OMP-focused quality report and getting user approval, it applies targeted improvements and establishes clean boundaries between context, sticky rules, and autonomous memory.

> **Relation to other skills:**
> - `ak-docs`: Broad codebase documentation suite (init, update, summarize, agent-context, agents, llms).
> - `vt-context-improver`: Dedicated, quantitative scoring audit (grades A–F), shadowing conflict resolution, sticky rules extraction (`RULES.md`), and memory bloat prevention for OMP.
> - `ak-folder-context`: Specialized in creating subfolder-scoped context files.

---

## Core Philosophy for OMP CLI

Unlike environments that dump all instructions, rules, and session learnings into a monolithic `CLAUDE.md`, OMP CLI has a structured 3-tier memory and context architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          OMP MEMORY & CONTEXT                          │
├────────────────────────┬───────────────────────┬───────────────────────┤
│ 1. Context Files       │ 2. Sticky Rules       │ 3. Autonomous Memory  │
│ (.omp/AGENTS.md,       │ (.omp/RULES.md,       │ (learned.md,          │
│  CLAUDE.md, AGENTS.md) │  RULES.md)            │  MEMORY.md)           │
├────────────────────────┼───────────────────────┼───────────────────────┤
│ • Injected at session  │ • Injected near EVERY │ • Handled via `learn` │
│   start in <repo-rules>│   turn (always-apply) │   tool & backends     │
│ • Architecture, build/ │ • Short, hard         │ • Transient learnings,│
│   test commands, stack │   invariants, supreme │   bug fixes, gotchas  │
│ • Modular via `@path`  │   constraints         │ • NEVER bloat context │
│   imports              │ • Non-negotiable      │   files with these    │
└────────────────────────┴───────────────────────┴───────────────────────┘
```

### Key Principles
1. **Separation of Invariants**: Do not bury non-negotiable rules (e.g. "Never commit to main", "Vietnamese with diacritics", "Always use primary constructor") inside a 500-line `CLAUDE.md`. Put hard constraints in `.omp/RULES.md` where OMP guarantees they stay visible across long conversations.
2. **Modularity via `@` Imports**: OMP supports `@path` syntax (up to 5 hops recursive). Large architectural specs, API contracts, or deep domain guides belong in `docs/` and should be referenced with `@docs/...`, keeping the root context file concise (< 200–300 lines).
3. **Autonomous Memory Hygiene**: Do not dump one-off session fixes, dynamic environment quirks, or debugging discoveries into `CLAUDE.md`. Direct transient learnings to OMP's `learn` tool (which stores in `learned.md` or Mnemopi/Hindsight memory backends).
4. **Provider Precedence Awareness**:
   - `native` (Priority 100): `.omp/AGENTS.md` (Project: nearest non-empty `.omp/`), `~/.omp/agent/AGENTS.md` (User).
   - `claude` (Priority 80): `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`.
   - `agents-md` (Priority 10) & `claude-md` (Priority 10): Standalone `AGENTS.md` / `CLAUDE.md`.
   - *Awareness*: A native `.omp/AGENTS.md` completely shadows a standalone `CLAUDE.md` at the same scope!

---

## Workflow

### Phase 1: Discovery & Shadowing Audit

Scan for all context files, sticky rules, and subfolder instructions across the repository:

```bash
# Locate context files and rules
find . -maxdepth 4 \( \
  -name "AGENTS.md" -o \
  -name "CLAUDE.md" -o \
  -name "RULES.md" -o \
  -name ".claude.md" -o \
  -name ".claude.local.md" -o \
  -name "copilot-instructions.md" \
\) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null
```

Also check user-level defaults:
- Native: `~/.omp/agent/AGENTS.md` and `~/.omp/agent/RULES.md`
- Claude: `~/.claude/CLAUDE.md`

**Determine Effective Precedence & Shadowing:**
- Identify which file OMP actually loads at root and subdirectories.
- Flag if a higher-priority file is accidentally shadowing intended instructions.
- Flag if a `.omp/RULES.md` exists or is missing for projects with strict behavioral rules.

---

### Phase 2: Quality Assessment

Evaluate each context file against OMP quality criteria. See [references/quality-criteria.md](references/quality-criteria.md) for detailed scoring rubrics.

**Quick Assessment Checklist:**

| Criterion | Weight | OMP Check |
|-----------|--------|-----------|
| **Commands & Workflows** | 20% | Are build, test, lint, run commands documented and copy-paste ready? (Docker isolation, test filters noted?) |
| **Architecture & Tech Stack** | 20% | Clear directory map, framework versions (.NET 8, React 19, etc.), entry points, data flow? |
| **Sticky Rules Separation** | 15% | Are supreme/hard invariants extracted into `.omp/RULES.md` instead of buried in a long file? |
| **Modularity & `@` Imports** | 15% | Does it use `@path` imports for deep docs? Is the root file concise (< 400 lines)? |
| **Memory Hygiene** | 15% | Free of one-off session learnings, obsolete bug narratives, and temporary logs? |
| **Currency & Actionability** | 15% | Accurate commands, valid paths, zero theoretical fluff or generic AI boilerplate? |

**Quality Grades:**
- **A (90–100)**: Optimal OMP setup: concise root context, clean sticky rules in `RULES.md`, `@` imports used for deep docs.
- **B (70–89)**: Solid content, minor bloat, or hard rules not yet split into `RULES.md`.
- **C (50–69)**: Basic information present, but monolithic, outdated commands, or cluttered with session notes.
- **D (30–49)**: Severely outdated, missing commands, or high volume of generic filler.
- **F (0–29)**: Broken commands, missing essential context, or completely empty.

---

### Phase 3: Quality Report Output

**ALWAYS output the quality report BEFORE proposing or making any updates.**

Format:

```markdown
## OMP Context & Rules Quality Report

### Summary
- Files scanned: X (Context: Y, Sticky Rules: Z)
- Active Context Provider: [e.g. `native` (.omp/AGENTS.md) | `claude-md` (./CLAUDE.md)]
- Sticky Rules Status: [Configured (.omp/RULES.md) | Missing]
- Average Score: XX/100

### Findings & Shadowing Analysis
- **Active File**: `./CLAUDE.md` (Loaded by OMP via `claude-md` provider)
- **Shadowing**: [None | `./CLAUDE.md` shadowed by `.omp/AGENTS.md`]
- **Structure**: [Monolithic | Modular with @ imports]

### File-by-File Assessment

#### 1. ./CLAUDE.md (or .omp/AGENTS.md)
**Score: XX/100 (Grade: X)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands & Workflows | X/20 | ... |
| Architecture & Stack | X/20 | ... |
| Sticky Rules Separation | X/15 | ... |
| Modularity & `@` Imports | X/15 | ... |
| Memory Hygiene | X/15 | ... |
| Currency & Actionability | X/15 | ... |

**Key Issues:**
- [Issue 1: Hard rules buried in body where compaction can drop them]
- [Issue 2: Session bug fix documented in context instead of OMP memory]
- [Issue 3: Architecture section too detailed; candidate for @docs/architecture.md]

**Recommended Actions:**
- [Action 1: Extract invariants into `.omp/RULES.md`]
- [Action 2: Modularize deep docs via `@` imports]
- [Action 3: Clean up transient learnings]
```

---

### Phase 4: Targeted Proposals

After presenting the report, propose concrete, targeted diffs and new files.

**OMP Update Guidelines:**
1. **Extract Hard Rules to `.omp/RULES.md`**:
   - If the project has hard negative constraints ("Never commit to main", "No tabs", "Always Vietnamese with diacritics"), extract them into `.omp/RULES.md`.
2. **Use `@` Imports for Deep Documentation**:
   - When a section (e.g. full database schema, complex deployment guide) exceeds 50 lines, suggest moving it to `docs/<topic>.md` and referencing it via `@docs/<topic>.md`.
3. **Cleanse Memory Bloat**:
   - Identify transient learnings or fixed bugs; remove them from the context file and explain that OMP handles dynamic knowledge via the `learn` tool and autonomous memory.
4. **Preserve Existing Style & Language**:
   - Maintain the language convention established in the project (e.g. Vietnamese with diacritics if specified in repo rules).

**Diff & File Proposals:**

```markdown
### Action 1: Create `.omp/RULES.md` (Sticky Invariants)

**Why:** Ensures non-negotiable rules remain visible across long conversations.

```markdown
# Sticky Rules

- Luôn trả lời bằng tiếng Việt có dấu.
- Tuyệt đối không commit trực tiếp lên branch main/master/dev.
- Không sửa migration đã apply; luôn tạo migration mới.
```

### Action 2: Update `./CLAUDE.md` (or `AGENTS.md`)

**Why:** Streamline commands and remove transient bug fix notes.

```diff
- ## Bug Fix 2026-08-12
- Đã sửa lỗi kết nối DB bằng cách thêm connection timeout 30s.
```
```

---

### Phase 5: Apply Updates

After explicit user approval:
1. Apply edits using the `edit` tool.
2. Create any new files (such as `.omp/RULES.md` or `docs/*.md`) using the `write` tool.
3. Validate syntax and ensure all `@` import paths exist on disk.

---

## Templates

See [references/templates.md](references/templates.md) for ready-to-use OMP templates:
- **Template 1**: OMP Native (.omp/AGENTS.md + .omp/RULES.md)
- **Template 2**: Standalone CLAUDE.md / AGENTS.md (OMP compatible, `@` imports)
- **Template 3**: Dedicated `.omp/RULES.md`
- **Template 4**: Monorepo Subdirectory context

## Reference Documentation

- Quality Criteria & Scoring: [references/quality-criteria.md](references/quality-criteria.md)
- Context Update Guidelines: [references/update-guidelines.md](references/update-guidelines.md)
- Templates: [references/templates.md](references/templates.md)
