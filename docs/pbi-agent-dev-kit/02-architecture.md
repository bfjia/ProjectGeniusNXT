# 02: Architecture

## 1. Goals and non-goals

**Goals**
- Turn one or more spreadsheets (xlsx/xlsm/csv), plus optional user context, into a **documented, decision-oriented Power BI dashboard**.
- Make every KPI traceable to a business question, with a written definition, DAX, an independent reference calculation, a target source, caveats and a confidence rating.
- Run identically from **GitHub Copilot in VS Code (Copilot harness)** and **GitHub Copilot CLI**.
- Work with **no GitHub access** at runtime. Publish to a Pro/PPU workspace with **no Fabric capacity**.
- Keep the user in control through configurable approval gates.

**Non-goals (v1)**
- DirectQuery and Direct Lake (Import only).
- Row-level security, incremental refresh, deployment pipelines, Git integration with workspaces (these need capacity).
- Non-spreadsheet sources. The design allows them later through the `source.kind` extension point.
- Editing visuals interactively in Desktop. Users can do this after handover; the kit detects drift (see §8).

## 2. Key decisions

### D1: Output format: PBIP (TMDL model + PBIR report)

The user said PBIP isn't mandatory. Alternatives considered:

| Option | Verdict |
|---|---|
| **PBIP: TMDL + PBIR (chosen)** | Plain text, folder-per-object, documented and published JSON schemas, opens directly in Desktop. Microsoft's own agent tooling (report CLI, Modeling MCP, Desktop Bridge) targets it. PBIR is GA and the default format; when PBIR reaches GA, PBIR-Legacy (`report.json`) is no longer supported. It diffs cleanly in git and can be validated offline. |
| PBIX | Binary (zip with an ABF model). Can't be authored or validated as text. Rejected. |
| PBIT template | Legacy zip containing TMSL + PBIR-Legacy layout JSON, with an undocumented layout format. Rejected. |
| Build via TOM/.NET against Desktop's Analysis Services instance | Needs .NET, Desktop running, and fragile port discovery. Only covers the model, not the report. Rejected as the primary path. The Modeling MCP is used for **read/validate** only. |
| Fabric REST create-with-definition | **Out of scope.** Fabric isn't approved in the owner's organization. Publishing is done from Power BI Desktop to a Pro/PPU workspace. |

### D2: Copilot harness constraints shape the orchestration

Facts from the vendored VS Code and GitHub docs:
- The **Copilot harness** is the shared runtime for VS Code, Copilot CLI and the Copilot app. The VS Code **Local** harness is deprecated (removed Feb 2027).
- Prompt files (`.prompt.md`) run only in Local, so **don't use them**. Use **skills** instead: skills are invocable as `/skill-name` in both hosts.
- Agent `handoffs`, `agents:` allowlists and `argument-hint` are Local-only, so **don't rely on them**.
- Portable agent fields: `name`, `description` (required), `tools` (aliases `read`, `edit`, `search`, `execute`, `agent`, `web`, `todo`; MCP `server/*`), `model`, `skills`, `user-invocable`, `disable-model-invocation`.
- Delegation uses the `agent` tool alias. A custom agent can be invoked as a subagent by name. Subagents start **without** the caller's history, so every delegation message must carry the project name and phase.
- Shared locations both hosts read: `.github/agents/*.agent.md`, `.github/skills/<name>/SKILL.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, root `.mcp.json`.

So orchestration is **state-file driven**: `state.yaml` records the phase. The orchestrator agent reads it, runs the next phase itself (loading the phase skill) or delegates to the phase's specialist agent through the `agent` tool, and stops at gates. A user can also run any phase directly (`/pbi-data-profiling RetailOps`) because the skills don't depend on conversation history.

### D3: Specs written by the LLM, files written by deterministic code

The LLM writes small YAML specs: `sources.yaml`, `model.yaml`, `kpis.yaml`, `report.yaml`. The Python package `pbiagent` compiles them into TMDL/PBIR and validates the result.

Rationale:
- PBIR JSON is verbose and version-sensitive; TMDL is whitespace-sensitive.
- Specs are reviewable by humans at the gates.
- Builds are reproducible, so re-running after a KPI change regenerates everything consistently.

Escape hatches:
- `custom_m` transform steps
- free DAX in measures
- `raw_visual` entries in `report.yaml` that embed a hand-authored visual.json body, validated by schema + MS CLI

### D4: Hybrid tooling (self-contained core, optional Microsoft adapters)

The core (profiling, generation, schema validation with vendored schemas, lint, docs) needs only Python. Each adapter is detected by `pbiagent doctor`:
- `powerbi-report-author validate` adds official PBIR conformance (IDs, formatting objects, theme, layout). It runs after the kit's own validation when present.
- `powerbi-report-author catalog describe <visualType>` gives authoritative data-role names. It's used by the gallery fallback and when a `raw_visual` is authored.
- `powerbi-desktop reload / screenshot-all` reloads Desktop after a rebuild and captures PNGs for the QA agent to look at.
- Modeling MCP `dax_query_operations` runs the reconciliation DAX against the open Desktop model.

### D5: Import mode; sources through M parameters

Every table's partition is Power Query M reading a file through model parameters:
- `source.mode: local`: `File.Contents(SourceFolder & "\<file>")`. Scheduled refresh in the service needs a gateway (personal mode is fine).
- `source.mode: sharepoint`: `SharePoint.Files(SharePointSite, [ApiVersion = 15])` filtered by `SharePointFolder` and file name. No gateway needed.

The mode is chosen **at build time**; switching means a rebuild. There's no runtime if/else between sources, which avoids the service flagging a local file source on a SharePoint-mode model.

**Lifecycle:**
1. Every project is developed against a **local copy** of the spreadsheets (`local`).
2. When the owner provides the production SharePoint/OneDrive link, `pbi set-source --sharepoint-url` parses it into site + folder (`04-python-core.md` §10.1), switches to `sharepoint`, and rebuilds.
3. The publisher agent prompts for this step before publishing.

`pbi set-source --local` switches back for further development.

### D6: Microsoft's skills as reference, not as active skills

`reference/microsoft-skills-for-fabric/` (MIT) has excellent PBIR, TMDL and design knowledge. If it sat in `.github/skills/`, its broad descriptions ("create, edit … Power BI reports") would auto-trigger and compete with the kit's workflow. So the kit's skills link to **specific** files in it, such as `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/card.md`.

### D7: One kit repo, many projects

The kit repo holds agents, skills, tools and references. Each dashboard is a folder under `projects/` (or anywhere; `pbiagent` takes a project path). This keeps agents and tools versioned together, and makes projects easy to zip and hand over.

### D8: Privacy by default

Spreadsheets may contain personal data. The profiler:
- shows at most `privacy.sample_rows` (default 5) sample values per column
- masks values in columns detected as PII-like (email, phone, national-ID patterns, columns named like name/address/dob) as `<masked:email>`
- never prints whole rows

Agents must not paste raw data into chat beyond what the profile shows. MCP query results reach the LLM, so reconciliation queries return **aggregates only**.

### D9: No admin rights, and agents never install
- The owner has no administrator rights, so every component has a per-user path:
  - Miniconda "Just Me"
  - VS Code User Installer
  - Power BI Desktop and PowerShell 7 from the Microsoft Store
  - Node.js 22 **inside the conda env** (conda-forge), instead of a system MSI
  - the npm tools installed globally *into the env*
- Kit paths live under `%USERPROFILE%`.
- Agents (implementation and runtime) **never** install software or change configuration. `pbi doctor` reports `action: owner` items with the exact command, and the agent stops and waits.
- The Modeling MCP is pre-installed and launched with `node <path>/index.js` from a generated `.mcp.json`. That avoids `npx -y`, which downloads packages at startup.
- The kit runs from source (`PYTHONPATH`), so there's no `pip install`.
- Components that only have admin installers are avoided: the data gateway is avoided by SharePoint mode, and long-path support by keeping paths short.

### D10: No Fabric: what "Fabric" in the bundle means
- **Not used:** Fabric capacity, Fabric items (lakehouses, notebooks, …), Fabric REST APIs (`api.fabric.microsoft.com`), the Fabric CLI, Direct Lake, XMLA endpoints, Fabric Git integration, deployment pipelines.
- **Name-only appearances (safe):**
  - the PBIP JSON schemas are published under `developer.microsoft.com/json-schemas/fabric/…`; they're offline file-format definitions
  - every PBIP folder contains `.platform` files (git-integration metadata); Desktop writes them for every project, and they're harmless
  - Microsoft's Power BI agent docs live in a repo called `skills-for-fabric`; only the local-authoring files are used (`vendor/skills-for-fabric/APPLICABILITY.md`)
- **Publishing:** Desktop → Pro/PPU workspace. This is standard Power BI running on the tenant's *shared capacity* (Microsoft's licensing docs describe Pro/PPU workspaces this way). It isn't a Fabric capacity and needs no Fabric approval.

## 3. Component diagram

```
                 ┌─────────────────────────── Copilot host (VS Code Copilot harness | Copilot CLI) ──────────────────────────┐
 user ── chat ──▶│ pbi-orchestrator agent ──(agent tool)──▶ pbi-data-profiler | pbi-kpi-analyst | pbi-modeler |              │
                 │        │                                   pbi-report-designer | pbi-qa | pbi-publisher                   │
                 │        │ loads skills: pbi-new-dashboard, pbi-context-intake, pbi-data-profiling, pbi-kpi-design,        │
                 │        │               pbi-semantic-model, pbi-report-build, pbi-qa, pbi-publish                         │
                 │        ▼                                                                                                 │
                 │  execute tool ── .\pbi.cmd <cmd> ──▶ conda env "pbiagent" ── python -m pbiagent                          │
                 │  MCP tool  ── powerbi-modeling (pre-installed npm pkg, run by node) ── Desktop AS instance (DAX)     │
                 └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │ reads/writes
           projects/<Name>/  input/ (xlsx,csv)  context/ (brief.md …)  work/ (specs, profile, results)  docs/  output/<Name>/ (PBIP)
                                         │
     pbiagent modules: profile · transforms(→M, →pandas) · model(→TMDL) · kpi(→DAX, →SQL) · report(→PBIR) · validate · reconcile · docs · publish
                                         │ optional adapters
         powerbi-report-author (validate, catalog, scaffold --offline)  ·  powerbi-desktop (status, reload, screenshot-all)
```

## 4. Phase state machine

`state.yaml` (schema in `03-specs.md` §2) holds one entry per phase: `status ∈ {pending, in_progress, needs_input, awaiting_approval, done, stale, failed}`, the artifacts it produced, and their SHA-256 hashes.

| # | Phase id | Owner agent / skill | Inputs | Outputs | Exit condition |
|---|---|---|---|---|---|
| 0 | `init` | orchestrator / `pbi-new-dashboard` | user request | project folder, `project.yaml`, `state.yaml`, `context/brief.md` (template copy) | folder exists |
| 1 | `intake` | profiler / `pbi-context-intake` | `context/*` | `work/context-summary.md` (normalized brief + completeness score + gaps) | score computed; gaps either asked about or marked as assumptions |
| 2 | `profile` | profiler / `pbi-data-profiling` | `input/*`, context summary | `work/profile.json`, `work/profile.md`, `work/sources.yaml` (draft), `work/questions.md`, `docs/data-quality.md` | `pbiagent check-spec sources` passes and `pbiagent preview-source` works for every table |
| 3 | `clarify` | profiler | `work/questions.md` | `context/answers.md`; question status set to answered or assumed | no open **blocking** question. In fast mode, blocking questions become assumptions logged to `work/decisions.log.md` |
| 4 | `kpi_design` | kpi-analyst / `pbi-kpi-design` | context summary, profile, answers | `work/kpis.yaml`, `work/model.yaml` (draft, star schema), `work/expected/kpi-values.json`, `docs/kpi-catalog.md` | `check-spec kpis,model` passes; every KPI's `sql` runs in DuckDB |
| **G1** | gate `kpis` | orchestrator | `docs/kpi-catalog.md` | approval note in `state.yaml` | user replies approve (gated mode) |
| 5 | `model_build` | modeler / `pbi-semantic-model` | `sources.yaml`, `model.yaml`, `kpis.yaml` | `output/<Name>/<Name>.SemanticModel/**` | `pbiagent build-model` + `validate --model` pass |
| 6 | `report_design` | report-designer / `pbi-report-build` | kpis, model, context | `work/report.yaml`, `docs/report-design.md` (wireframes as ASCII grid) | `check-spec report` passes |
| **G2** | gate `design` | orchestrator | `docs/report-design.md` | approval | user approves |
| 7 | `report_build` | report-designer | `report.yaml` | `output/<Name>/<Name>.Report/**`, `<Name>.pbip` | `build-report` + `validate` pass (incl. MS CLI if present) |
| 8 | `qa` | qa / `pbi-qa` | built PBIP, expected values | `work/reconcile/results.json`, `docs/validation-report.md`, `work/screenshots/*.png` | lint has no errors; reconciliation passes, or mismatches are explained and accepted; Desktop opened and refreshed (user-confirmed or bridge status) |
| 9 | `docs` | qa / `pbi-qa` | everything | `docs/README.md`, `docs/data-dictionary.md`, `docs/assumptions-and-decisions.md` (+ refreshed catalog) | `pbiagent docs` passes its completeness check |
| **G3** | gate `publish` | publisher / `pbi-publish` | `docs/publish-checklist.md` | approval | user approves |
| 10 | `publish` | publisher | PBIP | `docs/publish-checklist.md` with the service steps completed (user ticks) | user confirms it was published (Desktop publish is manual) |

**Staleness:** when `pbiagent` sees that an artifact's hash differs from the one recorded, it marks every downstream phase `stale`. Example: editing `kpis.yaml` after G1 marks `model_build`, `report_design`, `report_build`, `qa` and `docs` stale, and resets the `kpis` gate to `awaiting_approval` if the change touches a headline KPI. `pbiagent status` prints the next action.

**Gates:** `project.yaml: mode: gated|fast` and `gates: [kpis, design, publish]`. In fast mode the orchestrator records an auto-approval with the note "fast mode" and appends the assumptions to `work/decisions.log.md`. The `publish` gate can't be skipped, because publishing is outward-facing.

## 5. Agent ↔ skill ↔ command map

| Agent (`.github/agents/`) | Skills it loads (`skills:`) | `pbiagent` commands it runs | MCP |
|---|---|---|---|
| `pbi-orchestrator` | `pbi-new-dashboard` | `init`, `status`, `gate` | none |
| `pbi-data-profiler` | `pbi-context-intake`, `pbi-data-profiling` | `profile`, `preview-source`, `check-spec sources`, `questions` | none |
| `pbi-kpi-analyst` | `pbi-kpi-design` | `check-spec kpis model`, `expected`, `docs --only kpi-catalog` | none |
| `pbi-modeler` | `pbi-semantic-model` | `build-model`, `validate --model` | optional: load PBIP to verify TMDL parses |
| `pbi-report-designer` | `pbi-report-build` | `check-spec report`, `build-report`, `validate`, `wireframe` | none |
| `pbi-qa` | `pbi-qa` | `validate`, `dax-queries`, `reconcile`, `screenshots`, `docs` | `powerbi-modeling/*` (read-only use) |
| `pbi-publisher` | `pbi-publish` | `publish-check`, `set-source` | none |

Each specialist agent has `user-invocable: true`, so users can pick it directly. The orchestrator is the default entry point.

## 6. Kit repository layout

```
PowerBIAgent/                      (kit root; short user-writable path, e.g. %USERPROFILE%\pbi\PowerBIAgent)
├── README.md                      what it is + 10-line quick start + links
├── AGENTS.md                      shared rules for all agents (both hosts read it)
├── environment.yml                conda env "pbiagent"
├── pbi.cmd  pbi                   wrappers → set PYTHONPATH=<kit>/tools; conda run --no-capture-output -n pbiagent python -m pbiagent (no pip install)
├── .mcp.json                      generated by `pbi mcp-config` (machine-specific absolute paths; gitignored)
├── .mcp.json.example              committed template showing the shape
├── .gitignore                     **/.pbi/localSettings.json, **/.pbi/cache.abf, projects/*/output/**/.pbi/, __pycache__/, .mcp.json, ENVIRONMENT-CHECK.md …
├── .vscode/settings.json          yaml.schemas mapping for spec files (optional convenience)
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/{tmdl,pbir,specs}.instructions.md
│   ├── agents/pbi-{orchestrator,data-profiler,kpi-analyst,modeler,report-designer,qa,publisher}.agent.md
│   └── skills/
│       ├── pbi-new-dashboard/SKILL.md
│       ├── pbi-context-intake/{SKILL.md, rubric.md}
│       ├── pbi-data-profiling/{SKILL.md, profiling-checklist.md}
│       ├── pbi-kpi-design/{SKILL.md, kpi-patterns.md, dax-patterns.md}
│       ├── pbi-semantic-model/{SKILL.md, modeling-rules.md}
│       ├── pbi-report-build/{SKILL.md, design-rules.md, visual-types.md}
│       ├── pbi-qa/{SKILL.md, reconciliation.md}
│       └── pbi-publish/{SKILL.md}
├── docs/
│   ├── SETUP.md  USER-GUIDE.md  CONTEXT-GUIDE.md
│   └── templates/{context-brief.md, data-dictionary.csv, kpi-definitions.csv, answers.md}
├── reference/                     vendored, read-only (see bundle README)
│   ├── json-schemas/fabric/…  report-theme-schema/  microsoft-skills-for-fabric/
│   ├── powerbi-modeling-mcp/  npm-readmes/  learn/
├── tools/
│   ├── pyproject.toml
│   ├── pbiagent/  (package; see 04-python-core.md)
│   ├── templates/{blank-pbip/, gallery/, builtin-visuals/, docs/*.md.j2, theme/base-theme.json}
│   └── tests/{fixtures/, test_*.py}
└── projects/
    └── _example/   (HarborOutfitters synthetic example; regenerated by `pbiagent make-example`)
```

## 7. Project folder layout

```
projects/<Name>/
├── project.yaml            configuration (03-specs §1)
├── state.yaml              phase machine (managed by pbiagent; agents never hand-edit it)
├── input/                  user spreadsheets. READ-ONLY for agents.
├── context/
│   ├── brief.md            user's brief (from docs/templates/context-brief.md)
│   ├── data-dictionary.csv optional
│   ├── kpi-definitions.csv optional
│   └── answers.md          answers to work/questions.md (user or agent-recorded)
├── work/
│   ├── context-summary.md
│   ├── profile.json  profile.md
│   ├── questions.md
│   ├── sources.yaml  model.yaml  kpis.yaml  report.yaml
│   ├── expected/kpi-values.json
│   ├── reconcile/{queries.dax, queries.json, results.json}
│   ├── screenshots/*.png
│   └── decisions.log.md    append-only log: timestamp | phase | decision | rationale | source (user/assumption)
├── docs/                   deliverable documentation (generated; hand edits go in work/specs)
│   ├── README.md  kpi-catalog.md  data-dictionary.md  data-quality.md
│   ├── report-design.md  assumptions-and-decisions.md  validation-report.md  publish-checklist.md
└── output/<Name>/          generated PBIP (or under project.yaml output.root)
    ├── <Name>.pbip
    ├── <Name>.SemanticModel/…
    ├── <Name>.Report/…
    ├── .gitignore
    └── build-manifest.json file → sha256 of every generated file (drift detection)
```

## 8. Drift and re-generation

- `output/` is build output. `build-manifest.json` records the hash of every generated file.
- Before writing, the builder compares the current files with the manifest. If any were modified outside the kit (for example, the user edited them in Desktop and saved), it **stops** and lists the drifted files. The options it offers are:
  - `--force`: overwrite them
  - `--adopt <file>`: keep the file and mark it user-owned in `build-manifest.json` (`owned_by: user`); later builds skip it and warn
  - stop, so the agent can translate the user's Desktop change back into the specs (preferred for visuals: re-express it in `report.yaml`)
- Desktop always rewrites some files on save (`.pbi/*`, `diagramLayout.json`, `semanticModelDiagramLayout.json`, lineage tags added to TMDL). These are **excluded** from drift detection:
  - `.pbi/**`
  - `*DiagramLayout.json` / `diagramLayout.json`
  - TMDL `lineageTag:` lines, which are normalized away before hashing
  - `annotation PBI_*` lines
  - `$schema` version bumps, which are normalized by replacing the version segment

## 9. Interaction design (what the user experiences)

1. The user runs `/pbi-new-dashboard RetailOps`, or tells the orchestrator in plain words.
2. The orchestrator checks for files in `input/` (or asks for them), checks `context/brief.md`, and runs intake. If the brief scores below "adequate", it asks at most **5** targeted questions, the highest-value gaps first, or offers a "proceed with assumptions" option.
3. Profiling runs. The agent shows a short summary: tables found, the grain of each, candidate keys and relationships, data-quality issues. It then asks the **blocking** clarifying questions, at most 7, each with a proposed default answer.
4. The KPI analyst produces the KPI catalog. **Gate 1** shows the headline KPIs as a table (name, definition, formula in words, target source, confidence) and links to `docs/kpi-catalog.md`. The user can approve, ask for changes ("drop KPI-004, add on-time %"), or edit `kpis.yaml` directly.
5. The model is built. The report designer drafts `report.yaml` and `docs/report-design.md` with ASCII wireframes per page. **Gate 2** asks for approval.
6. The report is built and validated. QA asks the user to open the PBIP in Desktop and click Refresh, or uses `powerbi-desktop open`. Reconciliation runs through MCP, or the user pastes the DAX query results. Screenshots are reviewed.
7. Docs are generated. **Gate 3** presents the publish checklist; the user publishes from Desktop and confirms.

Every agent turn ends with a status line: `Phase: <phase> — <status>. Next: <next action>.`

## 10. Error handling principles

- `pbiagent` commands exit non-zero with JSON errors (`--json`) that name the file, path and fix. The agent fixes the **spec** and re-runs; it never patches generated files by hand. The single exception is a `raw_visual` the agent authored.
- After 3 failed attempts on the same error, the agent stops and reports it to the user with the error text.
- If an optional adapter is missing, the agent skips it with a warning, records that in `docs/validation-report.md`, and never fails the phase.
- If the user's data changes (new files in `input/`), `pbiagent status` detects the input hash change and marks `profile` and everything after it stale.

## 11. Extensibility hooks

- New source kinds: implement `SourceReader` (pandas) + `MSourceEmitter` (M) for the `kind` in `transforms/`.
- New visual types: add a template in `tools/templates/builtin-visuals/<visualType>.json` plus a role mapping in `report/visuals.py`, and a row in `pbi-report-build/visual-types.md`.
- New KPI patterns: add them to `pbi-kpi-design/kpi-patterns.md` and `dax-patterns.md`. No code change is needed.
