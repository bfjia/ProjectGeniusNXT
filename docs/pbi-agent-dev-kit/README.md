# PBI Agent Kit: implementation bundle

This folder is the complete implementation package for the Copilot-driven Power BI dashboard agent kit. It's self-contained: copy the whole folder to the machine where you implement.

**Start with `00-PLAN.md`** (the plan: decisions, milestones, acceptance criteria). `NEEDS-FROM-USER.md` lists everything the project owner must provide or decide, and when.

**The implementer has no GitHub access.** Everything needed from GitHub has been downloaded into `vendor/`. Microsoft Learn pages were also converted to Markdown so they can be read offline. Do not try to fetch anything from github.com. If a fact is missing, check `vendor/` first (use `grep -ri` across the folder). If it isn't there, follow the "verify against the blank PBIP" rule in `09-format-reference.md`.

## Reading order

| # | File | What it is |
|---|------|-----------|
| 0 | `00-PLAN.md` | The implementation plan: context, decisions, milestones M0–M10 with acceptance criteria, verification. |
| – | `NEEDS-FROM-USER.md` | What the project owner must provide, decide, run or approve, by milestone. |
| 1 | `01-setup.md` | Setup instructions, for the end user and for the implementer's dev machine. Becomes `docs/SETUP.md` in the kit. |
| 2 | `02-architecture.md` | Design decisions, components, phase state machine, folder layouts, agent/skill map. |
| 3 | `03-specs.md` | The YAML contracts between phases (`project.yaml`, `state.yaml`, `sources.yaml`, `model.yaml`, `kpis.yaml`, `report.yaml`) with a full worked example. |
| 4 | `04-python-core.md` | Module-by-module spec of the `pbiagent` Python package: CLI, algorithms, generators, validators, tests. |
| 5 | `05-copilot-files.md` | Content of every Copilot customization file: `AGENTS.md`, agents, skills, instructions, `.mcp.json`. |
| 6 | `06-context-guide.md` | User-facing guide to providing good context, plus templates. Becomes `docs/CONTEXT-GUIDE.md` and `docs/templates/*`. |
| 7 | `07-kpi-framework.md` | KPI design method, catalog fields, KPI pattern library, DAX pattern library, reconciliation SQL. |
| 8 | `08-report-design.md` | Page archetypes, layout grid, visual selection, theme, About page, accessibility. |
| 9 | `09-format-reference.md` | Condensed, verified reference for PBIP, TMDL and PBIR (with pointers into `vendor/`). |
| 10 | `10-tooling-reference.md` | Microsoft report CLI, Desktop Bridge CLI, Modeling MCP, Copilot CLI flags, publishing and refresh. |
| 11 | `11-environment-check.md` | Read-only machine, account and permission checks the implementation agent runs **first** (M0), plus the `ENVIRONMENT-CHECK.md` report template. |

## Vendored material (`vendor/`)

| Folder | Source | License | Used for |
|---|---|---|---|
| `json-schemas/fabric/...` | github.com/microsoft/json-schemas (commit in `SOURCE_COMMIT.txt`) | MIT (see `LICENSE`) | Offline JSON-schema validation of PBIR/PBIP files. Copy to `reference/json-schemas/` in the kit. |
| `report-theme-schema/reportThemeSchema-2.159.json` | github.com/microsoft/powerbi-desktop-samples | MIT | Validating the custom theme JSON. |
| `skills-for-fabric/powerbi-authoring/` | github.com/microsoft/skills-for-fabric (plugin `powerbi-authoring`) **as read-only docs; the plugin isn't installed, and its manifests are disabled. Only the files listed in `skills-for-fabric/APPLICABILITY.md` apply (no Fabric).** | MIT (`skills-for-fabric/LICENSE`) | Deep reference for PBIR visual JSON (`skills/powerbi-report-cli/references/authoring/*.md`), design guidance (`.../references/design/*.md`), and TMDL/modeling rules (`skills/semantic-model-authoring/references/*.md`). |
| `powerbi-modeling-mcp/` | github.com/microsoft/powerbi-modeling-mcp README + TROUBLESHOOTING | MIT | MCP server setup, flags, tools. |
| `npm-readmes/` | npm registry READMEs + package metadata for `@microsoft/powerbi-report-authoring-cli` 0.5.0, `@microsoft/powerbi-desktop-bridge-cli` 1.1.0, `@microsoft/powerbi-modeling-mcp` 1.0.1 | MIT | CLI command references. |
| `vscode-docs/docs/...` | github.com/microsoft/vscode-docs (Copilot customization pages) | CC-BY-4.0 / MIT (`LICENSE.md`) | Exact `.agent.md`, `SKILL.md`, instructions and MCP formats for VS Code. |
| `github-copilot-docs/content/copilot/...` | github.com/github/docs (Copilot CLI pages) | CC-BY-4.0 (`LICENSE`) | Copilot CLI install, custom agents, skills, MCP, permissions. (Liquid `{% data ... %}` placeholders appear in the text; read them as "GitHub Copilot" / "Copilot CLI".) |
| `learn/...` (167 pages) | learn.microsoft.com pages converted to Markdown on 2026-11-23/24 (source URL in the first line of each file) | Microsoft Learn terms | PBIP/TMDL/PBIR docs, modeling guidance, Power Query M and DAX function references, refresh/gateway and Fabric REST docs. |

### Where things are in `vendor/learn/`

- `pbip/`: projects-overview, projects-report (PBIR), projects-dataset (TMDL folder), projects-external-editing, projects-git, source-code-format (.platform)
- `tmdl/`: tmdl-overview, tmdl-how-to, tmdl-scripts, desktop-tmdl-view, lineage tags
- `agentic/`: Power BI agentic overview, semantic-model skill, report skill, Desktop Bridge, MCP servers overview, Authoring MCP
- `modeling/`: star schema, date tables (two pages), relationships, DIVIDE, variables, data reduction, measures, connect to Excel, OneDrive for Business links
- `report/`: themes, accessibility, visualization types, dashboard design tips, conditional formatting (tables, titles), KPI visual
- `publish/`: refresh (data, scheduled, Excel on OneDrive, personal gateway), Desktop publish, licenses (Pro/PPU on shared capacity). The Fabric REST pages (item definitions, create/update semantic model and report, LRO, quickstart) are **background only**: Fabric REST publishing is out of scope.
- `powerquery-m/` (52 pages): function reference pages:
  - sources: Excel.Workbook, Excel.CurrentWorkbook, Csv.Document, File.Contents, Folder.Files, SharePoint.Files/Contents, Web.Contents
  - every Table.* function the transform vocabulary emits (Skip, PromoteHeaders, SelectColumns, RemoveColumns, RenameColumns, TransformColumns, SelectRows, ReplaceValue, FillDown, UnpivotOtherColumns, TransformColumnTypes, Distinct, AddColumn, Combine, Range, FirstN, …)
  - List.Contains/IsEmpty/RemoveMatchingItems, Record.FieldValues, Replacer.ReplaceValue
  - Text.Trim/Clean/StartsWith/EndsWith/From, Date.From/FromText/StartOfMonth, Number.FromText, #table, #date
  - the M spec intro, lexical structure (string escaping), operators, error handling, query parameters, data types
- `dax/` (65 pages): function reference pages:
  - aggregation: DIVIDE, CALCULATE, CALCULATETABLE, SUM/SUMX, AVERAGEX, MINX/MAXX/MEDIANX, DISTINCTCOUNT/DISTINCTCOUNTNOBLANK, COUNTROWS
  - time intelligence: SAMEPERIODLASTYEAR, DATEADD, DATESYTD/DATESMTD/DATESQTD, TOTALYTD, DATESINPERIOD, LASTDATE, LASTNONBLANK, PREVIOUSMONTH, PARALLELPERIOD
  - filtering and evaluation: SELECTEDVALUE, FILTER, ALL/ALLSELECTED/REMOVEFILTERS/KEEPFILTERS, ISFILTERED, ISINSCOPE, HASONEVALUE, USERELATIONSHIP, RELATED
  - logical, math and text: IF, SWITCH, ISBLANK, BLANK, COALESCE, MOD, INT, FORMAT plus the numeric format pages
  - dates: DATE, YEAR, MONTH, QUARTER, WEEKDAY, TODAY
  - tables: CALENDAR, ADDCOLUMNS, ROW, UNION, DISTINCT (column and table), VALUES, RANKX, TOPN, SUMMARIZECOLUMNS
  - language: VAR, EVALUATE and DAX queries, the DAX syntax reference, the operator reference

## About "Fabric" in this bundle
The owner's organization hasn't approved Microsoft Fabric, and **the kit doesn't use it**: no Fabric capacity, Fabric items, Fabric REST APIs, Fabric CLI, Direct Lake or XMLA. The word appears only because:
1. Microsoft publishes the PBIP/PBIR **file-format schemas** under `json-schemas/fabric/`. They're offline files.
2. Microsoft's Power BI agent docs live in a repo named `skills-for-fabric`. Only its local-authoring files are used; see `skills-for-fabric/APPLICABILITY.md`.
3. Every PBIP contains `.platform` metadata files, which Desktop writes; they're harmless.

Publishing is **Power BI Desktop → Pro/PPU workspace**, which is standard Power BI on the tenant's shared capacity.

## First implementation step

Copy the vendored material into the kit repo so the runtime agents (which also have no GitHub access) can use it:

```
<kit>/reference/json-schemas/            <- vendor/json-schemas/
<kit>/reference/report-theme-schema/     <- vendor/report-theme-schema/
<kit>/reference/microsoft-skills-for-fabric/  <- vendor/skills-for-fabric/   (keep LICENSE + SOURCE_COMMIT.txt)
<kit>/reference/powerbi-modeling-mcp/    <- vendor/powerbi-modeling-mcp/
<kit>/reference/npm-readmes/             <- vendor/npm-readmes/
<kit>/reference/learn/                   <- vendor/learn/
```

`vscode-docs/` and `github-copilot-docs/` are implementer references only. Do **not** copy them into the kit.

**Important:** never put the Microsoft skills under `.github/skills/`. If they sit there, their descriptions would auto-trigger and compete with the kit's own skills. They live under `reference/` and the kit's skills link to specific files inside them.
