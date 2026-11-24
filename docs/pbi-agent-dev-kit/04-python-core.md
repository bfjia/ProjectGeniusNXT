# 04: Python core (`pbiagent`) specification

Package root: `tools/pbiagent/`. Python 3.11. Only stdlib plus the packages in `environment.yml`. Every command must work offline.

## 0. Environment and packaging

`environment.yml` (kit root):
```yaml
name: pbiagent
channels: [conda-forge, nodefaults]      # conda-forge only; avoids the Anaconda defaults channel
dependencies:
  - python=3.11
  - nodejs=22                            # Node for the Microsoft npm tools and Copilot CLI, no admin needed
  - pandas>=2.2
  - openpyxl>=3.1
  - duckdb>=1.1
  - pyyaml>=6
  - jinja2>=3.1
  - jsonschema>=4.23
  - referencing>=0.35
  - pytest>=8
  - pip
```

`tools/pyproject.toml`:
```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
[project]
name = "pbiagent"
version = "0.1.0"
requires-python = ">=3.11"
[project.scripts]
pbiagent = "pbiagent.cli:main"
[tool.setuptools.packages.find]
include = ["pbiagent*"]
[tool.setuptools.package-data]
pbiagent = ["schemas/*.json", "templates/**/*"]
```

Wrappers at the kit root:
- `pbi.cmd`:
  ```bat
  @echo off
  set "PYTHONPATH=%~dp0tools;%PYTHONPATH%"
  conda run --no-capture-output -n pbiagent python -m pbiagent %*
  ```
- `pbi` (chmod +x):
  ```bash
  #!/usr/bin/env bash
  export PYTHONPATH="$(cd "$(dirname "$0")" && pwd)/tools${PYTHONPATH:+:$PYTHONPATH}"
  exec conda run --no-capture-output -n pbiagent python -m pbiagent "$@"
  ```

**No `pip install` is needed or performed.** The wrappers put `tools/` on `PYTHONPATH`, so the package runs from source. `pyproject.toml` exists only so the owner *may* `pip install -e tools` if they want a `pbiagent` command; the kit never does that itself. Tests run with `conda run -n pbiagent python -m pytest tools/tests`, where `tools/tests/conftest.py` inserts `tools/` into `sys.path`.

**Never-install rule for the code itself:** no module may call package managers (`pip`, `conda`, `npm`, `npx`, `winget`, `code --install-extension`) or modify user or system configuration. Adapters only *detect* tools (`shutil.which`, `--version`) and report `action: owner` with the command from `docs/SETUP.md`.

**Kit root discovery:** walk up from CWD until a directory containing `AGENTS.md` and `tools/pbiagent/` is found. The `PBIAGENT_HOME` environment variable overrides this. All relative paths (`reference/`, `tools/templates/`) resolve from the kit root.

## 1. Module layout

```
pbiagent/
  __init__.py            __version__
  __main__.py            from .cli import main; main()
  cli.py                 argparse sub-commands → functions; JSON envelope; exit codes
  paths.py               kit root, project resolution, Windows path helpers, long-path check
  io.py                  read/write YAML/JSON/text; write_text_crlf_nobom(); sha256 helpers
  state.py               state.yaml model + transitions + staleness + gates
  config.py              project.yaml load/validate/defaults
  specs.py               load + JSON-schema validate the 4 specs; semantic checks (SPECxxx codes)
  profile/
    reader.py            raw grid readers (xlsx via openpyxl, csv)
    regions.py           table-region detection, header detection
    infer.py             type inference, stats, patterns, role guess, PII
    relate.py            key/grain + relationship candidates
    wide.py              wide-format detection
    draft.py             draft sources.yaml + questions + profile.md rendering
  transforms/
    model.py             dataclasses for SourceTable/Step
    to_m.py              M code emitter
    to_pandas.py         pandas executor (+ error counting)
    duck.py              register executed tables as DuckDB views
  model/
    tmdl.py              low-level TMDL writer: quoting, indentation, descriptions, expressions
    build.py             builds the SemanticModel folder from specs
    date_table.py        Date table DAX + column definitions
    measures.py          KPI → measures (+ time intelligence, target, status, color)
    dax.py               DAX reference quoting helpers
  kpi/
    sql.py               {where}/{group_by} rewriting; DuckDB execution
    expected.py          expected values per slice → work/expected/kpi-values.json
    daxq.py              reconciliation DAX queries
    reconcile.py         compare results vs expected → report
  report/
    spec.py              report.yaml model
    layout.py            grid → pixel positions; overlap/bounds checks
    fields.py            "Table[Column]" / measure-name → PBIR field expressions + queryRefs
    visuals.py           one builder per spec visual type
    templates.py         load builtin/gallery templates; $schema selection
    theme.py             custom theme JSON + registration in report.json
    build.py             assembles the .Report folder + .pbip
    wireframe.py         ASCII wireframe for docs/report-design.md
  validate/
    registry.py          referencing.Registry over reference/json-schemas
    schemas.py           validate every JSON file by its $schema
    tmdl_lint.py         structural TMDL checks
    lint.py              PBA rules (§7.3)
    mscli.py             adapter for powerbi-report-author validate
  docs/
    build.py             renders templates/docs/*.md.j2
  publish.py             publish-check
  adapters.py            doctor checks; bridge (status/reload/screenshot-all); desktop detection
  gallery.py             gallery-model + harvest-templates
  example.py             make-example (synthetic HarborOutfitters data)
  schemas/               project, sources, model, kpis, report .schema.json
  templates/             builtin-visuals/*.json, docs/*.md.j2, theme/base-theme.json, gallery/…
```

## 2. CLI contract

Global flags: `--json` (machine output), `--project PATH|NAME` (NAME resolves to `<kit>/projects/NAME`), `-v`.

JSON envelope (always one object on stdout):
```json
{"ok": true, "command": "profile", "data": {...}, "warnings": [{"code":"W…","message":"…","file":"…","path":"…"}], "errors": []}
```

Exit codes:
- `0` ok (warnings allowed)
- `1` validation/spec errors
- `2` usage error
- `3` missing prerequisite (blank template, env, adapter that was explicitly required)
- `4` drift detected (build refused)
- `5` internal error (with traceback in `data.trace`)

| Command | Args | Does | Writes |
|---|---|---|---|
| `doctor` | `[--project P] [--full]` | Environment checks (§11). With a project, records `capabilities` in `state.yaml`. `--full` runs the complete read-only machine, account and permission check list from `11-environment-check.md` and (re)writes `ENVIRONMENT-CHECK.md` at the kit root. | state.yaml, ENVIRONMENT-CHECK.md |
| `mcp-config` | `[--accept-eula] [--print]` | §11.1. Writes `.mcp.json` for the pre-installed Modeling MCP (absolute node + index.js paths, `--readonly`). Never installs anything; reports `action: owner` if the package or node is missing. | .mcp.json |
| `template check` | | Inspects `tools/templates/blank-pbip/`: detects PBIR/TMDL and the schema versions, and reports problems. | `tools/templates/blank-pbip/template-info.json` |
| `init` | `NAME [--title T] [--from DIR]` | Creates the project skeleton; copies `docs/templates/context-brief.md` to `context/brief.md`; copies files from DIR into `input/`. | project folder |
| `status` | `-p P` | Prints phases, gates, stale items, and the **next action** sentence. | |
| `intake` | `-p P` | Parses `context/*`, scores completeness (rubric in `06-context-guide.md` §5), and lists gaps. | work/context-summary.md |
| `profile` | `-p P [--max-rows N=200000]` | §4. | work/profile.json, profile.md, questions.md (merged), sources.yaml (**only if absent**, else sources.draft.yaml), docs/data-quality.md |
| `preview-source` | `-p P --table T [--rows 15] [--upto-step K]` | Runs the pandas executor for one table and prints the columns, dtypes, row count, conversion error counts per column, the head, and uniqueness of candidate keys. | |
| `questions` | `-p P [--answer ID TEXT] [--assume-all] [--add …]` | Manages questions.md (03 §8). | questions.md, answers.md, decisions.log.md |
| `check-spec` | `-p P [--spec sources,model,kpis,report]` | Schema + semantic checks. | |
| `expected` | `-p P` | Executes every KPI SQL per slice (§8). | work/expected/kpi-values.json |
| `build-model` | `-p P [--force] [--adopt F]` | §5. | output/.../<Name>.SemanticModel |
| `build-report` | `-p P [--force] [--adopt F]` | §6. | output/.../<Name>.Report, <Name>.pbip |
| `build` | `-p P [--force]` | build-model + build-report + validate | |
| `validate` | `-p P [--model] [--report] [--no-mscli]` | §7. | work/validation.json |
| `wireframe` | `-p P` | ASCII wireframes. | docs/report-design.md |
| `dax-queries` | `-p P` | §8.3. | work/reconcile/queries.dax, queries.json |
| `reconcile` | `-p P --results FILE` | §8.4. | work/reconcile/report.json, docs/validation-report.md (section) |
| `screenshots` | `-p P` | Bridge `screenshot-all` into work/screenshots (if available). | |
| `reload` | `-p P` | Bridge `reload --pid` (finds the instance whose current file is this PBIP). | |
| `docs` | `-p P [--only NAME]` | §9. | docs/*.md |
| `gate` | `-p P GATE --approve/--reject [--note N]` | Records the gate decision. | state.yaml, decisions.log.md |
| `log` | `-p P --phase … --decision … --rationale … --source … [--ref …]` | Appends to the decisions log. | decisions.log.md |
| `publish-check` | `-p P` | §10. | docs/publish-checklist.md |
| `set-source` | `-p P (--sharepoint-url URL \| --sharepoint-site URL --sharepoint-folder PATH \| --local WINDOWS_FOLDER) [--no-build]` | §10.1. Switches the data source mode (local copy for development, SharePoint for production), updates `project.yaml`, logs the decision, marks `model_build` and later phases stale, and rebuilds the model unless `--no-build`. | project.yaml, decisions.log.md, output |
| `gallery-model` | `OUTDIR` | §12. | Gallery PBIP + instructions |
| `harvest-templates` | `GALLERY_PBIP` | §12. | tools/templates/gallery/*.json |
| `make-example` | `[--seed 7]` | §13. | projects/_example/input/*, context/brief.md |
| `selftest` | | make-example → profile → apply the checked-in example specs → build → validate → expected. | |

`state.yaml` integration: every command that produces a phase's outputs calls `state.complete(phase, artifacts)`, or `state.fail(phase, error)`. The builders refuse to run if a prerequisite gate is not approved (exit 1 with a message). The only exception is `--force-gate`, which is reserved for `selftest`.

## 3. Transforms (`sources.yaml` → M and → pandas)

### 3.1 Loading
- Parse YAML into dataclasses. Each step is a one-key map; an unknown key is error SPEC010.
- Validate column references **symbolically** by tracking the column list through the steps. The column list before `promote_headers` is `Column1..N`, where N comes from `profile.json` for that sheet region. For `kind: table` it's the Excel table's headers; for csv, the sniffed column count. After a `types` step, the type map is updated.

### 3.2 Readers (pandas side, raw grid → DataFrame with columns `Column1..N`)
- **xlsx sheet:** `openpyxl.load_workbook(path, read_only=False, data_only=True)`. Use the worksheet's used range (`ws.min_row..ws.max_row`, `ws.min_column..ws.max_column`). Note that `Excel.Workbook` starts at the used range too. Values: `None` stays None; datetimes are kept; numbers stay int/float; strings stay str. Strings are **not** trimmed and empty strings are not turned into None (Excel cells rarely hold `""`).
  - Merged cells: openpyxl returns the value only for the top-left cell and None for the others. This matches M.
- **xlsx table:** find the table in `ws.tables[item]`, read its `ref` range, and use the first row as the header (column names exactly as written).
- **csv:** decode with the configured encoding (65001 → `utf-8-sig`, 1252 → `cp1252`). Use `csv.reader` with the delimiter and quote settings; all values are str and empty fields stay `""` (M `Csv.Document` behavior). Pad ragged rows with None up to the max width.
- **`append`:** read each extra source the same way, then concatenate positionally (same N). Different widths → error SPEC020.

### 3.3 M emitter (`to_m.py`), normative templates

Partition M for one table:

```
let
    Source = <SOURCE_EXPR>,
    <step lines…>
in
    <last step name>
```

Step names follow Microsoft's convention: `#"<Past-tense verb phrase>"`, at most 50 characters, unique within the query (a ` 2`, ` 3` suffix is added if needed). Each step line is preceded by a `// <comment>` (≤ 225 chars) explaining it in plain words. The `prev` placeholder below means the previous step's name.

**SOURCE_EXPR by mode/kind** (parameters: `SourceFolder`; `SharePointSite`, `SharePointFolder`):

| mode/kind | M |
|---|---|
| local / sheet | `Source = Excel.Workbook(File.Contents(SourceFolder & "\<file with / replaced by \>"), null, true),`<br>`#"Navigated to <item> sheet" = Source{[Item="<item>",Kind="Sheet"]}[Data],` |
| local / table | same `Source`, then `#"Navigated to <item> table" = Source{[Item="<item>",Kind="Table"]}[Data],` |
| local / csv | `Source = Csv.Document(File.Contents(SourceFolder & "\<file>"), [Delimiter="<d>", Encoding=<enc>, QuoteStyle=QuoteStyle.<Csv\|None>]),` |
| sharepoint / any | `Files = SharePoint.Files(SharePointSite, [ApiVersion = 15]),`<br>`#"Selected <file>" = Table.SelectRows(Files, each [Name] = "<basename>" and Text.EndsWith([Folder Path], SharePointFolder & "/<subdir if any>/")),`<br>`FileContent = #"Selected <file>"{0}[Content],`<br>then `Source = Excel.Workbook(FileContent, null, true),` (or `Csv.Document(FileContent, …)`) and the same navigation as local |
| `append` | build each source block with suffixed names (`Source_2`, `#"Navigated to … 2"`), then `#"Combined sources" = Table.Combine({<nav1>, <nav2>, …}),` |

M string escaping: `"` → `""`. Backslashes are literal. Identifiers are always written as `#"…"`.

**Step templates:**

| Step | M line |
|---|---|
| skip_rows N | `#"Skipped N title rows" = Table.Skip(prev, N),` |
| promote_headers | `#"Promoted headers" = Table.PromoteHeaders(prev, [PromoteAllScalars=true]),` |
| keep_columns | `#"Kept needed columns" = Table.SelectColumns(prev, {"A", "B"}),` |
| remove_columns | `#"Removed unused columns" = Table.RemoveColumns(prev, {"X"}),` |
| rename | `#"Renamed columns" = Table.RenameColumns(prev, {{"Old", "New"}, …}),` |
| trim | `#"Trimmed text" = Table.TransformColumns(prev, {{"A", each if _ is text then Text.Trim(_) else _}, …}),` (for `all_text`, list every column whose tracked type is text, or all columns if untyped) |
| clean_text | same shape with `Text.Clean` |
| remove_blank_rows | `#"Removed blank rows" = Table.SelectRows(prev, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),` |
| filter_rows | `#"Filtered rows" = Table.SelectRows(prev, each <cond1> and <cond2>),` where `not_null` → `[C] <> null and [C] <> ""`, `is_null` → `([C] = null or [C] = "")`, `eq` → `[C] = <lit>`, `ne` → `[C] <> <lit>`, `gt/ge/lt/le` → `[C] > <lit>` etc., `in` → `List.Contains({<lits>}, [C])`, `not_in` → `not List.Contains(…)`, `starts_with` → `(try Text.StartsWith(Text.From([C]), "<v>") otherwise false)`, `not_starts_with` → `not (try Text.StartsWith(Text.From([C]), "<v>") otherwise false)`. Literals: text `"…"`, number `123.45`, date `#date(y,m,d)`, null `null`, bool `true/false`. The column reference is `[C]` if C is a simple identifier, else `[#"C"]`. |
| replace_values | one step per pair: `#"Replaced <old> in <col>" = Table.ReplaceValue(prev, <old>, <new>, Replacer.ReplaceValue, {"<col>"}),` |
| fill_down | `#"Filled down <cols>" = Table.FillDown(prev, {"A"}),` |
| unpivot | `#"Unpivoted columns" = Table.UnpivotOtherColumns(prev, {"<keep…>"}, "<attribute>", "<value>"),` |
| parse_month_label | `#"Parsed <col> as month start" = Table.AddColumn(prev, "<into>", each <PARSER>, type date),` then `#"Removed <col>" = Table.RemoveColumns(…, {"<col>"}),`. PARSER for `MMM-YYYY`: `Date.FromText("01-" & Text.From([<col>]), [Format="dd-MMM-yyyy", Culture="en-US"])`; `MMMM YYYY`: `Date.FromText("01 " & Text.From([<col>]), [Format="dd MMMM yyyy", Culture="en-US"])`; `YYYY-MM`: `Date.FromText(Text.From([<col>]) & "-01", [Format="yyyy-MM-dd"])`; `MM/YYYY`: `Date.FromText("01/" & Text.From([<col>]), [Format="dd/MM/yyyy"])`. If the cell is already a date (Excel stored a real date), emit `each if [<col>] is date then Date.StartOfMonth([<col>]) else if [<col>] is datetime then Date.StartOfMonth(Date.From([<col>])) else <PARSER>`. |
| types | `#"Changed column types" = Table.TransformColumnTypes(prev, {{"A", type text}, {"B", Int64.Type}, …}, "<culture>"),` (type mapping in 03 §4.4) |
| distinct | `#"Removed duplicates" = Table.Distinct(prev)` or `Table.Distinct(prev, {"K1","K2"})` |
| add_column | `#"Added <name>" = Table.AddColumn(prev, "<name>", each <m>, <M type>),` |
| custom_m | `#"Applied custom step" = (<expr with _ replaced by prev>),`. Replace the token `_` only where it stands alone (regex `(?<![A-Za-z0-9_#"])_(?![A-Za-z0-9_])`). |

The final line has no trailing comma; `in` returns the last step name.

### 3.4 pandas executor (`to_pandas.py`)

Implement each step to mirror §3.3. Key semantics:
- **promote_headers:** the header values come from the first row. Convert to str as M does: datetime → `m/d/yyyy h:mm:ss AM/PM`-style text isn't worth reproducing, so just use `str(value)` and add a warning (`W_HEADER_NONTEXT`) recommending a `rename`. None or `""` → `Column<i>`. Apply duplicate suffixing.
- **types (culture-aware):**
  - `text`: `str(v)`; numbers that are integral floats → `str(int(v))`; datetimes → ISO date. None stays None.
  - `int`: numeric → `round()` using Python's banker's rounding, matching .NET's default to-even rounding in M `Int64.From`; text → parse using the locale's decimal and group separators (en-US `.`/`,`; de-DE, fr-FR, en-GB etc. via a small table). Failure → None plus an error count.
  - `decimal`/`double`/`percent`: as above, without rounding. For `percent`, text ending in `%` is divided by 100.
  - `date`: datetime → `.date()`. Text: parse with formats ordered by locale (en-US: `%m/%d/%Y`, `%m/%d/%y`, `%Y-%m-%d`, `%d-%b-%Y`, `%b %d %Y`, `%B %d, %Y`; en-GB/most others: `%d/%m/%Y` first). Numbers → Excel serial date (`1899-12-30 + n days`), which matches M's conversion of a number to a date. Failure → None plus an error count.
  - `datetime`: as date, but keep the time.
  - `bool`: True/False; text `true/false/yes/no/1/0` (case-insensitive). Anything else → error.
- **filter_rows** comparisons with None follow M three-valued logic: `null > 5` is null, so the row is excluded; `null <> "x"` is true. So: `eq`/`ne` with a non-null literal → `ne` keeps None rows; `gt/ge/lt/le` drop None rows.
- **unpivot** drops null values (M behavior); empty strings are kept.
- Track per-column conversion error counts in the result: `ExecResult(df, column_types, errors_by_column, warnings)`.

### 3.5 DuckDB views (`duck.py`)

After executing every sources table (cached in `work/.cache/<table>.parquet`, keyed by input hash + spec hash), register each as a DuckDB view named exactly after the model table, quoted (`"Sales"`).

Generated tables also become views:
- **Date:** generated in pandas with the same columns as §5.5.
- **calculated tables:** for the simple DAX forms supported for reconciliation (`DISTINCT(T[C])`, and `DISTINCT(UNION(DISTINCT(A[C]), DISTINCT(B[C])))`), parse with a regex and build the view. Any other expression → the view is missing and KPIs that depend on it are marked `reconcile: unverifiable`.

Column names keep their spaces and are always double-quoted in SQL.

## 4. Profiler

### 4.1 Discovery
Scan `input/` (non-recursive, plus one level of sub-folders) for `*.xlsx`, `*.xlsm`, `*.csv`, `*.txt`.
- `*.xls` → warning `W_XLS_UNSUPPORTED`: "Save as .xlsx". Excel.Workbook needs the ACE provider for .xls.
- Ignore files starting with `~$` (Excel lock files).

### 4.2 Raw grid read
Read with the readers in §3.2 (sheet mode), capped at `--max-rows` rows per sheet; flag `TRUNCATED_PROFILE` if the cap is hit. Also collect, per sheet:
- hidden state
- dimension
- merged ranges
- Excel tables (name + ref)
- whether the sheet has charts or pivots (`ws._charts`, and whether the pivot cache exists → note `PIVOT_SHEET`, "likely a report, not data")

openpyxl API notes (openpyxl ≥ 3.1):
- `wb = openpyxl.load_workbook(path, data_only=True)`. Use `read_only=False`: tables and merged ranges aren't available in read-only mode.
- `data_only=True` returns cached formula results. A workbook saved by a program that never calculated it (including openpyxl itself) has `None` for formula cells. The synthetic example therefore writes **values, not formulas**. For user files, flag `FORMULAS_NOT_CACHED` when a column is all None but `data_only=False` shows formulas.
- `ws.sheet_state` ∈ `visible|hidden|veryHidden`; `ws.dimensions` → `"A1:I5007"`; `ws.min_row`, `ws.max_row`, `ws.min_column`, `ws.max_column`.
- `ws.iter_rows(min_row=…, max_row=…, values_only=True)` yields tuples of cell values.
- Excel tables: `ws.tables` is dict-like. `ws.tables.items()` returns `[(name, ref_string)]`; `ws.tables[name].ref` → `"A1:F61"`; header names come from the first row of the ref.
- Merged cells: `ws.merged_cells.ranges`, each a `CellRange` with `.min_row/.max_row/.min_col/.max_col/.coord`.
- Charts and pivots: `ws._charts` and `ws._pivots` are private attributes, so use `getattr(ws, "_charts", [])` and treat them as best-effort.
- Writing (the example generator): `ws.merge_cells("A2:A4")`; an Excel table is `openpyxl.worksheet.table.Table(displayName="tblProducts", ref="A1:F61")` + `ws.add_table(t)`; for real date cells, write `datetime.date` objects with `cell.number_format = "yyyy-mm-dd"`.

### 4.3 Region detection (`regions.py`)
1. Build an occupancy matrix: a cell is non-empty if it isn't None and isn't a whitespace-only string.
2. **Excel tables first.** Each ListObject is a region (`excel_table` set; header row = first row of the ref).
3. For the remaining cells, find connected blocks:
   - Rows with zero occupancy split blocks vertically.
   - Columns that are fully empty within a block split it horizontally.
   - Blocks with fewer than 2 rows or 2 columns are "notes": a candidate title or footnote, recorded as `sheet_notes`.
4. Inside each block, run header detection (4.4). Rows above the header within the block, plus note rows directly above the block, give `skip_rows` (counted from the sheet's used-range top, because that's what `Table.Skip` sees after navigation).
5. More than one region per sheet → each gets an id `Sheet#k`. `draft.py` proposes one sources table per region. A non-first region requires `skip_rows`, `keep_columns` and a filter that cuts the region; if that isn't expressible, emit `custom_m` with `Table.Range(prev, offset, count)` and a matching pandas `iloc`. In that case raise question `Q-REGION` asking the user to split the sheet.

### 4.4 Header detection
For each of the first 15 rows r of a block, compute:
- `text_ratio` = the share of non-empty cells that are non-numeric strings
- `fill_ratio` = the share of the block's columns that are non-empty
- `unique_ratio` = the share of distinct values among the non-empty cells
- `below_type_shift` = the share of columns whose type over rows r+1..r+20 differs from row r's type (text in the header, numbers or dates below)
- `score = 0.35*text_ratio + 0.25*fill_ratio + 0.2*unique_ratio + 0.2*below_type_shift`

The header row is the row with the highest score. `header_confidence` = that score (0–1). If confidence < 0.6, raise question `Q-HEADER-<region>` with the top 2 candidates.

Also detect a **two-row header** (row r has merged cells spanning several columns and row r+1 has more filled cells): propose combining them as `"<top> <bottom>"` via a `rename` after promoting row r+1, and flag `MULTIROW_HEADER`.

### 4.5 Type inference (`infer.py`)
For each column, below the header and across all rows of the region:
- Count Python types: int, float, datetime, bool, str, None.
- For str values, try parsing in this order: int, decimal (locale separators), percent (`12%`), date (formats in §3.4), bool words. Count successes per type.
- `inferred_type` = the type covering ≥ 95% of non-null values, with precedence `date > int > decimal > bool > text`. Use `decimal` when the values have ≤ 4 decimals and the column name or currency symbol suggests money (`price|cost|amount|revenue|sales|$|€|£`); otherwise `double`.
- `mixed_types` = counts when more than one type is present. This drives the `types` step and the data-quality notes.
- **Stats for numerics:** min, max, mean, p50, p99, negatives, zeros, and an IQR outlier count (`< Q1−3·IQR` or `> Q3+3·IQR`).
- **Text:** min/max length, top 5 values with counts (masked if PII), `pattern` (a regex generalized from up to 200 values: letters → `[A-Z]`/`[a-z]`, digits → `\d`, then compressed with counts), and `codes_like` (≤ 10 distinct values, each ≤ 3 characters). `codes_like` triggers question Q-CODES: "What do the codes X/Y/Z mean?".
- **Dates:** min, max, the share with a time component, weekday distribution (detects weekend-only data), and gaps in months.

### 4.6 Role guess
- `key`: unique, not null, and (text with an id-like pattern, int with a sequential tendency, or a name matching `id|code|key|number|no\b`).
- `foreign_key`: an id-like name or pattern, not unique, and contained in another region's key column (see 4.8).
- `date`: `inferred_type` date or datetime.
- `measure`: numeric, not id-like, and either many distinct values or a name matching `amount|qty|quantity|price|cost|revenue|sales|count|hours|days|units|value|score|rate|%`.
- `flag`: bool, or 2 distinct values such as Y/N.
- `dimension`: text with distinct/rows < 0.5, or distinct ≤ 1000.
- `text`: everything else (free text; recommend hiding or excluding it).

### 4.7 Grain and keys
- Try single columns first: a column that's unique and not null is a key candidate. Then try pairs and triples among dimension, key and date columns, limited to combinations with a cardinality product ≥ the row count.
- `grain_guess.statement` is built as: "one row per <key-name humanized>", or "one row per <c1> per <c2>".
- Also detect **exact duplicate rows** (`DUPLICATE_ROWS`, with a count).

### 4.8 Relationship candidates (`relate.py`)
For every pair (A.col, B.col) with compatible types (text–text, int–int; int–text if all text values are digits, flagged `TYPE_MISMATCH_FIXABLE`):
- `containment` = |distinct(A) ∩ distinct(B)| / |distinct(A)|
- keep the pair if containment ≥ 0.8 and B.col is unique (or nearly unique, ≥ 0.98 → flagged `NEAR_UNIQUE`)
- `score = 0.6*containment + 0.2*name_similarity + 0.2*(1 if to_unique else 0)`
- `name_similarity` = token Jaccard after normalizing (lowercase, strip `id|code|key|no`, split on non-alphanumerics)

Compare values after trimming and case-folding, and report `CASE_OR_SPACE_MISMATCH` when exact containment is ≥ 0.1 lower than the normalized containment (the agent then adds `trim` steps). Keep the top 3 per A.col. Record orphan counts and up to 5 samples.

### 4.9 Wide-format detection (`wide.py`)
A region is wide when:
- ≥ 4 header cells match a period pattern: `Jan|Feb|…` with an optional year, `MMM-YY(YY)`, `YYYY-MM`, `Q[1-4] YYYY`, `FY\d{2,4}`, or a pure year `20\d{2}`; or they share a prefix followed by distinct suffixes
- **and** those columns are numeric

Record `{id_columns, value_columns, pattern}` and propose `unpivot` + `parse_month_label` (for month patterns).

### 4.10 Issue codes (region and column level)

`TOTAL_ROW`, `SUBTOTAL_ROWS`, `REPEATED_HEADER`, `MULTIROW_HEADER`, `MERGED_CELLS`, `BLANK_ROWS_INSIDE`, `MIXED_TYPES`, `TEXT_NUMBERS`, `TEXT_DATES`, `AMBIGUOUS_DATES` (both dd/mm and mm/dd parse, and every day ≤ 12), `TIME_COMPONENT`, `FUTURE_DATES`, `NEGATIVE_VALUES`, `OUTLIERS`, `HIGH_NULLS` (> 20%), `CONSTANT_COLUMN`, `DUPLICATE_ROWS`, `DUPLICATE_KEYS`, `TRAILING_SPACES`, `CASE_VARIANTS` ("North" vs "north"), `CODES_UNEXPLAINED`, `PII_DETECTED`, `PIVOT_SHEET`, `HIDDEN_SHEET`, `TRUNCATED_PROFILE`, `WIDE_FORMAT`, `EMPTY_HEADER`, `DUPLICATE_HEADER`.

Detection rules:
- **Total rows:** the first non-empty cell matches `^(grand\s+)?total\b|^sum\b` (case-insensitive) in the last 3 rows, or anywhere for `SUBTOTAL_ROWS`.
- **Repeated header:** a row whose values equal the header row in ≥ 80% of columns.
- **Text numbers/dates:** from `mixed_types`.

Each issue has a `severity` (`info`, `warn`, `blocking`). Blocking issues generate questions; the rest go to `docs/data-quality.md`.

### 4.11 PII detection
- Regexes: email `[^@\s]+@[^@\s]+\.[a-z]{2,}`, phone `^\+?[\d\s().-]{7,}$` (only when the name also suggests phone), and national-ID-like patterns (`\d{3}-\d{2}-\d{4}`, …).
- Header keywords: `name, first, last, email, phone, mobile, address, street, postcode, zip, dob, birth, ssn, sin, nhs, patient, employee id`.
- If ≥ 30% of the sample matches, or a header keyword matches → `pii: "email"` etc. Samples and top values become `<masked:email>`. Columns in `privacy.mask_columns` are always masked.

### 4.12 Drafting `sources.yaml` (`draft.py`)
For each region that isn't a note or pivot, propose:
- `name`: the singular, Title-Case sheet name (or the Excel table name without a `tbl` prefix)
- `role`: `fact` if it has date and measure columns and ≥ 1 foreign key, `dimension` if it has a unique key and mostly text, `target` if wide-format with plan/target/budget words
- `source`
- `steps`: `skip_rows` (if > 0), `promote_headers` (unless an Excel table), filters for total and repeated-header rows, `fill_down` for merged first-column cells, `trim` for `TRAILING_SPACES` columns, `unpivot` for wide format, and a `types` step for all columns using the inferred types

Write `sources.draft.yaml` if `sources.yaml` already exists. The agent reviews and refines the draft; the draft is never auto-applied.

### 4.13 Questions
Generate questions from the blocking issues, `codes_like`, ambiguous dates, multiple relationship candidates with close scores, missing date columns, an unclear grain (no key found), and from intake gaps. Merge them with existing `questions.md`, keeping answered rows and de-duplicating by `(code, target)`.

### 4.14 `profile.md` rendering
A Jinja template with sections:
1. Files & sheets
2. Regions (grain, rows, columns table)
3. Relationship candidates
4. Draft star schema (ASCII: facts in the center and dimensions around them, `Fact ──*:1── Dim`)
5. Data-quality issues
6. Questions raised

## 5. Model build (TMDL)

### 5.1 Output tree
```
<out>/<Name>/<Name>.SemanticModel/
  definition.pbism            copied from blank (fallback §5.9)
  .platform                   from blank, with displayName=<Name> and a NEW logicalId (uuid4, persisted in build-manifest so rebuilds keep it)
  diagramLayout.json          copied from blank if present (Desktop rewrites it)
  definition/
    database.tmdl             copied from blank (keeps compatibilityLevel); fallback §5.9
    model.tmdl                §5.3
    expressions.tmdl          §5.4
    relationships.tmdl        §5.8
    tables/<Table>.tmdl       one per table (§5.6); file name = table name with \/:*?"<>| replaced by _
    cultures/<locale>.tmdl    copied from blank if present (rename the cultureInfo to the project locale when it differs and the file is the default en-US linguistic stub; otherwise drop it and its ref)
```
Never write `.pbi/` (Desktop owns it). Write all files as **UTF-8 without BOM, CRLF line endings**.

### 5.2 TMDL writer primitives (`model/tmdl.py`)
- `qname(name)`: return the name as-is if it matches `^[A-Za-z_][A-Za-z0-9_]*$`; otherwise `'` + name.replace("'", "''") + `'`.
- `colref(table, col)`: `f"{qname(table)}.{qname(col)}"`, used in `fromColumn`/`toColumn`.
- `prop(key, value)`: `key: value`. If the value has leading/trailing whitespace or starts with `"`, wrap it in `"` and double the internal `"`. Booleans that are true are written as the bare key (e.g. `isHidden`); false booleans are omitted unless the default is true (`isActive: false`).
- `desc_lines(text)`: wrap at 100 characters and emit `/// <line>` lines at the object's indent level, directly above the declaration. Strip newlines inside lines. Never use the `description:` property.
- `expr_block(expr, indent)`: if the expression is a single line without a trailing `\`, write `= <expr>` on the declaration line. Otherwise use triple-backtick form:

```
<indent>measure 'X' = ```
<indent+2 tabs>line1
<indent+2 tabs>line2
<indent+2 tabs>```
```

  For `source =` in partitions (M), write `source =` and then the lines at `indent+1` tabs relative to the `source` property line, **without** backticks (Desktop's style). Normalize the M to use 4 spaces for its internal indentation after the tab prefix.
- Indentation is always TAB characters. Level 0 is a top-level object, level 1 its children (columns, measures, partitions), level 2 their properties, level 3 the expression lines.

### 5.3 `model.tmdl`
Start from the blank's `model.tmdl`, parse it line by line, and rebuild:
```
model Model
	culture: <locale>
	defaultPowerBIDataSourceVersion: powerBI_V3
	sourceQueryCulture: <locale>
	<keep any other level-1 properties and sub-blocks from the blank, e.g. dataAccessOptions>

annotation __PBI_TimeIntelligenceEnabled = 0
<keep other annotations from the blank EXCEPT PBI_QueryOrder>

ref table <T1>
ref table <T2>
…
ref cultureInfo <locale>          (only if a cultures file is written)
```
Table order: facts, targets, dimensions (alphabetical), Date, then `_Measures`. If there's no blank, use the block above with nothing kept.

### 5.4 `expressions.tmdl` (parameters)
```
expression SourceFolder = "<local_folder>" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]

expression SharePointSite = "<site>" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]

expression SharePointFolder = "<folder>" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]
```
Emit only the parameters needed for the mode. Each gets a `///` description ("Windows folder containing the source spreadsheets. Change via Transform data → Edit parameters.").

### 5.5 Date table (`model/date_table.py`)

```
/// Calendar table generated by pbiagent. One row per day from <start rule> to <end rule>. Marked as the model date table.
table Date
	dataCategory: Time

	/// Calendar date (day grain). Key of the Date table.
	column Date
		dataType: dateTime
		isKey
		formatString: yyyy-mm-dd
		summarizeBy: none
		sourceColumn: [Date]

	<one column block per generated column; see the table below>

	hierarchy 'Calendar Hierarchy'
		level Year
			column: Year
		level Quarter
			column: Quarter
		level Month
			column: Month
		level Date
			column: Date

	partition Date = calculated
		mode: import
		source = ```
				<DAX below>
				```
```

DAX (the variables are filled from `model.yaml` and `project.yaml`):
```
VAR _MinData = MINX( { <MIN('T'[C]) for each range_from column, comma-separated> }, [Value] )
VAR _MaxData = MAXX( { <MAX('T'[C]) for each range_from column> }, [Value] )
VAR _LastActual = MAXX( { <MAX('T'[C]) for each range_from column whose table role = fact> }, [Value] )
VAR _Start = DATE( YEAR( COALESCE( _MinData, TODAY() ) ), 1, 1 )
VAR _End = DATE( YEAR( COALESCE( _MaxData, TODAY() ) ), 12, 31 )
VAR _FY = <fiscal_year_start_month>
RETURN
ADDCOLUMNS(
    CALENDAR( _Start, _End ),
    "Year", YEAR( [Date] ),
    "Quarter Number", QUARTER( [Date] ),
    "Quarter", "Q" & QUARTER( [Date] ),
    "Month Number", MONTH( [Date] ),
    "Month", FORMAT( [Date], "mmm" ),
    "Month Start", DATE( YEAR( [Date] ), MONTH( [Date] ), 1 ),
    "Year Month Number", YEAR( [Date] ) * 100 + MONTH( [Date] ),
    "Year Month", FORMAT( [Date], "yyyy-mm" ),
    "Week Start", [Date] - WEEKDAY( [Date], <2 if monday else 1> ) + 1,
    "Day of Week Number", WEEKDAY( [Date], <2|1> ),
    "Day of Week", FORMAT( [Date], "ddd" ),
    "Fiscal Year Number", YEAR( [Date] ) + IF( _FY > 1 && MONTH( [Date] ) >= _FY, 1, 0 ),
    "Fiscal Year", "FY" & ( YEAR( [Date] ) + IF( _FY > 1 && MONTH( [Date] ) >= _FY, 1, 0 ) ),
    "Fiscal Month Number", MOD( MONTH( [Date] ) - _FY, 12 ) + 1,
    "Fiscal Quarter", "FQ" & ( INT( MOD( MONTH( [Date] ) - _FY, 12 ) / 3 ) + 1 ),
    "Is Past", [Date] <= COALESCE( _LastActual, TODAY() )
)
```

| Column | dataType | formatString | sortByColumn | hidden |
|---|---|---|---|---|
| Date | dateTime | yyyy-mm-dd | | |
| Year | int64 | 0 | | |
| Quarter Number | int64 | 0 | | ✔ |
| Quarter | string | | Quarter Number | |
| Month Number | int64 | 0 | | ✔ |
| Month | string | | Month Number | |
| Month Start | dateTime | mmm yyyy | | |
| Year Month Number | int64 | 0 | | ✔ |
| Year Month | string | | Year Month Number | |
| Week Start | dateTime | yyyy-mm-dd | | |
| Day of Week Number | int64 | 0 | | ✔ |
| Day of Week | string | | Day of Week Number | |
| Fiscal Year Number | int64 | 0 | | ✔ |
| Fiscal Year | string | | Fiscal Year Number | |
| Fiscal Month Number | int64 | 0 | | ✔ |
| Fiscal Quarter | string | | | |
| Is Past | boolean | | | ✔ |

Every column gets `summarizeBy: none`, `sourceColumn: [<Name>]` and a `///` description.

> **E2E verification point:** if Desktop rejects an explicit `dataType` on a calculated-table column (for example, an inferred-type conflict), remove the `dataType` lines from the calculated-table columns. Desktop infers them. Record the outcome in `09-format-reference.md` §6 ("verified facts").

`is_past` is used by the time-intelligence measures to blank out future periods (07 §5).

### 5.6 Data tables (`tables/<T>.tmdl`)
```
/// <table description>
table <qname(T)>

	/// <column description>
	column <qname(C)>
		dataType: <mapped>
		[formatString: <fmt>]
		[isHidden]
		[dataCategory: <cat>]
		summarizeBy: none
		sourceColumn: <C as prop value>
		[sortByColumn: <qname(sortcol)>]

		annotation SummarizationSetBy = User

	[hierarchy blocks]

	partition <qname(T)> = m
		mode: import
		source =
				let
				    …M from §3.3…
				in
				    #"Changed column types"
```
Notes:
- **Column order** = the final column order from the transforms.
- **Hidden by default:** foreign-key columns (a relationship `from` column), key columns of dimension tables that are pure surrogate ids (name ends with `ID`/`Key` and it isn't the dimension's display name), and columns with role `text` that aren't used in report.yaml.
- **Calculated columns** (`model.yaml.calculated_columns`) go after the data columns:

```
	/// <desc>
	column <qname> = <DAX>
		dataType: <t>
		summarizeBy: none
		[isHidden]
```

- **Calculated tables** (`generated: calculated_table`) use a `= calculated` partition with `source = <DAX>`, and columns with `sourceColumn: [<Name>]`.

### 5.7 `_Measures` table and measure generation (`model/measures.py`)
```
/// Home table for all KPI and helper measures. Each measure description references its KPI id; see docs/kpi-catalog.md.
table _Measures

	<measure blocks>

	column Dummy
		isHidden
		sourceColumn: [Dummy]

	partition _Measures = calculated
		mode: import
		source = ROW("Dummy", BLANK())
```
Measure block:
```
	/// <definition sentence(s)> [KPI-001 | headline | higher is better | target: Finance plan]
	measure <qname(name)> = <expr_block>
		formatString: <fmt>
		displayFolder: <folder path with \ separators>
```
Measures come before columns (Microsoft's convention). The generation order is base KPI measures (dependency-sorted), then variants, targets, status/color, then helper measures. The variant DAX patterns are in `07-kpi-framework.md` §5.

**Dependency sort:** parse `[Name]` references that aren't preceded by `'Table'` or `Table` (a regex for column refs `\w+\[` or `'…'\[`). Measure refs have the form `(?<![\w'\]])\[([^\]]+)\]`. Build a DAG; a cycle is error SPEC050.

### 5.8 `relationships.tmdl`
```
relationship <uuid5(NAMESPACE_URL, "pbiagent:"+from+"->"+to)>
	[isActive: false]
	[crossFilteringBehavior: bothDirections]
	fromColumn: <colref(from)>
	toColumn: <colref(to)>
```
Separate blocks with a blank line. Relationships to the Date table come from `date_table.relationships`.

### 5.9 Fallbacks when there's no blank PBIP (provisional; marked in output)
- `definition.pbism`: `{"$schema": "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json", "version": "4.2", "settings": {}}`
- `.platform` (both items): `{"$schema": "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json", "metadata": {"type": "SemanticModel" | "Report", "displayName": "<Name>"}, "config": {"version": "2.0", "logicalId": "<uuid4>"}}`
- `database.tmdl`: `database <uuid4>` + `\tcompatibilityLevel: 1600`
- The report shell comes from `powerbi-report-author scaffold <tmp> --name <Name> --model-path ../<Name>.SemanticModel --offline` if the CLI exists; otherwise from `tools/templates/fallback-report/` (the implementer creates it once from a scaffold run on the dev machine and checks it in).

### 5.10 Manifest and drift
`build-manifest.json`: `{"generator": "pbiagent <ver>", "built": ts, "logicalIds": {...}, "files": {"<relpath>": {"sha256": "...", "owned_by": "pbiagent|user"}}}`. Hash normalization is in `02-architecture.md` §8. Builders write to a temporary sibling folder, compare, and then swap in the changed files, deleting generated files that are no longer produced (only those marked `owned_by: pbiagent`).

## 6. Report build (PBIR)

### 6.1 Inputs
- the blank report (`tools/templates/blank-pbip/Blank.Report/`)
- templates (`tools/templates/gallery/` if harvested, else `templates/builtin-visuals/`)
- `report.yaml`, `kpis.yaml`, `model.yaml` (the field catalog is built from the generated model)
- `project.yaml` (theme, canvas)

### 6.2 Output tree
```
<Name>.Report/
  .platform                       from blank; displayName=<Name>; persisted logicalId
  definition.pbir                 {"$schema": <blank's>, "version": <blank's>, "datasetReference": {"byPath": {"path": "../<Name>.SemanticModel"}}}
  definition/
    version.json                  copied from blank verbatim
    report.json                   blank's, with the theme registered (§6.10); keep everything else
    pages/pages.json              {"$schema": <blank's>, "pageOrder": [ids…], "activePageName": <first>}
    pages/<pageName>/page.json
    pages/<pageName>/visuals/<visualName>/visual.json
  StaticResources/SharedResources/BaseThemes/*.json   copied from blank
  StaticResources/RegisteredResources/<Theme>-<hex8>.json
<Name>.pbip                       {"$schema": <blank's>, "version": <blank's>, "artifacts": [{"report": {"path": "<Name>.Report"}}], "settings": {"enableAutoRecovery": true}}
.gitignore                        **/.pbi/localSettings.json and **/.pbi/cache.abf
```
Delete the blank's default page folder; the generated pages replace it.

### 6.3 Names and IDs
- Page name: `sha1("page:"+page.id).hexdigest()[:20]`
- Visual name: `sha1("visual:"+page.id+":"+visual_key).hexdigest()[:20]`, where `visual_key` is the row and position index plus the type (stable across rebuilds when the layout doesn't change)
- Filter names: `"Filter" + sha1(...)[:20]`

All names match `^[A-Za-z0-9_-]+$`. Folder name = name.

### 6.4 Layout (`report/layout.py`)
Canvas W×H (default 1280×720):
- margin M = 24
- gutter G = 16
- header band: y=16, height 56
- the content area starts at y = 88

The grid has 12 columns: `colw = (W − 2M − 11G) / 12` (88 px at 1280).

The header band holds:
- the page title textbox: x=M, w=6 columns
- the subtitle (a measure card or text): under the title, height 20
- slicers, right-aligned: each 2 columns wide and 56 high, at most 3

All positions and sizes must be multiples of 8. With M=24, G=16 and colw=88, every column x and span width lands on the 8px grid automatically. Row heights in `report.yaml` must also be multiples of 8 (check-spec error REP011 otherwise).

Rows: y starts at 88; each visual's `x = M + start_col*(colw+G)`, `width = span*colw + (span−1)*G`, `height = row.height`; next `y += row.height + G`.

Validation: the last row's bottom must be ≤ H − M, else error REP010 with the overflow in px. If the spans in a row sum to < 12, the visuals are left-aligned and a warning is raised.

`z` and `tabOrder` are `1000 * (index+1)` in reading order (left→right, top→bottom), which gives a logical screen-reader order.

### 6.5 Field expressions (`report/fields.py`)
- `"Table[Column]"` → `{"Column": {"Expression": {"SourceRef": {"Entity": "Table"}}, "Property": "Column"}}`, queryRef `"Table.Column"`, nativeQueryRef `"Column"`
- a measure name → `{"Measure": {"Expression": {"SourceRef": {"Entity": "_Measures"}}, "Property": "<name>"}}`, queryRef `"_Measures.<name>"`, nativeQueryRef `"<name>"`
- projection: `{"field": <expr>, "queryRef": …, "nativeQueryRef": …}`, plus `"active": true` for Category-like roles with a single column
- Hierarchy levels aren't used in v1. Use plain columns (`Date[Month Start]`) for time axes, which gives a continuous axis.
- Every reference is checked against the model catalog (error REP020 for an unknown field).

### 6.6 Visual builders (`report/visuals.py`)

Each builder:
1. loads the template for its visualType
2. sets `$schema`
3. sets `name` and `position {x, y, z, width, height, tabOrder}`
4. fills `visual.query.queryState.<Role>.projections`
5. applies `sortDefinition` where specified
6. sets the title (`visualContainerObjects.title`)
7. sets the formatting overrides from the theme

Remove template placeholder projections. Never leave an empty role object in queryState; remove the role key instead.

| spec type | visualType | Roles | Builder specifics |
|---|---|---|---|
| cards | `cardVisual` | `Data`: one projection per measure | Width: allow ~250–300 px per callout; error REP030 if `width/len(measures) < 180`. Comparison: if `PY`, add a reference label per callout using `<m> YoY %` when the template has a reference-label slot (from the gallery harvest); otherwise add a second, smaller cardVisual directly below with the `YoY %` measures, height 40. |
| kpi | `kpi` | `Indicator`: measure; `TrendLine`: date column; `Goal`: goal measure | Title = the KPI name. |
| line | `lineChart` | `Category`: x column (active); `Y`: measures; `Series`: optional | `sortDefinition` by the x column, Ascending. |
| column | `clusteredColumnChart` | `Category`, `Y`, `Series?` | default sort: Y[0] Descending, unless the category is a date column (then Ascending). |
| bar | `clusteredBarChart` | `Category`, `Y` | sort by `sort` (desc → `Descending` on Y[0]; category → Ascending on the category). `top_n` → visual-level TopN filter (`filters.md` TopN shape, Direction 2 = Top, ordered by Y[0]). |
| combo | `lineClusteredColumnComboChart` | `Category`; `Y` (columns); `Y2` (lines) | **Verify the role names with `powerbi-report-author catalog describe lineClusteredColumnComboChart`** at implementation time, and record them in `visual-types.md`. |
| donut | `donutChart` | `Category`, `Y` (verify with catalog describe) | error REP031 if the category has > 6 distinct values in the profile and no `top_n`. |
| table | `tableEx` | `Values`: columns and measures in order | `columnHeaders.columnAdjustment 'growToFit'`. Optional sort. |
| matrix | `pivotTable` | `Rows`, `Columns`, `Values` | Set `stylePreset 'None'` only if custom colors are used. |
| scatter | `scatterChart` | `Category` (details), `X`, `Y`, `Size` | |
| text | `textbox` | none | `objects.general[0].properties.paragraphs`: split the text on blank lines into paragraphs and `**bold**` into separate textRuns with `fontWeight: bold`. |
| slicer | `slicer` | `Values`: column | `objects.data[0].properties.mode` = `'Dropdown'` / `'Basic'` (list) / `'Between'` / `'RelativeDatePicker'`; `header.text` = title or column name. Sizes: dropdown 2 cols × 56; between ≥ 216×104; relative ≥ 280×240. |
| raw_visual | as given | as given | Positioned by the layout; the `visual` object is taken verbatim. Run the MS CLI validate. |

**Title:**
- static → `visualContainerObjects.title = [{"properties": {"show": {"expr": {"Literal": {"Value": "true"}}}, "text": {"expr": {"Literal": {"Value": "'<escaped>'"}}}}}]`
- dynamic (`title_measure`) → `"text": {"expr": {"Measure": {"Expression": {"SourceRef": {"Entity": "_Measures"}}, "Property": "<measure>"}}}`

String literals are single-quoted with `'` doubled. Numbers are `"<n>D"`, integers `"<n>L"`, booleans `"true"`/`"false"`.

**Conditional color** (`conditional_color.measure`) for bar/column: `objects.dataPoint = [{"properties": {"fill": {"solid": {"color": {"expr": {"Measure": {"Expression": {"SourceRef": {"Entity": "_Measures"}}, "Property": "<Color measure>"}}}}}}, "selector": {"data": [{"dataViewWildcard": {"matchingOption": 1}}]}}]`. For tables: put `backColor` on the values column with a `metadata` selector of that field's queryRef (see `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/conditional-formatting-part-07.md` Type 6).

**Accessibility:**
- Every visual gets alt text: `visualContainerObjects.general[0].properties.altText = {"expr": {"Literal": {"Value": "'<generated sentence>'"}}}`. The sentence is "<Title>: <type> of <measures> by <category>."
- Verify the property name with `powerbi-report-author formatting describe-object <type> general` (vcos); if it differs, use the CLI's name.

### 6.7 Page header and global slicers
- **Title textbox:** 24px Segoe UI Semibold, foreground color.
- **Subtitle:** if it's `{measure}`, use a `cardVisual` with that measure, label hidden, value font 11, no background. If it's static text, use a textbox at 12px.
- **Global slicers:** the same field on every non-about page, at the same position. Add the same `syncGroup` to each, with `groupName` = the field's queryRef and `fieldChanges`/`filterChanges` = true (`slicers.md` "Slicer sync").

### 6.8 About & Definitions page (`archetype: about`, generated)

Layout: a title, then two columns.
- **Left (span 7):** a textbox "What this report answers" listing the business questions (Q text → page title). Below it, a `tableEx` is impossible for static text, so the KPI definitions go into a textbox. That gives a list of `**<KPI name>**: <definition> (Target: <source>; Confidence: <c>)`. If there are more than 12 KPIs, spread them over two textboxes.
- **Right (span 5):** a textbox "Data sources & refresh" (files, refresh mode, data as of → a cardVisual with `Data As Of`), and "Caveats" (the top caveats from kpis and data quality).

### 6.9 report.json edits
Keep the blank's `report.json` as the base. Change only:
- (a) `themeCollection.customTheme` (§6.10)
- (b) `resourcePackages`: add or update the `RegisteredResources` package
- (c) any `objects`/`settings` the blank already has stay untouched

**Don't** add report-level filters in v1.

### 6.10 Theme (`report/theme.py`)
- Generate `<ThemeName>-<hex8>.json` in `StaticResources/RegisteredResources/`. `hex8` = the first 8 hex characters of the content hash, so the filename changes when the content changes (Desktop caches themes by name).
- The theme JSON's `name` must equal the file name including `.json`.
- `report.json`:
  - `themeCollection.customTheme = {"name": "<file>.json", "reportVersionAtImport": <copy the blank baseTheme's value>, "type": "RegisteredResources"}`
  - `resourcePackages`: an entry `{"name": "RegisteredResources", "type": "RegisteredResources", "items": [{"name": "<file>.json", "path": "<file>.json", "type": "CustomTheme"}]}`. Replace any previous CustomTheme item.
- Theme content: `08-report-design.md` §5. Validate it against `reference/report-theme-schema/reportThemeSchema-2.159.json` (or the version referenced by the blank's base theme `$schema`, if any).

### 6.11 `$schema` selection (`report/templates.py`)
- For each file type, use the `$schema` URL from the blank's file of the same type: `.pbip`, `definition.pbir`, `version.json`, `report.json`, `pages.json`, `page.json`.
- For `visual.json`, use the gallery template's `$schema` if harvested, else the builtin template's (`visualContainer/2.9.0`). Never construct a newer version.
- Then make sure that schema file exists under `reference/json-schemas/`; if it doesn't, validation warns `W_SCHEMA_NOT_VENDORED` and relies on the MS CLI.

## 7. Validation

### 7.1 Schema registry (`validate/registry.py`)
Walk `reference/json-schemas/fabric/**/*.json`. For each file:
- `uri` = its `$id` if present
- else `https://developer.microsoft.com/json-schemas/fabric/` + its path relative to `fabric/`

Build a `referencing.Registry` with `Resource.from_contents(obj, default_specification=DRAFT7)`. Validate with `jsonschema.Draft7Validator(schema, registry=registry)`. Relative `$ref`s resolve against `$id`, so no network is needed. Cache the registry in memory.

All 131 vendored PBIR/PBIP schema files declare draft-07. The report theme schema (`reportThemeSchema-2.159.json`) declares no `$schema` and has no remote `$ref`s, so validate it with `Draft7Validator` directly.

Reference implementation (it uses the public APIs of `referencing` ≥ 0.35 and `jsonschema` ≥ 4.18):
```python
import json, pathlib
import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT7

BASE = "https://developer.microsoft.com/json-schemas/fabric/"

def build_registry(fabric_root: pathlib.Path) -> Registry:
    """fabric_root = <kit>/reference/json-schemas/fabric"""
    pairs = []
    for p in fabric_root.rglob("*.json"):
        obj = json.loads(p.read_text(encoding="utf-8"))
        uri = obj.get("$id") or BASE + p.relative_to(fabric_root).as_posix()
        pairs.append((uri, Resource.from_contents(obj, default_specification=DRAFT7)))
    return Registry().with_resources(pairs)

def validate_instance(instance: dict, registry: Registry) -> list[dict]:
    uri = instance.get("$schema")
    if not uri:
        return [{"code": "W_NO_SCHEMA", "path": "", "message": "file has no $schema"}]
    try:
        schema = registry.contents(uri)
    except Exception:                      # referencing.exceptions.NoSuchResource
        return [{"code": "W_SCHEMA_NOT_VENDORED", "path": "", "message": uri}]
    validator = jsonschema.Draft7Validator(schema, registry=registry)
    return [{"code": "E_SCHEMA", "path": "/".join(map(str, e.absolute_path)), "message": e.message}
            for e in sorted(validator.iter_errors(instance), key=lambda e: list(e.absolute_path))]
```

### 7.2 Which files are validated
Every `*.json` under `<Name>.Report/`, the `.pbip`, `definition.pbism` and `.platform`: look up the file's own `$schema`. If the schema is unknown → `W_SCHEMA_UNKNOWN`. Also validate the theme file (§6.10). Report every error with its file and JSON path.

### 7.3 Lint rules (`validate/lint.py`)

Severity: E = error (fails), W = warning.

| Code | Sev | Rule |
|---|---|---|
| PBA001 | E | Every measure has a `///` description. |
| PBA002 | E | Every measure has a `formatString`. |
| PBA003 | E | Every visible column and table has a description. |
| PBA004 | W | Foreign-key columns are hidden. |
| PBA005 | E | No visible numeric column with `summarizeBy` ≠ none (no implicit measures). |
| PBA006 | E | A Date table with `dataCategory: Time` and an `isKey` date column exists whenever any dateTime column is used in a visual or relationship. |
| PBA007 | E | Relationship columns have equal dataType; the `to` column is unique in the profiled and transformed data. |
| PBA008 | W | `bothDirections` relationship without a justification. |
| PBA009 | E | Every approved headline KPI appears on the first page, and every approved KPI appears somewhere. |
| PBA010 | E | Every field referenced by a visual exists in the model. |
| PBA011 | W | More than 8 data visuals on a page (text, slicers and header not counted). |
| PBA012 | E | Visuals stay within the canvas; no overlapping rectangles (except intentionally stacked card/comparison pairs). |
| PBA013 | E | Every page has a title textbox; every chart/table has a title (static or measure). |
| PBA014 | E | No deprecated visual types: `card`, `multiRowCard`, `map`, `filledMap`, `qnaVisual` (Q&A). |
| PBA015 | E | A KPI with `target.source: assumption` and `status != approved` must not feed a visual Goal or vs-Target measure. |
| PBA016 | E | Measure names are unique (case-insensitive) and contain no `[]`; no leading or trailing spaces. |
| PBA017 | W/E | sharepoint mode: M contains no `File.Contents` (E). local mode: a warning that publishing needs a gateway (W). |
| PBA018 | W | A measure DAX contains `/` division outside strings and comments: use DIVIDE. |
| PBA019 | E | TMDL files are UTF-8 without BOM; indentation uses tabs only; no line starts with spaces followed by an object keyword. |
| PBA020 | W | A generated path is longer than 240 characters (Windows 260 limit). |
| PBA021 | E | A ratio KPI (additivity non_additive) doesn't appear in a table/matrix with a Total row unless its DAX is total-safe (always true for DIVIDE of measures; flag only `AVERAGE`/`AVERAGEX` of ratios). |
| PBA022 | W | A visual uses colors other than theme colors and Color measures. |
| PBA023 | E | Every page answers at least one business question; every priority-1 question is answered on at least one page. |
| PBA024 | W | Low-confidence KPI on the first page without a caveat subtitle. |

### 7.4 TMDL lint (`validate/tmdl_lint.py`)
A line-based state machine:
- level-0 keywords (`model`, `table`, `relationship`, `expression`, `database`, `ref`, `annotation`, `cultureInfo`, `role`, `perspective`, `///`) appear at column 0
- child keywords (`column`, `measure`, `partition`, `hierarchy`, `level`, `calculationGroup`) are indented consistently with tabs
- triple-backtick blocks are balanced
- quoted names are balanced
- the files referenced by `ref table` exist

This doesn't replace the real parser. It catches generator bugs early. If the Modeling MCP is available, the QA agent additionally runs *"Open semantic model from PBIP folder '<path>/definition'"* to make sure it parses.

### 7.5 MS CLI adapter (`validate/mscli.py`)
If `powerbi-report-author` is on PATH:
- run `powerbi-report-author validate "<path to .Report>"` (stdout JSON)
- parse `data.result`, `data.diagnostics`
- map severity → E/W
- include the result in `work/validation.json` under `mscli`

Timeout 120 s. If it isn't found → `W_MSCLI_MISSING` (not an error).

## 8. KPI expected values and reconciliation

### 8.1 SQL rewriting (`kpi/sql.py`)
Input: `formula.sql` with `{where}` (required), and an optional `{group_by}`/`{group_select}`. For a slice `{by: "T[C]", filter: {...}}`:
- `group_select` = `"<alias>"."<C>" AS grp,`, where `<alias>` is found by parsing `FROM`/`JOIN` aliases for table T. Missing → SPEC041.
- `where` = `WHERE <conds>`, where conds come from the filter (`"<alias>"."C" = <literal>`). Normalize `WHERE AND` / a leading `AND` when there are no conds.
- `group_by` = `GROUP BY 1`.
- If the query lacks `{group_select}`, inject it after the first `SELECT` token.

### 8.2 Expected values (`kpi/expected.py`)
For each approved/proposed KPI, each slice, and the base measure (plus `PY` and `YTD` variants evaluated at the latest full year as a sanity check, using SQL date filters on the Date view):
- execute with DuckDB
- store `{kpi_id, measure, slice, rows: [{grp, value}], sql, ok, error}`
- also store dataset-level sanity numbers: row count per table, distinct keys, and the sum of every decimal column per table (used to reconcile the transforms)

### 8.3 DAX queries (`kpi/daxq.py`)
Per slice:
- grand total: `EVALUATE ROW("value", [<Measure>])`
- by: `EVALUATE SUMMARIZECOLUMNS('<T>'[<C>], "value", [<Measure>])`
- filter: `EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(…), '<T>'[<C>] = <lit>)`

Table sanity:
- `EVALUATE ROW("rows", COUNTROWS('<T>'))`
- `EVALUATE ROW("sum", SUM('<T>'[<C>]))` for decimal columns

Write `queries.dax` (human-pasteable, with each query preceded by `// Q<n> <kpi_id> <slice>`) and `queries.json` (`[{id, kpi_id, slice, dax}]`). The QA agent runs each query through the MCP `dax_query_operations` and writes `results.json` as `[{id, rows: [{grp, value}]}]`. Manual mode: the user pastes each result into `results.json` using the template written alongside.

### 8.4 Compare (`kpi/reconcile.py`)
- Match rows by `grp`, normalized: str, stripped, dates as ISO.
- Pass if `abs(a−b) <= max(1e-6, 0.0005*abs(b))`, i.e. relative 0.05%; for counts an exact match is required.
- Output per query: pass/fail, max deviation, the missing groups on each side.
- Classify each failure using the hints:
  - `rows` mismatch → a transform difference
  - a KPI mismatch while table sanity passes → a DAX vs SQL definition difference
  - a sum mismatch only on text-converted columns → a culture/parsing difference
- Write a section into `docs/validation-report.md`.

## 9. Docs generation (`docs/build.py`)

Jinja templates in `templates/docs/`. All docs start with a header block (`Generated by pbiagent <ver> on <date> from <spec hashes>. Do not edit; change the specs.`).

| Doc | Content |
|---|---|
| README.md | Title, purpose, audience, the decisions supported, the page list with the questions each answers, how to open and refresh, how to change the source folder (parameters), owners, the links below. |
| kpi-catalog.md | Questions table, then per KPI: id, name, tier, definition, rationale, decision, formula (DAX in a code block + plain-language restatement), SQL reference, format, direction, additivity, grain, valid dimensions, time-intelligence variants, target + provenance, thresholds, caveats, data quality, confidence, owner, status, assumptions, the visuals where it appears (page/visual title), the reconciliation result. |
| data-dictionary.md | Per table: description, grain, row count, source file/sheet, transform steps in plain language (from the `// comments`), and per column: name, type, description, hidden, sample values (masked), null %. Plus relationships (from → to, cardinality, active) and parameters. |
| data-quality.md | Issues from the profile with severity, how each was handled (the step or KPI caveat), and the residual risk. |
| report-design.md | Per page: purpose, questions, ASCII wireframe, visual list with KPI refs. |
| assumptions-and-decisions.md | From decisions.log.md plus KPI assumptions, grouped by phase; open (unconfirmed) assumptions highlighted first. |
| validation-report.md | Schema/lint/MS CLI results, the reconciliation table, screenshot list, Desktop refresh confirmation, known limitations. |
| publish-checklist.md | §10. |

**Completeness check:**
- every KPI has a definition, a rationale and a target source
- every visible column has a description
- no TODO markers
- every open assumption is listed

## 10. Publish check (`publish.py`)

Produces a checklist with automatic ✔/✖ results:
1. `validate` passes with no errors
2. reconciliation passes, or its failures are accepted (logged)
3. the docs completeness check passes
4. source mode: sharepoint → OK for gateway-free refresh; local → "requires on-premises data gateway (personal mode) on an always-on machine, or switch to SharePoint mode"
5. no `assumption`-sourced targets are shown
6. the parameters hold production values, not dev paths (warn if `SourceFolder` is under `projects/`)
7. the PBIP path is under 200 characters
8. the semantic model name is unique in the workspace (manual check)

It also gives manual steps: Desktop publish, then credentials, gateway, scheduled refresh (Pro 8/day, PPU 48/day), sharing/app, and a test with a viewer account.

Extra checklist items when the project is still in `local` mode:
- "Development used a local copy. Will the production dashboard read from SharePoint/OneDrive? If yes, run `pbi set-source --sharepoint-url …` and re-test the refresh before publishing."

After a switch to `sharepoint`:
- "The SharePoint folder contains every file in `sources.yaml`, with identical file names, sheet and table names, and layouts" (manual ✔)
- "Desktop refresh succeeded against SharePoint" (manual ✔)

### 10.1 `set-source` and SharePoint URL parsing (`paths.py: parse_sharepoint_url`)

Input forms to accept (URL-decode first, so `%20` becomes a space; strip any query string `?…` and fragment `#…`):

| Form | Example | site | folder |
|---|---|---|---|
| Team/communication site folder | `https://contoso.sharepoint.com/sites/Finance/Shared Documents/PowerBI/RetailOps` | `https://contoso.sharepoint.com/sites/Finance` | `Shared Documents/PowerBI/RetailOps` |
| File inside it | `…/sites/Finance/Shared Documents/PowerBI/RetailOps/Sales.xlsx` | same | `Shared Documents/PowerBI/RetailOps` (the file name is dropped; warn if it isn't one of the `sources.yaml` files) |
| `/teams/` sites | `https://contoso.sharepoint.com/teams/Ops/Documents/Data` | `https://contoso.sharepoint.com/teams/Ops` | `Documents/Data` |
| Root site | `https://contoso.sharepoint.com/Shared Documents/Data` | `https://contoso.sharepoint.com` | `Shared Documents/Data` |
| OneDrive for Business | `https://contoso-my.sharepoint.com/personal/jane_contoso_com/Documents/PowerBI` | `https://contoso-my.sharepoint.com/personal/jane_contoso_com` | `Documents/PowerBI` |
| Browser "AllItems.aspx" view | `…/sites/Finance/Shared Documents/Forms/AllItems.aspx?id=/sites/Finance/Shared Documents/PowerBI/RetailOps&viewid=…` | from the `id` query parameter: `/sites/Finance` → `https://contoso.sharepoint.com/sites/Finance` | the remainder: `Shared Documents/PowerBI/RetailOps` |
| Path-style sharing link | `https://contoso.sharepoint.com/:f:/r/sites/Finance/Shared Documents/PowerBI?csf=1&web=1` | drop the `/:x:/r` prefix (`x` ∈ `f`, `x`, `w`, `p`, `b`, `u`), then parse as above | |
| Token sharing link | `https://contoso.sharepoint.com/:x:/g/personal/…/EaBc…?e=Xy12` or `/:x:/s/…` | **can't be resolved offline**: exit 2 with the hint "Open the link, then copy the address of the containing folder (or use Details → Path)". | |

Rules:
- The site is `scheme://host` + (`/sites/<name>` | `/teams/<name>` | `/personal/<name>` | nothing).
- The folder is the rest of the path without leading or trailing `/`.
- Reject hosts that aren't `*.sharepoint.com` with a warning: *"not a SharePoint Online URL; on-premises SharePoint needs a gateway"*. Allow `--force` to keep the URL anyway.
- Write `source.mode: sharepoint`, `source.sharepoint_site`, `source.sharepoint_folder` and `source.sharepoint_url` (the original link, for documentation) to `project.yaml`. **Keep `source.local_folder`**, so that `--local` can switch back.
- **M emitted in SharePoint mode** (§3.3): `SharePoint.Files(SharePointSite, [ApiVersion = 15])` filtered by `[Name]` and `Text.EndsWith([Folder Path], SharePointFolder & "/")`. `[Folder Path]` is the full decoded URL of the folder, ending in `/`, which is why the folder is stored decoded.
- **Tests:** every row of the table above, plus a URL with a trailing slash, uppercase host, and `%2F`-encoded segments.

## 11. Doctor and adapters (`adapters.py`)

| Check | How |
|---|---|
| python env | `sys.version`, `importlib.metadata.version` for each dependency |
| kit structure | `reference/json-schemas`, `tools/templates/blank-pbip` (+ `template check`) |
| node | `node --version` ≥ 22 (conda env or PATH); `npm root -g` (where global packages live) |
| Copilot CLI | `copilot --version` (optional; PATH or env) |
| modeling MCP package | `<npm root -g>/@microsoft/powerbi-modeling-mcp/index.js` exists; `package.json` version = 1.0.1 |
| ms report CLI | `powerbi-report-author --version`; `powerbi-report-author doctor` (parse JSON) |
| bridge | `powerbi-desktop --help` exit 0; `powerbi-desktop status --json` if supported, else parse the text |
| Desktop installed (Windows) | check `%ProgramFiles%\Microsoft Power BI Desktop\bin\PBIDesktop.exe` and the Store install (`%LOCALAPPDATA%\Microsoft\WindowsApps\PBIDesktopStore.exe`); on non-Windows → `WARN not windows` |
| `.mcp.json` | parse; server `powerbi-modeling` present |
| path lengths | longest expected output path < 240 |
| OneDrive | warn if the kit root or output root path contains `\OneDrive` or `/OneDrive` |

Bridge helpers:
- `find_instance(pbip_path)`: `powerbi-desktop status`, then match the current file path, case-insensitively and after normalization
- `reload(pid)`
- `screenshot_all(pid, outdir, scale=1)`

All calls go through `subprocess.run([...], capture_output=True, text=True, timeout=…)` with `shell=False` (Windows: resolve `.cmd` shims with `shutil.which`).

**Doctor output for missing items.** Every check result is one of `OK`, `WARN` or `MISSING`; `MISSING` and `WARN` carry `action`:
- `owner`: the owner can fix it without admin, and `fix` contains the exact command from `docs/SETUP.md`
- `it`: needs IT or admin, e.g. a policy or the gateway
- `none`: optional, with the fallback described

The JSON envelope lists them under `data.actions`. Agents relay them verbatim and stop. **Doctor never runs a fix.**

### 11.1 `mcp-config` (generate `.mcp.json`; never installs)
`pbi mcp-config [--accept-eula] [--print]`:
1. Find `node`: first `shutil.which("node")` inside the `pbiagent` env (`sys.prefix`; on Windows `node.exe` sits at the env root), then PATH. It must report a version ≥ 18, the MCP's minimum. Missing → `MISSING action: owner` with `conda env update -f environment.yml`.
2. Find the package: `npm root -g` (via the same env) → `<root>/@microsoft/powerbi-modeling-mcp/index.js` (the package's `bin` entry is `index.js`). Missing → `MISSING action: owner` with `npm install -g @microsoft/powerbi-modeling-mcp@1.0.1` (run in the activated env). **Don't install it.**
3. Write `.mcp.json` at the kit root: `{"mcpServers": {"powerbi-modeling": {"type": "stdio", "command": "<abs node path>", "args": ["<abs index.js path>", "--start", "--readonly"]}}}`, adding `"--accepteula"` only with `--accept-eula`, which the owner passes after reading the EULA. Use absolute paths, so no shell, `npx` or PATH lookup is needed by the MCP host.
4. `--print` prints the JSON without writing it.

`.mcp.json` is gitignored; `.mcp.json.example` (same shape, placeholder paths) is committed.

## 12. Gallery (`gallery.py`)

`gallery-model OUTDIR` writes a PBIP named `Gallery`:
- **Model:** a `Sales` table with an M partition built from `#table(type table [Date=date, Region=text, Category=text, Amount=number, Qty=Int64.Type], {{#date(2025,1,1),"North","A",100,1}, …})` (60 rows), plus a `Date` table (§5.5), measures `Total Amount`, `Total Qty`, `Avg Amount`, `Amount PY`, `Title Amount` (text), `Amount Color` (hex text), and the relationships.
- **Report:** the blank report with 3 empty pages named `Cards & KPI`, `Charts`, `Tables & Slicers`.
- **`GALLERY-INSTRUCTIONS.md`**, for the user to follow: on each page, add these visuals:
  - a cardVisual with 3 measures
  - a kpi (Indicator Total Amount, Trend Date[Month Start], Goal Amount PY)
  - a line chart (Month Start × Total Amount, Amount PY)
  - a clustered column chart (Category × Total Amount)
  - a clustered bar chart (Region × Total Amount, sorted descending, with its **title set via fx → Field value → Title Amount** and **bar color set via fx → Field value → Amount Color**)
  - a combo (Month Start; columns Total Amount; line Total Qty)
  - a donut (Category × Total Amount)
  - a table (Region, Category, Total Amount)
  - a matrix (Rows Region, Columns Category, Values Total Amount)
  - a slicer as a dropdown (Region)
  - a slicer as Between (Date)
  - a textbox with one bold and one normal run
  - a scatter (Category details, X Total Qty, Y Total Amount)
  - alt text on one visual

`harvest-templates GALLERY_PBIP`:
- read each visual.json and identify it by `visualType`, plus the title text for the variants
- generalize it: replace the field expressions with placeholders `{{ROLE:<role>:<index>}}`, strip the positions, keep `objects` and `visualContainerObjects` as the template defaults
- write `tools/templates/gallery/<visualType>[--variant].json` and `gallery/index.json` with the role names actually used, the `$schema` versions and the Desktop version

The builders prefer the gallery templates and the harvested role names over the builtin ones.

The builtin templates (`templates/builtin-visuals/*.json`) are written by the implementer from the verbatim examples in `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/{card,kpi,cartesian-part-03,cartesian-part-04,table,slicers,textbox}.md` (MIT; keep the attribution in `templates/builtin-visuals/NOTICE.md`).

## 13. Synthetic example (`example.py`): HarborOutfitters

Deterministic with `random.Random(seed)`, generated with openpyxl:

**`HarborOutfitters_Sales.xlsx`**
- **Sheet `Orders`:**
  - A1 "Harbor Outfitters — Order Export"; A2 "Generated 2026-10-02 by POS"; row 3 empty; header in row 4: `Order ID | Order Date | Store | Product Code | Qty | Unit Price | Discount | Status | Ship Date`.
  - 5,000 order lines, 2024-01-02..2026-09-30, about 3,600 orders (1–3 lines each; the Order ID repeats per line). The line uniqueness key is `Order ID` + `Product Code`, so set the KPI grain to order line.
  - Status: 92% C, 5% R, 3% P.
  - Quirks:
    - 3% of Order Date cells are text `MM/DD/YYYY`
    - 2% of Qty cells are text digits
    - 10% of Store values have trailing spaces
    - 2% blank Ship Date
    - Ship Date 0–5 days after the order
    - Discount 0 for 70% of lines, else 5–20% of the line value
    - one repeated header row at row 2,504
    - a final row `Total` with sums in Qty and Discount
- **Sheet `Products`:** an Excel Table `tblProducts`, 60 products in 5 categories × 3 subcategories. Unit Cost is 35–65% of the typical price. Launch Date.
- **Sheet `Stores`:** a header in row 1; `Region` merged vertically across that region's stores (4 regions: North, South, East, West; 12 stores); Store Manager names (fictional; this triggers PII detection); Open Date; Sq Ft.
- **Sheet `Targets`:** `Region | Jan-2026 | … | Dec-2026`, as monthly revenue targets ≈ 2026 actual run-rate × 1.05 with noise.
- **Sheet `Notes`:** free text ("Data extracted from POS v3…"), which should be detected as notes, not data.

**`returns_2025_2026.csv`**: `Return ID, Order ID, Return Date, Reason, Refund Amount`. The rows correspond to Status R lines, with dates 1–30 days after the order. Reasons: Damaged, Wrong size, Changed mind, Late delivery.

**`context/brief.md`**: a filled example brief:
- audience: regional managers and the COO; decisions: monthly promo budget and staffing per region
- questions:
  - Q1 are regions on track vs target
  - Q2 which categories drive margin
  - Q3 are returns rising, and why
- known KPI: margin = (revenue − cost)/revenue
- fiscal year = calendar year

Checked-in expected specs: `tools/tests/fixtures/example-specs/{sources,model,kpis,report}.yaml`. Selftest copies them into `projects/_example/work/`.

## 14. Tests (`tools/tests/`)

- **test_regions:** fixture workbooks (title rows, two regions in one sheet, a merged header, an Excel table, a pivot-like sheet) → the expected regions, header rows and skip_rows.
- **test_infer:** mixed types, locale numbers (de-DE `1.234,56`), ambiguous dates, PII masking.
- **test_relate:** containment, near-unique, case/space mismatch.
- **test_to_m:** golden-file tests. For each step type the emitted M equals the expected string; the M for the whole example equals `fixtures/golden/Sales.m`.
- **test_to_pandas:** each step's semantics (null handling in filters, unpivot dropping nulls, promote_headers naming, types with error counts).
- **test_tmdl:** golden TMDL files for the example. `qname` edge cases: `Order ID` → `'Order ID'`, `Bob's` → `'Bob''s'`, `Sales` → `Sales`, `% Margin` → `'% Margin'`. Tabs only; CRLF; no BOM.
- **test_measures:** time-intelligence generation for each variant; dependency sort; cycle detection.
- **test_report:** layout math (positions for 12-column spans at 1280), overflow error, IDs stable across runs, field resolution errors, every visual.json validates against the vendored schema, and `pages.json` order.
- **test_validate:** every lint rule has a positive and a negative fixture.
- **test_kpi_sql:** rewriting with by/filter/none; the leading-AND normalization; SPEC041.
- **test_reconcile:** tolerance, group matching, classification.
- **test_selftest (slow):** the full example; asserts zero errors. If `powerbi-report-author` is present, its validate passes as well.
