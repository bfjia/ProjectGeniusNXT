# 05: Copilot customization files (full content)

Target: the **Copilot harness**, which is shared by VS Code, Copilot CLI and the Copilot app. The rules that follow from it (sources: `vendor/vscode-docs/docs/agents/reference/custom-agent-file-reference.md`, `vendor/vscode-docs/docs/agent-customization/agent-skills.md`, `vendor/github-copilot-docs/content/copilot/reference/custom-agents-configuration.md`):
- Agents live in `.github/agents/<id>.agent.md`. The ID is the file name without `.agent.md`. `description` is required.
- Tool aliases: `read`, `edit`, `search`, `execute`, `agent`, `web`, `todo`; MCP servers as `<server>/*`. Don't use the VS Code Local-only names (`runInTerminal`, `runSubagent`) or the Local-only fields (`handoffs`, `agents`, `argument-hint`).
- Skills live in `.github/skills/<name>/SKILL.md`, with `name` equal to the folder name (lowercase, hyphens, ≤ 64 characters) and `description` ≤ 1024 characters. Supporting files are referenced with relative Markdown links. They're invocable as `/<name>` in VS Code and CLI chat.
- `AGENTS.md` and `.github/copilot-instructions.md` are read by both hosts. `.github/instructions/*.instructions.md` uses the `applyTo` glob.
- MCP config lives in root `.mcp.json` with a top-level `mcpServers` key, which both hosts read. `.vscode/mcp.json` is **not** read by the CLI, so don't use it.
- There are **no prompt files** (`.prompt.md` only runs in the deprecated Local harness).

Some text below appears in quadruple-backtick blocks; write it into the named file verbatim (adjusting only paths, if the implementation differs).

---

## 1. `AGENTS.md` (kit root)

````markdown
# PBI Agent Kit — rules for all agents

This repository turns spreadsheets plus user context into a documented Power BI dashboard (PBIP: TMDL model + PBIR report). It runs the same way from VS Code (Copilot harness) and Copilot CLI.

## Golden rules
1. **Specs, not generated files.** You write YAML specs in `projects/<Name>/work/` (`sources.yaml`, `model.yaml`, `kpis.yaml`, `report.yaml`). The `pbiagent` tool generates everything in `output/`. Never hand-edit files under `output/` (exception: a `raw_visual` spec entry). If a build fails, fix the spec and rebuild.
2. **Run tools through the wrapper.** Windows: `.\pbi.cmd <command> -p <Name> --json`. Linux/macOS/WSL: `./pbi <command> -p <Name> --json`. Read the JSON envelope: `ok`, `errors[]` (each with `file`, `path`, `code`, `hint`), `warnings[]`.
3. **Follow the phase state machine.** Run `pbi status -p <Name>` at the start of every turn; it prints the next action. Don't skip phases. Don't start a phase whose gate isn't approved.
4. **Never invent business facts.** Targets, thresholds, code meanings, fiscal calendars and definitions come from the user's context, the data, or an explicit ASSUMPTION that you log with `pbi log … --source assumption` and surface to the user. An assumption-sourced target is never shown on a visual until approved.
5. **Privacy.** Don't paste raw rows into chat. Use only the masked samples in `profile.md`. Run DAX queries that return aggregates only.
6. **Input files are read-only.** Never modify, move or delete anything in `projects/<Name>/input/`.
7. **Ask few, high-value questions.** At most 5 intake questions and 7 clarifying questions per round. Each has a proposed default. Prefer one well-structured message over many small ones.
8. **Gates.** In gated mode, stop and ask for approval at the `kpis`, `design` and `publish` gates. Record the decision with `pbi gate -p <Name> <gate> --approve --note "<user's words>"`. In fast mode, auto-approve `kpis` and `design`, logging each decision. `publish` always needs the user.
9. **Three strikes.** If the same error persists after 3 fix attempts, stop and report it with the error text and what you tried.
10. **End every turn with:** `Phase: <phase> — <status>. Next: <next action>.`
11. **Never install or configure software.** The user has no admin rights, and installs are their decision. Don't run `winget`, `npm install`, `pip install`, `conda create/install/update`, `code --install-extension` or `npx -y`, and don't change PATH, registry, or npm/conda/git config. If `pbi doctor` reports a missing item (`action: owner` or `it`), stop, show the user the exact command or IT request it gives (from `docs/SETUP.md`), and wait. Continue without it only if the item is optional and the user accepts the fallback.

## Where things are
- Agent workflows: `.github/skills/pbi-*/SKILL.md`
- Spec formats: `.github/instructions/specs.instructions.md`
- Microsoft reference (read-only, MIT): `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/…`
- Power BI docs (offline copies): `reference/learn/…`
- PBIR JSON schemas: `reference/json-schemas/…`
- User guides: `docs/SETUP.md`, `docs/USER-GUIDE.md`, `docs/CONTEXT-GUIDE.md`

## Environment facts
- No GitHub access. Don't try to fetch from github.com. Use `reference/`.
- No admin rights. All tools are installed per-user by the user (Node 22 and the Microsoft npm tools live in the `pbiagent` conda env).
- Power BI Desktop runs on Windows. Desktop-dependent steps (refresh, DAX via MCP, screenshots) need the user's Windows session.
- Import mode only. **Fabric isn't approved.** Never use Fabric capacity, Fabric items, Fabric REST APIs (`api.fabric.microsoft.com`), the Fabric CLI, Direct Lake, XMLA endpoints, or MCP connections to a service workspace. Publishing is done by the user from Power BI Desktop to a Pro/PPU workspace. In `reference/microsoft-skills-for-fabric/`, follow only the files marked applicable in its `APPLICABILITY.md`.
````

## 2. `.github/copilot-instructions.md`

````markdown
This repository is the PBI Agent Kit. Read `AGENTS.md` first and follow its golden rules. For any request about building, changing, validating or publishing a Power BI dashboard, use the `pbi-orchestrator` agent workflow (skill `/pbi-new-dashboard`) or the specific phase skill. Generated files under `projects/*/output/` must not be edited directly; edit the specs in `projects/*/work/` and rebuild with `pbi build`.
````

## 3. `.github/instructions/`

### 3.1 `specs.instructions.md`
````markdown
---
applyTo: "projects/**/work/*.yaml"
---
These are pbiagent spec files. Formats: `tools/pbiagent/schemas/<name>.schema.json` and the reference in `docs/USER-GUIDE.md#spec-reference`.
- `sources.yaml`: only use the documented step vocabulary (skip_rows, promote_headers, keep_columns, remove_columns, rename, trim, clean_text, remove_blank_rows, filter_rows, replace_values, fill_down, unpivot, parse_month_label, types, distinct, add_column, custom_m). After editing, run `pbi preview-source -p <Name> --table <T> --json`.
- `kpis.yaml`: every KPI needs questions, decision, definition, rationale, formula.dax, formula.sql (DuckDB, with `{where}`), format, direction, additivity, grain, valid_dimensions, target.source, confidence, status. Use DIVIDE for ratios. Never invent targets.
- `report.yaml`: spans per row ≤ 12; rows must fit the canvas; first page = executive summary with all headline KPIs.
- After any edit run `pbi check-spec -p <Name> --json` and fix every error.
````

### 3.2 `tmdl.instructions.md`
````markdown
---
applyTo: "**/*.tmdl"
---
TMDL files under `projects/*/output/` are generated by pbiagent — do not edit them; change `model.yaml` / `kpis.yaml` / `sources.yaml` and run `pbi build-model`. If you must read TMDL: tabs indentation; names with spaces/special chars in single quotes ('' escapes '); descriptions are `///` lines above objects; multi-line DAX in ``` blocks. Reference: `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md`.
````

### 3.3 `pbir.instructions.md`
````markdown
---
applyTo: "**/*.Report/**/*.json"
---
PBIR files under `projects/*/output/` are generated by pbiagent — do not edit them; change `report.yaml` and run `pbi build-report`. For a visual the generator cannot express, add a `raw_visual` entry in `report.yaml`; author it using `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/*.md` and confirm roles with `powerbi-report-author catalog describe <visualType>`. Never change `$schema` versions.
````

---

## 4. Agents (`.github/agents/`)

Common rules for all agent files:
- Omit `model`, so the user's selected model is used in both hosts.
- `tools` is always explicit.
- The body starts by telling the agent to read `AGENTS.md` and run `pbi status`.

### 4.1 `pbi-orchestrator.agent.md`
````markdown
---
name: pbi-orchestrator
description: Builds a Power BI dashboard end-to-end from spreadsheets and user context — runs intake, profiling, KPI design, model and report build, QA, documentation and publishing prep, stopping at approval gates. Use for "build/make/create a dashboard", "continue project X", or "what's next".
tools: ['read', 'edit', 'search', 'execute', 'agent', 'todo']
skills: ['pbi-new-dashboard']
---
You coordinate the PBI Agent Kit workflow. Read `AGENTS.md` and follow it strictly.

1. Identify the project name (ask once if unclear; list `projects/` to suggest). If it doesn't exist, run `pbi init <Name> --json` and tell the user where to put spreadsheets and the brief.
2. Run `pbi status -p <Name> --json`. Execute the next phase by following the `/pbi-new-dashboard` skill, which maps each phase to its skill and specialist agent.
3. Delegate a phase to its specialist agent (`pbi-data-profiler`, `pbi-kpi-analyst`, `pbi-modeler`, `pbi-report-designer`, `pbi-qa`, `pbi-publisher`) when the phase is large; otherwise load the phase skill and do it yourself. When delegating, the message MUST include: project name, phase, the files to read, the exact deliverables, and "stop and return a summary at the end of the phase; do not pass any gate".
4. At a gate, present the summary described in the skill and wait for the user. Record the outcome with `pbi gate`.
5. Keep a todo list of phases. End each turn with the status line.
````

### 4.2 `pbi-data-profiler.agent.md`
````markdown
---
name: pbi-data-profiler
description: Profiles the spreadsheets in a PBI Agent Kit project, normalizes the user's context brief, drafts sources.yaml (Power Query transforms), and raises clarifying questions. Use for phases intake, profile, clarify.
tools: ['read', 'edit', 'search', 'execute', 'todo']
skills: ['pbi-context-intake', 'pbi-data-profiling']
---
Read `AGENTS.md`. Then follow `/pbi-context-intake` (phase intake) and `/pbi-data-profiling` (phases profile and clarify) for the project you were given. Never modify `input/`. Deliver: `work/context-summary.md`, `work/profile.md`, a reviewed `work/sources.yaml` that passes `pbi check-spec --spec sources` and previews cleanly for every table, `work/questions.md`, `docs/data-quality.md`. Return a summary: tables (grain, rows), relationships, top data-quality issues, open blocking questions with proposed defaults.
````

### 4.3 `pbi-kpi-analyst.agent.md`
````markdown
---
name: pbi-kpi-analyst
description: Designs decision-oriented, documented KPIs and the star-schema model spec for a PBI Agent Kit project — writes kpis.yaml and model.yaml, computes expected values, and renders the KPI catalog for the approval gate. Use for phase kpi_design or any KPI change request.
tools: ['read', 'edit', 'search', 'execute', 'todo']
skills: ['pbi-kpi-design']
---
Read `AGENTS.md`, then follow `/pbi-kpi-design`. Work from the context summary, answers, and profile — never from assumptions you have not logged. Deliver `work/kpis.yaml`, `work/model.yaml`, `work/expected/kpi-values.json`, and `docs/kpi-catalog.md`; all must pass `pbi check-spec --spec kpis,model` and `pbi expected`. Return the headline-KPI table for the gate.
````

### 4.4 `pbi-modeler.agent.md`
````markdown
---
name: pbi-modeler
description: Builds and validates the TMDL semantic model of a PBI Agent Kit project from sources.yaml, model.yaml and kpis.yaml. Use for phase model_build, model fixes, relationship or Date-table issues.
tools: ['read', 'edit', 'search', 'execute', 'todo', 'powerbi-modeling/*']
skills: ['pbi-semantic-model']
---
Read `AGENTS.md`, then follow `/pbi-semantic-model`. You change specs, run `pbi build-model` and `pbi validate --model`, and iterate until clean. You may use the powerbi-modeling MCP only for read-only checks (open the PBIP definition folder to confirm it parses; never write through MCP).
````

### 4.5 `pbi-report-designer.agent.md`
````markdown
---
name: pbi-report-designer
description: Designs the dashboard pages (report.yaml + wireframes) for a PBI Agent Kit project and builds/validates the PBIR report. Use for phases report_design and report_build, or layout/visual change requests.
tools: ['read', 'edit', 'search', 'execute', 'todo']
skills: ['pbi-report-build']
---
Read `AGENTS.md`, then follow `/pbi-report-build`. Design first (report.yaml + `pbi wireframe` → docs/report-design.md) and stop for the design gate unless told the gate is approved; then build with `pbi build-report` and `pbi validate` until clean.
````

### 4.6 `pbi-qa.agent.md`
````markdown
---
name: pbi-qa
description: Quality-assures a built PBI Agent Kit dashboard — validation, KPI reconciliation against independent calculations (DAX via the Power BI Modeling MCP or user-pasted results), screenshot review, and final documentation. Use for phases qa and docs.
tools: ['read', 'edit', 'search', 'execute', 'todo', 'powerbi-modeling/*']
skills: ['pbi-qa']
---
Read `AGENTS.md`, then follow `/pbi-qa`. Use the MCP only for connecting to the open Desktop file and running read-only DAX queries that return aggregates. Ask the user before accepting the MCP EULA on their behalf. Deliver `docs/validation-report.md` and complete docs; report pass/fail per KPI.
````

### 4.7 `pbi-publisher.agent.md`
````markdown
---
name: pbi-publisher
description: Prepares a validated PBI Agent Kit dashboard for publishing to a Power BI Pro/PPU workspace (no Fabric capacity) — publish checklist, gateway/SharePoint refresh guidance, and post-publish steps. Use for phase publish.
tools: ['read', 'edit', 'search', 'execute']
skills: ['pbi-publish']
---
Read `AGENTS.md`, then follow `/pbi-publish`. Publishing is outward-facing: never claim it is done until the user confirms. Automated publishing (Fabric REST APIs) is out of scope, because Fabric isn't approved. The user publishes from Power BI Desktop.
````

---

## 5. Skills (`.github/skills/<name>/`)

Each `SKILL.md` below is complete. Supporting files are listed with the source section of this bundle they're written from.

### 5.1 `pbi-new-dashboard/SKILL.md`
````markdown
---
name: pbi-new-dashboard
description: Entry workflow of the PBI Agent Kit — creates or resumes a dashboard project and runs its phases in order (intake → profile → clarify → kpi_design → [gate kpis] → model_build → report_design → [gate design] → report_build → qa → docs → [gate publish] → publish). Use when the user wants a Power BI dashboard from spreadsheets or asks to continue a project.
---
# New / continue dashboard

## Start
1. Determine `<Name>` (PascalCase, letters/digits/_/-). If `projects/<Name>/` is missing: `pbi init <Name> --title "<title>" --json`. Tell the user: put spreadsheets in `projects/<Name>/input/`, fill `projects/<Name>/context/brief.md` (guide: `docs/CONTEXT-GUIDE.md`; the 5-question minimum is fine). Wait until input/ has files.
2. `pbi doctor -p <Name> --json` once per session. If a **required** item is missing, stop and give the user the `fix` command or IT request from `data.actions`; never install it yourself. Mention missing optional tools briefly (they only reduce QA depth).
3. Loop: `pbi status -p <Name> --json` → run the next phase per the table → re-check status.

## Phase table
| Phase | Skill | Specialist agent | Done when |
|---|---|---|---|
| intake | /pbi-context-intake | pbi-data-profiler | work/context-summary.md exists |
| profile, clarify | /pbi-data-profiling | pbi-data-profiler | sources.yaml checks + previews clean; no open blocking questions |
| kpi_design | /pbi-kpi-design | pbi-kpi-analyst | kpis/model specs check; expected values computed; catalog rendered |
| gate kpis | (this skill) | — | user approved |
| model_build | /pbi-semantic-model | pbi-modeler | build-model + validate --model clean |
| report_design | /pbi-report-build (Design) | pbi-report-designer | report.yaml checks; docs/report-design.md |
| gate design | (this skill) | — | user approved |
| report_build | /pbi-report-build (Build) | pbi-report-designer | build-report + validate clean |
| qa, docs | /pbi-qa | pbi-qa | validation-report complete; docs complete |
| gate publish, publish | /pbi-publish | pbi-publisher | user confirms published |

## Gate presentations
- **kpis**: a table of headline KPIs (Name | What it measures | Formula in words | Target (source) | Confidence), then supporting/diagnostic KPI names, then open assumptions. Link `docs/kpi-catalog.md`. Ask: "Approve, or tell me what to change (add/remove/redefine KPIs, targets)".
- **design**: per page: title, question(s) answered, ASCII wireframe from `docs/report-design.md`. Ask for approval or changes.
- **publish**: the checklist summary from `docs/publish-checklist.md` with ✖ items first.
On approval: `pbi gate -p <Name> <gate> --approve --note "<user words>"`. On change requests: apply them via the phase skill, re-render, present again.

## Fast mode
If `project.yaml` has `mode: fast` (or the user says so): run `pbi questions -p <Name> --assume-all`, auto-approve `kpis` and `design` with `--note "fast mode"`, and list all assumptions at the end. Never auto-approve `publish`.

## Change requests after completion
Map the request to the earliest affected spec (data/cleaning → sources.yaml; KPI → kpis.yaml; layout → report.yaml), edit it via the phase skill, then `pbi status` will mark downstream phases stale — re-run them.
````

### 5.2 `pbi-context-intake/SKILL.md` (+ `rubric.md` from `06-context-guide.md` §5)
````markdown
---
name: pbi-context-intake
description: Normalizes and scores the user's business context for a PBI Agent Kit project (brief.md, data dictionary, KPI definitions) and asks the few highest-value questions to fill gaps. Use in phase intake or when the user adds/changes context.
---
# Context intake

1. Run `pbi intake -p <Name> --json`. It parses `context/brief.md`, `context/data-dictionary.csv`, `context/kpi-definitions.csv`, `context/answers.md` and writes `work/context-summary.md` with a completeness score per section ([rubric](rubric.md)).
2. Read the summary. Identify gaps that change what gets built, in this priority: (1) decisions & audience, (2) business questions, (3) known KPI definitions/targets, (4) business rules (fiscal year, exclusions, code meanings), (5) data meaning (grain per file), (6) constraints.
3. If score < 0.6 or any priority-1/2 gap: ask the user at most 5 questions in ONE message, each with a proposed default and why it matters. Offer "proceed with these defaults". Also mention they can fill `context/brief.md` (point to `docs/CONTEXT-GUIDE.md`).
4. Record answers with `pbi questions -p <Name> --add "<question>" --answer <id> "<answer>"` (or edit `context/answers.md`), re-run `pbi intake`.
5. Never fabricate context. Unknowns stay as gaps or logged assumptions (`pbi log … --source assumption`).
6. Finish: summarize audience, decisions, top questions, known KPIs, rules; status line.
````

### 5.3 `pbi-data-profiling/SKILL.md` (+ `profiling-checklist.md`: §4.10 issue list from `04-python-core.md` with "how to handle" per code)
````markdown
---
name: pbi-data-profiling
description: Explores the project's spreadsheets, decides how each sheet becomes a clean table (Power Query steps in sources.yaml), proposes keys/relationships, documents data quality, and asks clarifying questions. Use in phases profile and clarify.
---
# Data profiling

## 1. Profile
`pbi profile -p <Name> --json`, then read `work/profile.md` (not the raw files). If the profile reports `TRUNCATED_PROFILE`, mention it.

## 2. Decide tables
For each detected region decide: keep (fact/dimension/target) or ignore (notes, pivots, report-style sheets — say why). One model table per real entity/event. Same-layout files (e.g. one per year) → one table with `append`.

## 3. Refine sources.yaml
Start from `work/sources.yaml` (or `sources.draft.yaml` if sources.yaml already existed — merge carefully). For each table, work through [the checklist](profiling-checklist.md): title rows, header, totals/repeated headers, merged cells (fill_down), trimming, code values (replace_values only when meanings are confirmed), wide → unpivot, types (culture!). Keep column names business-friendly via `rename` (Title Case, no abbreviations unless the business uses them).
After each table: `pbi preview-source -p <Name> --table <T> --json`. Check: row count plausible, conversion errors = 0 (or explained), key uniqueness as expected. Iterate (max 3 tries per problem, then ask).

## 4. Check
`pbi check-spec -p <Name> --spec sources --json` must pass.

## 5. Questions (phase clarify)
Review `work/questions.md`. Keep only questions whose answer changes the build; mark blocking ones. Ask the user all open blocking questions in one message (≤7), each with the proposed default. Record answers with `pbi questions --answer`. In fast mode: `pbi questions --assume-all`.
Apply answers to `sources.yaml` (e.g. code meanings) and re-preview.

## 6. Deliver
Ensure `docs/data-quality.md` reflects how each issue was handled. Summarize: tables (role, grain, rows), candidate relationships, top issues, remaining assumptions. Status line.
````

### 5.4 `pbi-kpi-design/SKILL.md` (+ `kpi-patterns.md` from `07-kpi-framework.md` §4, `dax-patterns.md` from 07 §5, `modeling-checklist.md` from 07 §7)
````markdown
---
name: pbi-kpi-design
description: Turns business questions and profiled data into a small set of meaningful, documented KPIs (kpis.yaml) plus the star-schema model spec (model.yaml), with independent SQL reference calculations and a KPI catalog for approval. Use in phase kpi_design or when KPIs must be added, removed or redefined.
---
# KPI design

Method (details in [kpi-patterns.md](kpi-patterns.md), DAX in [dax-patterns.md](dax-patterns.md)):

1. **Questions first.** From `work/context-summary.md` and `context/answers.md`, write `business_questions` (Q1…): text, decision, audience, frequency, priority. If the brief has none, infer 3–5 from the data and audience and mark `source: inferred` (they will be reviewed at the gate).
2. **Candidate KPIs.** For each question, list candidate measures using the pattern library for the domain; keep those the data can actually support (check columns/grain in `work/profile.md`). Prefer outcome KPIs for headline, drivers for supporting, breakdowns/quality for diagnostic. 3–7 headline KPIs total. Reject vanity metrics (no decision attached) and anything not computable from the data.
3. **Define each KPI fully** (all required fields). Plain-language definition with inclusions/exclusions; DAX using measures-on-measures and DIVIDE; DuckDB SQL computing the same value independently from the transformed tables (views named like model tables; use the `{where}` placeholder and explicit joins). Direction, additivity, grain, valid dimensions. Targets: only from the user (`user`), from a target table (`data`), proposed `assumption` (clearly flagged), or `none`. Confidence via the rubric.
4. **Model spec.** Write `model.yaml`: star schema (facts many-side, dimensions one-side, single-direction filters), shared dimensions for coarser-grain targets, Date table with all fact date columns in `range_from` and role-playing dates inactive, descriptions for every visible column, helper measures (dynamic titles, Data As Of). Follow [modeling-checklist.md](modeling-checklist.md).
5. **Check & compute.** `pbi check-spec -p <Name> --spec kpis,model --json` then `pbi expected -p <Name> --json`. Investigate any implausible value (zero, negative where impossible, ratio > 1 for a %): usually a wrong join or filter.
6. **Catalog.** `pbi docs -p <Name> --only kpi-catalog`. Return the gate table (see /pbi-new-dashboard).
7. **Log** every assumption: `pbi log -p <Name> --phase kpi_design --decision "…" --rationale "…" --source assumption --ref KPI-00x`.
````

### 5.5 `pbi-semantic-model/SKILL.md` (+ `modeling-rules.md` from 07 §7 + 09 §2)
````markdown
---
name: pbi-semantic-model
description: Builds the Power BI semantic model (TMDL in the PBIP) from the project's specs and fixes model errors — relationships, Date table, measures, descriptions, parameters. Use in phase model_build or when Desktop reports model/refresh errors.
---
# Semantic model build

1. `pbi build-model -p <Name> --json`. On drift (exit 4) show the drifted files and ask the user: overwrite (`--force`), keep (`--adopt`), or translate their Desktop change into specs (preferred).
2. `pbi validate -p <Name> --model --json`. Fix errors by editing `model.yaml` / `kpis.yaml` / `sources.yaml` (never TMDL), rebuild. Rules: [modeling-rules.md](modeling-rules.md).
3. Optional (MCP available, Windows): ask the MCP to "Open semantic model from PBIP folder '<abs path>\<Name>.SemanticModel\definition'" and list tables/measures — confirms TMDL parses. Read-only.
4. Ask the user to open `<Name>.pbip` in Power BI Desktop and click Refresh (or run `pbi reload -p <Name>` if Desktop already has it open). Common refresh errors and fixes: see `docs/SETUP.md` troubleshooting. Translate any error into a spec fix.
5. Summarize: tables, relationships, measure count, refresh status. Status line.
````

### 5.6 `pbi-report-build/SKILL.md` (+ `design-rules.md` from `08-report-design.md`, `visual-types.md` from 03 §7.3 + 04 §6.6 + harvested role names)
````markdown
---
name: pbi-report-build
description: Designs dashboard pages for a PBI Agent Kit project (report.yaml and ASCII wireframes for approval) and builds/validates the PBIR report. Use in phases report_design and report_build, and for layout or visual changes.
---
# Report design & build

## Design (phase report_design)
1. Read `docs/kpi-catalog.md`, `work/kpis.yaml` (approved KPIs), `work/model.yaml`, context summary.
2. Plan pages with [design-rules.md](design-rules.md): page 1 = executive summary with all headline KPIs (cards with PY/target comparison, one trend, one breakdown); 1–3 driver/diagnostic pages, one per question cluster; optional detail page (table/matrix, drillthrough); About page is automatic. ≤ 8 data visuals per page.
3. Choose visuals per KPI with the selection table in design-rules.md; only types in [visual-types.md](visual-types.md). Titles state the question or insight; use `title_measure` for dynamic titles (create the helper measure in model.yaml first).
4. Write `work/report.yaml`; `pbi check-spec -p <Name> --spec report --json`; `pbi wireframe -p <Name>` → docs/report-design.md. Return wireframes for the design gate.

## Build (phase report_build, after gate design)
1. `pbi build-report -p <Name> --json` (drift handling as in the model skill).
2. `pbi validate -p <Name> --json` — includes vendored-schema validation, lint, and `powerbi-report-author validate` when installed. Fix via report.yaml; for MS CLI diagnostics on a raw_visual, consult the matching file in `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/`.
3. If Desktop is open on this PBIP: `pbi reload -p <Name>`, then `pbi screenshots -p <Name>` and look at each PNG: overlapping/clipped text, empty visuals ("(Blank)"), unreadable labels, wrong sort. Fix and rebuild.
4. Status line.
````

### 5.7 `pbi-qa/SKILL.md` (+ `reconciliation.md` from 07 §8)
````markdown
---
name: pbi-qa
description: Verifies a built PBI Agent Kit dashboard — full validation, KPI reconciliation of DAX results against independent DuckDB calculations, visual review via screenshots, and generation of complete documentation. Use in phases qa and docs or before any handover.
---
# QA & documentation

1. `pbi validate -p <Name> --json` — zero errors required.
2. Refresh confirmation: ask the user to open the PBIP in Desktop and Refresh (or `pbi reload`). Record "refreshed OK at <time>" via `pbi log`.
3. Reconciliation ([details](reconciliation.md)):
   - `pbi dax-queries -p <Name> --json` → `work/reconcile/queries.json`.
   - If the `powerbi-modeling` MCP isn't available, don't try to install, configure or start it. Suggest `pbi mcp-config` / `docs/SETUP.md` §4 to the user, and use the manual path below.
   - If the `powerbi-modeling` MCP is available: connect with "Connect to '<Name>' in Power BI Desktop" (if the EULA blocks, ask the user to confirm acceptance first), run each query with the DAX query tool, write `work/reconcile/results.json` as `[{"id": …, "rows": [{"grp": …, "value": …}]}]`.
   - Otherwise: ask the user to paste `work/reconcile/queries.dax` into Desktop's DAX query view, run, and paste results into `work/reconcile/results.json` (template provided).
   - `pbi reconcile -p <Name> --results work/reconcile/results.json --json`. For each failure diagnose (transform vs definition vs parsing), fix the spec, rebuild, re-run. A mismatch may be accepted only with the user's agreement and a logged rationale.
4. Visual review: `pbi screenshots -p <Name>` (if bridge available) and inspect; otherwise ask the user for a screenshot of each page or skip with a note.
5. Docs: `pbi docs -p <Name> --json` — the completeness check must pass; fill gaps by improving descriptions in specs, then rebuild + regenerate.
6. Summarize pass/fail per KPI, validation status, open assumptions. Status line.
````

### 5.8 `pbi-publish/SKILL.md`
````markdown
---
name: pbi-publish
description: Prepares and guides publishing a finished PBI Agent Kit dashboard to a Power BI Pro/PPU workspace without Fabric capacity — publish checklist, data-source credentials, gateway vs SharePoint refresh, scheduled refresh and sharing. Use in the publish phase.
---
# Publish

1. `pbi publish-check -p <Name> --json` → `docs/publish-checklist.md`. Present ✖ items first; resolve what you can via specs.
   - Development used a local copy. Ask: "Will the published dashboard read the spreadsheets from SharePoint/OneDrive for Business? If so, paste the folder (or file) link." Then run `pbi set-source -p <Name> --sharepoint-url "<link>" --json`. Token sharing links (`/:x:/g/…?e=…`) can't be parsed; ask for the folder address instead.
   - Ask the user to confirm the SharePoint folder holds the same files (names, sheets, layouts) as the local copy, then to open the rebuilt PBIP in Desktop, sign in to SharePoint (Organizational account) and Refresh. Re-run `pbi publish-check`.
   - If production stays local, explain the gateway requirement (on-premises data gateway, personal mode) before continuing.
2. Gate publish: get explicit approval (`pbi gate … publish --approve`).
3. Guide the user (they perform it): open `<Name>.pbip` in Desktop → Refresh → File → Publish → Publish to Power BI → choose workspace. Then in the service: semantic model Settings → Data source credentials (OAuth2 for SharePoint) → Gateway connection (local mode only; on-premises data gateway, personal mode OK; installing it usually needs IT, so recommend SharePoint mode) → Scheduled refresh (Pro ≤ 8/day). Share or add to an app.
4. Ask the user to confirm success and the workspace name; record with `pbi log`. Mark complete only after confirmation.
````

---

## 6. `.mcp.json` (kit root; generated, not hand-written)

`.mcp.json` holds machine-specific absolute paths, so it's **generated** by `pbi mcp-config` (`04-python-core.md` §11.1) after the user has installed the MCP package into the conda env themselves (`01-setup.md` §3). It's gitignored. Commit `.mcp.json.example`:
```json
{
  "mcpServers": {
    "powerbi-modeling": {
      "type": "stdio",
      "command": "C:\\Users\\<you>\\miniconda3\\envs\\pbiagent\\node.exe",
      "args": ["C:\\Users\\<you>\\miniconda3\\envs\\pbiagent\\node_modules\\@microsoft\\powerbi-modeling-mcp\\index.js", "--start", "--readonly"]
    }
  }
}
```
- **Why not `npx -y`:** Microsoft's documented `npx -y @microsoft/powerbi-modeling-mcp@latest` downloads the package whenever the server starts, which counts as an agent-triggered install. The kit launches the pre-installed package with `node` instead.
- **`--readonly`** is deliberate: the kit never writes through the MCP. All model changes go through specs and the generator.
- The server name `powerbi-modeling` is what the agents reference as `powerbi-modeling/*`.
- Don't install the Power BI Modeling MCP VS Code extension as well; two registrations conflict.

## 7. Optional `.vscode/settings.json`
```json
{
  "yaml.schemas": {
    "./tools/pbiagent/schemas/sources.schema.json": "projects/*/work/sources.yaml",
    "./tools/pbiagent/schemas/model.schema.json": "projects/*/work/model.yaml",
    "./tools/pbiagent/schemas/kpis.schema.json": "projects/*/work/kpis.yaml",
    "./tools/pbiagent/schemas/report.schema.json": "projects/*/work/report.yaml",
    "./tools/pbiagent/schemas/project.schema.json": "projects/*/project.yaml"
  },
  "files.eol": "\n",
  "[tmdl]": { "files.eol": "\r\n" }
}
```

## 8. Verifying the customizations (implementer)

- **VS Code (Copilot harness):** open the Agent Customizations editor (Command Palette: **Chat: Open Customizations**). All 7 agents and 8 skills must be listed without errors. Type `/` in chat and check that the `pbi-*` skills appear.
- **Copilot CLI:** run `copilot` in the kit root, trust the folder, then:
  - `/agent` should list the 7 agents
  - `/skills list` should list the 8 skills
  - `/mcp` should show `powerbi-modeling`
  - `/instructions` should show AGENTS.md, copilot-instructions and the 3 instruction files
- **Non-interactive smoke test:** `copilot -p "Run pbi status for project _example and report the next action" --agent pbi-orchestrator --allow-tool='shell(.\pbi.cmd:*)' -s`
