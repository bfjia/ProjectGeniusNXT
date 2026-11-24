# Plan: PBI Agent Kit: Copilot-driven Power BI dashboard agents

> This is the implementation plan. Every other file referenced here is in this bundle; paths are relative to the bundle root. **The implementer has no GitHub access.** Every needed document is in this bundle (`vendor/`), so don't try to fetch from github.com. Things the project owner must provide or do are in `NEEDS-FROM-USER.md`.

## Context

**Goal:** GitHub Copilot drives a set of agents that take **spreadsheets** (xlsx/xlsm/csv), plus optional user context, and produce **meaningful, documented KPIs** presented as a **Power BI dashboard that informs decisions**. Users get detailed guidance on providing good context (`06-context-guide.md`).

**Owner's constraints:**
- It must work from **both VS Code (GitHub Copilot) and GitHub Copilot CLI**.
- **Hybrid approach:** a self-contained core, plus optional Microsoft tools.
- **Python via conda and Power BI Desktop (Windows)** are available. Node.js 22 comes from the conda env.
- **The owner has no admin rights.** Every component must have a per-user install path (`01-setup.md` §0–§4).
- **Agents never install anything** (neither the implementation agent nor the kit's runtime agents). Missing software is reported to the owner with exact no-admin commands, and implementation waits until the owner resolves it.
- **Approval gates are configurable** (gated or fast).
- **No Fabric capacity**, but Pro/PPU workspaces exist to publish to.
- **The runtime agent has no GitHub access.**
- PBIP isn't mandatory if something better exists. It was evaluated and kept (Decision 1).

## Ground rules for the implementation agent
1. **No GitHub access.** Everything you need is in this bundle (`vendor/`).
2. **Never install or configure software.** Don't run `winget`, Microsoft Store installs, `npm install`, `pip install`, `conda create/install/update`, `code --install-extension` or `npx -y`, and don't edit PATH, registry, or npm/conda/git config. When something is missing, **stop before implementing**: tell the owner what's missing, give the exact no-admin command from `01-setup.md` §1–§4 (or "ask IT"), and wait for confirmation. Then re-check.
3. **Assume no admin rights.** Use only user-writable locations (e.g. `%USERPROFILE%\pbi\…`). Never require elevation.
4. **Start with the read-only environment check** (`11-environment-check.md`).
5. **Running** existing tools (python, pytest, node, the installed `powerbi-*` CLIs, `copilot`) is fine. Writing files inside the kit repository is fine.

## Bundle contents

| File | Content |
|---|---|
| `README.md` | Bundle index, vendored material and licenses, the first implementation step (copy `vendor/` into the kit's `reference/`) |
| `NEEDS-FROM-USER.md` | What the owner must provide, decide, run or approve, by milestone |
| `01-setup.md` | End-user setup instructions (becomes `docs/SETUP.md`) |
| `02-architecture.md` | Decisions, components, phase state machine, folder layouts, drift handling, interaction design |
| `03-specs.md` | YAML contracts: project, state, profile, sources, model, kpis, report, questions, decisions log |
| `04-python-core.md` | The `pbiagent` package: CLI, profiler, M/pandas transforms, TMDL and PBIR generators, validation, reconciliation, docs, gallery, synthetic example, tests |
| `05-copilot-files.md` | Full text of AGENTS.md, 7 agents, 8 skills, instructions, `.mcp.json` |
| `06-context-guide.md` | User-facing context guide, brief template, CSV templates, completeness rubric |
| `07-kpi-framework.md` | KPI method, confidence rubric, KPI pattern library, DAX pattern library, format strings, modeling checklist, reconciliation method |
| `08-report-design.md` | Page archetypes, 8px/12-column layout, visual selection, theme, About page, wireframes |
| `09-format-reference.md` | Verified PBIP/TMDL/PBIR facts, source conflicts and how to resolve them, e2e verification log |
| `10-tooling-reference.md` | Microsoft report CLI, Desktop Bridge CLI, Modeling MCP, Copilot hosts, publishing and refresh |
| `11-environment-check.md` | **Read-only machine, account and permission checks the implementation agent runs first (M0)**, with the report template |
| `vendor/` | JSON schemas (microsoft/json-schemas), report theme schema, Microsoft `skills-for-fabric` Power BI skills (MIT), Modeling MCP README/EULA, npm READMEs, VS Code and Copilot CLI docs, 167 Learn pages (PBIP, TMDL, modeling, M and DAX function references, refresh, Fabric REST) |

**How to find facts:** `grep -ril "<term>" vendor/` (e.g. `grep -ril "PromoteHeaders" vendor/learn`). Each Learn page's first line is its source URL.

## Key decisions (rationale in `02-architecture.md` §2)

1. **Output stays PBIP (TMDL model + PBIR report).** It's text, schema-validated, opens directly in Desktop, and is what Microsoft's own agent tooling targets. PBIR is GA and the default. PBIX/PBIT (binary or legacy) and driving TOM directly (fragile) were rejected.
2. **Specs instead of hand-written files.** The LLM writes small YAML specs (`sources.yaml`, `model.yaml`, `kpis.yaml`, `report.yaml`). The deterministic Python package `pbiagent` generates TMDL/PBIR and validates it offline against the vendored JSON schemas.
3. **One cleaning spec, two engines.** `sources.yaml` compiles to **Power Query M** (native refresh) and to **pandas/DuckDB**, so every KPI is **reconciled** against an independent SQL calculation. The DAX results come from the Modeling MCP or are pasted by the user.
4. **Built for the Copilot harness.**
   - VS Code's Local harness is deprecated, and prompt files and handoffs only work there, so the kit doesn't use them.
   - **Agents** (`.github/agents`), **skills** (`.github/skills`, invocable as `/name`), `AGENTS.md` and the root `.mcp.json` work in both hosts.
   - Orchestration is driven by `state.yaml`, with delegation through the `agent` tool.
5. **Microsoft tools are optional adapters.** The owner installs them from npm into the conda env (not from GitHub; no admin):
   - `powerbi-report-author validate/catalog/scaffold --offline`
   - `powerbi-desktop reload/screenshot-all`
   - `@microsoft/powerbi-modeling-mcp --readonly`, used only for DAX reconciliation against the open Desktop file. It's pre-installed and launched with `node`; `npx -y` would download at startup and isn't used. `.mcp.json` is generated by `pbi mcp-config`.
6. **Import mode only; develop on a local copy, publish from SharePoint.**
   - Sources come in through M parameters, in `local` mode (`SourceFolder`) or `sharepoint` mode (`SharePointSite` + `SharePointFolder`).
   - **Development always uses a local copy** of the spreadsheets.
   - For production, the owner supplies a SharePoint/OneDrive for Business link, and `pbi set-source --sharepoint-url` switches the mode and rebuilds. No gateway is needed. A local-mode production model needs a gateway.
   - Publishing goes through Desktop to Pro/PPU. Fabric REST publishing is an optional adapter that's off by default and unverified on Pro.
7. **The owner's blank PBIP is the format source of truth.** The generator copies its `$schema` versions and boilerplate. An optional "visual gallery" PBIP, harvested from the owner's Desktop, version-matches the visual templates.
8. **Gates are configurable.** `mode: gated|fast`; the gates are `kpis`, `design` and `publish`. The publish gate is always enforced. Every assumption is logged and surfaced.

## Target repository

Create a new repository folder for the kit (recommended on Windows: `%USERPROFILE%\pbi\PowerBIAgent`; a short, user-writable path (no admin) and not under OneDrive, because of the 260-character limit and file locks). Its layout is `02-architecture.md` §6:
- `AGENTS.md`, `environment.yml`, the `pbi.cmd`/`pbi` wrappers, `.mcp.json.example` (the real `.mcp.json` is generated by `pbi mcp-config`), `.gitignore`
- `.github/{copilot-instructions.md, instructions/, agents/, skills/}`
- `docs/`, `reference/` (from `vendor/`), `tools/pbiagent/`, `tools/templates/`, `tools/tests/`
- `projects/_example/`

## Implementation milestones

Work in order. Each milestone ends with its acceptance checks passing. Use local `git` (no remote) and commit per milestone.

### M0: Bootstrap
- **First, run the environment, account and permission check** (`11-environment-check.md`) on the implementation computer. It's read-only: no installs and no sign-ins.
  - Write `ENVIRONMENT-CHECK.md` and send the owner **one** message with the blockers and the owner-confirm questions.
  - **Don't install or configure anything yourself.** For each missing item, give the owner the exact no-admin command from `01-setup.md` §1–§4 (or "ask IT" when no per-user option exists). Wait until they confirm, then re-run the failed checks.
  - Don't continue past M0 while a blocking item is open, unless the owner accepts the listed fallback.
- Create the skeleton (`02` §6).
- Copy `vendor/*` into `reference/` (bundle `README.md`, "First implementation step"). Don't copy `vscode-docs/` or `github-copilot-docs/`; they're implementer references.
- Write `environment.yml`, `tools/pyproject.toml`, the wrappers (`04` §0), and `.gitignore` (`02` §6).
- Write `AGENTS.md`, `.github/copilot-instructions.md` and the 3 instructions files (`05` §1–3).
- **Accept:** `ENVIRONMENT-CHECK.md` exists, and every FAIL is resolved or has an owner-accepted fallback; after the **owner** has created the env (`conda env create -f environment.yml`) and run the npm installs (`01-setup.md` §2–§3), `pbi --version` works through the wrapper. The kit runs from source via `PYTHONPATH`, so there's no `pip install`.

### M1: Core infrastructure
- `paths.py`, `io.py` (UTF-8 without BOM; a CRLF writer for TMDL/JSON outputs), `config.py`, `state.py` (phases, gates, staleness: `03` §2), `cli.py` (all sub-commands; JSON envelope; exit codes: `04` §2).
- JSON Schemas for the 5 specs, from the tables in `03`. `specs.py` handles schema + semantic checks with SPEC codes.
- Commands: `init`, `status`, `log`, `gate`, `questions`, `template check`, `doctor` (`04` §11). `doctor --full` re-runs the `11-environment-check.md` list from Python (`subprocess`, plus `winreg` on Windows) and rewrites `ENVIRONMENT-CHECK.md`.
- Until the owner provides the blank PBIP, use a provisional blank (`04` §5.9; `01` §12) marked with `PROVISIONAL.txt`.
- **Accept:** unit tests for state transitions and staleness, gates, the questions round-trip, and config defaults; `pbi init Demo` creates the project skeleton.

### M2: Synthetic example and profiler
- `example.py`: the HarborOutfitters workbook and CSV with every quirk in `04` §13, plus the example brief.
- `profile/*` (`04` §4): discovery, regions, header detection, types, roles, grain, relationships, wide format, issue codes, PII masking, drafting, `profile.md`, `docs/data-quality.md`.
- `intake` with the rubric (`06` §5).
- **Accept:**
  - the profiler finds Orders (header row 4, skip 3; TOTAL_ROW, REPEATED_HEADER, TEXT_DATES, TEXT_NUMBERS, TRAILING_SPACES, CODES_UNEXPLAINED on Status), tblProducts (an Excel table), Stores (MERGED_CELLS → fill_down; PII on Store Manager), Targets (WIDE_FORMAT), Notes (notes only), and the returns CSV
  - relationship candidates: Orders.Product Code → Products, Orders.Store → Stores (CASE_OR_SPACE_MISMATCH), Returns.Order ID → Orders
  - the drafted `sources.yaml` passes `check-spec`
  - the example brief scores ≥ 0.75

### M3: Transforms
- `transforms/to_m.py` (the exact templates in `04` §3.3), `to_pandas.py` (§3.4), `duck.py` (§3.5), `preview-source`.
- **Accept:**
  - golden tests for every step's M output and for the whole example `Sales` query
  - pandas semantics tests (`04` §14)
  - `preview-source` on the example `sources.yaml` (`03` §4.6) reports 0 conversion errors and the expected row counts

### M4: KPI tooling
- Semantic checks for `kpis.yaml` and `model.yaml` (`03` §5–6).
- `model/measures.py`: base measures, time-intelligence variants, targets (`% of Target`, `vs Target`, `vs Target %`), status/color, `min_base`, helpers (`07` §5), the dependency sort and formats (`07` §6).
- `kpi/sql.py` and `expected.py` (`04` §8.1–8.2); `docs --only kpi-catalog`.
- Checked-in example specs `tools/tests/fixtures/example-specs/*.yaml`, with at least these KPIs:
  - Net Revenue (with a data target)
  - Gross Margin %
  - Orders
  - Average Order Value
  - Return Rate % (inactive relationship via USERELATIONSHIP; `thresholds.on: value`)
  - Avg Days to Ship
- **Accept:** every example KPI's SQL runs and the values are plausible; generated DAX golden tests; the catalog renders with every field.

### M5: Semantic model build (TMDL)
- `model/tmdl.py` (quoting, indentation, descriptions, expression blocks: `04` §5.2), `build.py` (§5.1, 5.3–5.8), `date_table.py` (§5.5), manifest and drift handling (§5.10; `02` §8).
- `validate --model`: `tmdl_lint.py` plus the model PBA rules (`04` §7.3–7.4).
- **Accept:**
  - golden TMDL for the example
  - lint passes
  - no BOM, CRLF line endings, tabs only
  - a rebuild with no spec change is byte-identical
  - a hand-edited file triggers exit 4

### M6: Report build (PBIR)
- Built-in visual templates from the verbatim MIT examples in `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/{card,kpi,cartesian-part-03,cartesian-part-04,table,slicers,textbox}.md` (with `NOTICE.md`).
- `report/*`: fields, layout (`08` §3), visual builders (`04` §6.6), the page header and global slicers, the About page (`08` §7), the theme (`08` §5; `04` §6.10), the `report.json`, `pages.json` and `.pbip` edits, `$schema` selection (§6.11), wireframes (`08` §8).
- `validate`: the schema registry (`04` §7.1–7.2, reference code included), all PBA rules, the MS CLI adapter (§7.5).
- **Accept:**
  - every generated JSON validates against the vendored schemas
  - layout tests (overflow, 8px grid)
  - IDs are stable across rebuilds
  - `powerbi-report-author validate` passes on the example (installed by the owner per `01-setup.md` §3; if it isn't installed, record it as skipped and ask the owner)

### M7: QA, docs, publish check, selftest
- `kpi/daxq.py` and `reconcile.py` (`04` §8.3–8.4; `07` §8)
- the bridge adapters `reload` and `screenshots` (`04` §11; `10` §2)
- `docs/build.py` with every document (`04` §9)
- `publish.py` (§10)
- `set-source`, including SharePoint/OneDrive URL parsing (`04` §10.1)
- `mcp-config` (`04` §11.1): generates `.mcp.json` from the installed MCP package; never installs it
- `selftest`
- **Accept:**
  - `pbi selftest` passes end-to-end (Linux/WSL or Windows) with zero errors
  - the reconciliation tests (tolerance, normalization, classification) pass using synthetic DAX results built from the expected values, with injected mismatches
  - `set-source` parsing tests pass for every URL form in `04` §10.1, and switching local → sharepoint → local regenerates M that contains no `File.Contents` in SharePoint mode

### M8: Copilot layer
- Write the 7 agent files and 8 skills, with their supporting files:
  - `rubric.md` ← `06` §5
  - `profiling-checklist.md` ← `04` §4.10 plus how to handle each code
  - `kpi-patterns.md` ← `07` §4
  - `dax-patterns.md` ← `07` §5–6
  - `modeling-checklist.md` / `modeling-rules.md` ← `07` §7 + `09` §2
  - `design-rules.md` ← `08`
  - `visual-types.md` ← `03` §7.3 + `04` §6.6
  - `reconciliation.md` ← `07` §8
- Also `.mcp.json.example` plus `pbi mcp-config` (writes the machine-specific `.mcp.json` with `--readonly`), and `.vscode/settings.json` (`05` §4–7).
- **Accept:** the checks in `05` §8 (Agent Customizations editor: 7 agents and 8 skills with no errors; CLI `/agent`, `/skills list`, `/mcp`, `/instructions`; a non-interactive smoke test). If Copilot isn't available to the implementer, prepare the checklist for the owner (`NEEDS-FROM-USER.md`).

### M9: User documentation and gallery
- `docs/SETUP.md` (from `01`), `docs/CONTEXT-GUIDE.md` and `docs/templates/*` (from `06`).
- `docs/USER-GUIDE.md`, covering:
  - the workflow and gates
  - every `pbi` command
  - a spec reference condensed from `03`
  - change requests
  - fast mode
  - FAQ and troubleshooting
- Root `README.md` quick start.
- `gallery.py`: `gallery-model` (with `GALLERY-INSTRUCTIONS.md`) and `harvest-templates` (`04` §12).
- **Accept:** a new user can follow SETUP.md from scratch; `gallery-model` output passes `validate`.

### M10: Windows end-to-end with the owner
0. If this is a different computer from the implementation machine, re-run the environment check (`11-environment-check.md`, or `pbi doctor --full`) on the owner's Windows/Power BI machine.
1. The owner saves the blank PBIP (`01` §5) → `pbi template check` → remove the provisional blank → rebuild the example.
2. The owner builds the gallery (`01` §6) → `pbi harvest-templates` → rebuild.
3. Open `projects/_example/output/HarborOutfitters/HarborOutfitters.pbip` in Desktop → Refresh → all pages render.
4. Run QA through Copilot (VS Code and CLI): MCP reconciliation passes; screenshots are reviewed.
5. Work through the verification log in `09-format-reference.md` §6 and fix the generator for every "changed" item.
6. Run one full **real** project on the owner's spreadsheets in gated mode, in both hosts.
7. Upload the example inputs to a SharePoint test folder → `pbi set-source -p _example --sharepoint-url "<link>"` → Desktop refresh → publish to a test workspace from Desktop → set OAuth2 credentials → scheduled refresh succeeds without a gateway.

## Verification summary
- **Unit and golden tests:** `conda run -n pbiagent pytest tools/tests -q` covers the profiler, transforms (M golden + pandas semantics), TMDL golden, measures, report layout and schema validity, lint, SQL rewriting and reconciliation.
- **Selftest:** `pbi selftest` builds and validates the synthetic example offline, including `powerbi-report-author validate` when installed.
- **Desktop:** the example and one real project open and refresh with no errors, and the visuals render as wireframed.
- **Correctness:** KPI reconciliation (DAX via the MCP vs DuckDB SQL) passes for every headline KPI at the grand total and on each slice.
- **Hosts:** the same project runs through `pbi-orchestrator` in VS Code (Copilot harness) and Copilot CLI, honoring the gates; fast mode logs its assumptions.
- **Offline:** with GitHub blocked, nothing fetches from github.com (scaffold uses `--offline`; schemas are vendored).
- **Publishing:** a Desktop publish to a Pro workspace works; SharePoint-mode scheduled refresh needs no gateway.
