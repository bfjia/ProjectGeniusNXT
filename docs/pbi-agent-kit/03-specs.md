# 03: Spec contracts (YAML files between phases)

All specs are YAML 1.2, UTF-8. Each has a JSON Schema in `tools/pbiagent/schemas/<name>.schema.json` (draft 2020-12), written by the implementer from the tables below. `pbiagent check-spec <project> [--spec NAME]` validates in two steps:
1. **Schema validation**: types, required fields, enums.
2. **Semantic checks**: cross-references, uniqueness, names, executable SQL.

Errors come back as `{"file":…, "path":"tables[2].steps[4]", "code":"SPEC0xx", "message":…, "hint":…}`.

**Naming rules (apply everywhere)**
- **Project `name`:** `^[A-Za-z][A-Za-z0-9_-]{0,39}$`. It's used for `<Name>.pbip`, `<Name>.SemanticModel`, `<Name>.Report`.
- **Table, column and measure names:**
  - 1–100 characters
  - must not start or end with a space
  - must not contain `[ ] { } " \t \n` or control characters
  - unique within the model, case-insensitively; a measure name must not equal any column name in the same table
- **Display names:** Title Case with spaces ("Net Revenue"). No technical prefixes (`m_`, `fact`).
- **IDs** (`KPI-001`, `Q1`, page ids): `^[A-Za-z0-9_-]+$`.

---

## 1. `project.yaml`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| `name` | string | ✔ | | See naming rules. |
| `title` | string | ✔ | | Human title. Used as the report page header and in docs. |
| `description` | string | | `""` | |
| `mode` | enum `gated`\|`fast` | | `gated` | |
| `gates` | list of enum `kpis`\|`design`\|`publish` | | all three | `publish` is always enforced. |
| `locale` | string (BCP-47) | | `en-US` | Used for M type conversion culture, `model.culture`, and format strings. |
| `currency` | string (ISO 4217) | | `USD` | Picks the currency symbol for format strings (USD→`$`, EUR→`€`, GBP→`£`, CAD→`$`, other → the code as a prefix). |
| `fiscal_year_start_month` | int 1–12 | | `1` | Drives the fiscal columns in the Date table and fiscal YTD. |
| `week_start` | enum `monday`\|`sunday` | | `monday` | |
| `source.mode` | enum `local`\|`sharepoint` | ✔ | `local` | Chosen at build time (D5). |
| `source.local_folder` | string | if local | | A **Windows** path as Power BI Desktop sees it, e.g. `D:\Data\RetailOps`. The profiler reads `input/`; the model reads this folder. They may be the same folder. |
| `source.sharepoint_site` | URL | if sharepoint | | e.g. `https://contoso.sharepoint.com/sites/Finance` (no trailing slash). |
| `source.sharepoint_folder` | string | if sharepoint | | Folder path inside the site, e.g. `Shared Documents/PowerBI/RetailOps` (no leading or trailing slash). Stored URL-decoded. |
| `source.sharepoint_url` | string | | | The original link the owner supplied (documentation only). Written by `pbi set-source`. |

**Development vs production source:** projects are always developed against a **local copy** (`mode: local`). When the production dashboard should read from SharePoint or OneDrive for Business, the owner gives the link, and `pbi set-source -p <Name> --sharepoint-url "<link>"` derives `sharepoint_site` and `sharepoint_folder`, sets `mode: sharepoint`, keeps `local_folder` for switching back (`--local`), and rebuilds. The SharePoint folder must hold files with **the same names, sheets and layouts** as the local copy. URL forms and parsing rules: `04-python-core.md` §10.1.
| `output.root` | path | | `output` | Relative to the project or absolute. The PBIP goes to `<root>/<name>/`. |
| `report.canvas` | `{width:int,height:int}` | | `{1280,720}` | |
| `report.theme` | object | | see `08-report-design.md` §5 | `{name, colors:{primary, secondary, accent, good, bad, neutral, background, foreground}, font_family}` |
| `privacy.sample_rows` | int 0–20 | | `5` | |
| `privacy.mask_columns` | list of column-name globs | | `[]` | Always masked, in addition to auto-detected PII columns. |
| `privacy.disable_pii_detection` | bool | | `false` | |
| `docs.owner` | string | | `""` | Shown in the README and on the About page. |
| `docs.audience` | string | | from brief | |

Example:
```yaml
name: HarborOutfitters
title: Harbor Outfitters — Store Performance
mode: gated
gates: [kpis, design, publish]
locale: en-US
currency: USD
fiscal_year_start_month: 1
source:
  mode: local
  local_folder: 'C:\Users\<you>\pbi\PowerBIAgent\projects\_example\input'
output:
  root: output
docs:
  owner: Retail Analytics
```

---

## 2. `state.yaml` (managed by `pbiagent`, never hand-edited)

```yaml
version: 1
project: HarborOutfitters
updated: 2026-11-23T14:05:11Z
inputs_hash: sha256:…            # hash of the sorted (name, size, mtime, sha256) list of input/*
phases:
  init:          {status: done, at: …}
  intake:        {status: done, at: …, artifacts: {work/context-summary.md: sha256:…}, score: 0.72}
  profile:       {status: done, at: …, artifacts: {work/profile.json: …, work/sources.yaml: …}}
  clarify:       {status: done, open_blocking: 0}
  kpi_design:    {status: awaiting_approval, artifacts: {work/kpis.yaml: …, work/model.yaml: …}}
  model_build:   {status: pending}
  report_design: {status: pending}
  report_build:  {status: pending}
  qa:            {status: pending}
  docs:          {status: pending}
  publish:       {status: pending}
gates:
  kpis:    {status: awaiting_approval, approved_by: null, at: null, note: null, artifact_hash: null}
  design:  {status: pending}
  publish: {status: pending}
capabilities:                     # written by `pbiagent doctor --project`
  ms_report_cli: true
  desktop_bridge: true
  modeling_mcp_configured: true
history:                          # append-only
  - {at: …, event: phase_done, phase: profile}
  - {at: …, event: gate_approved, gate: kpis, note: "approved with KPI-005 removed"}
```

**Status rules** (implemented in `pbiagent/state.py`):
- A phase may start only when all earlier phases are `done`. The gate before it must be `approved`, or `auto_approved` in fast mode.
- `pbiagent` sets `stale` when a recorded artifact hash differs from the file on disk, or when an upstream phase was re-run.
- `pbiagent gate <project> <gate> --approve --note "..."` records approval and the current artifact hash. If the artifact changes after approval, the gate goes back to `awaiting_approval`. Exception: cosmetic changes (descriptions only) don't reset the gate; the check compares the hash of the spec with `description` fields removed.

---

## 3. `profile.json` (written by `pbiagent profile`; read by agents)

```jsonc
{
  "version": 1,
  "generated": "2026-11-23T14:00:00Z",
  "files": [
    {
      "file": "HarborOutfitters_Sales.xlsx", "kind": "xlsx", "size": 812345, "sha256": "…",
      "sheets": [
        {
          "name": "Orders", "dimension": "A1:I5007", "hidden": false,
          "regions": [                      // detected table-like blocks
            {
              "id": "Orders#1", "range": "A4:I5006",
              "header_row": 4,              // 1-based row in the sheet
              "skip_rows": 3,               // rows above the header within the sheet's used range
              "header_confidence": 0.94,
              "row_count": 5001,
              "excel_table": null,          // or the ListObject name when the region is an Excel Table
              "issues": [
                {"code": "TOTAL_ROW", "row": 5006, "detail": "Last row looks like a total ('Total' in col A)"},
                {"code": "REPEATED_HEADER", "rows": [2504], "detail": "Header text repeated mid-sheet"}
              ],
              "columns": [
                {
                  "index": 1, "header": "Order ID", "inferred_type": "text",
                  "type_confidence": 1.0, "null_pct": 0.0, "blank_pct": 0.0,
                  "distinct": 5000, "unique": true,
                  "samples": ["HO-100001", "HO-100002", "HO-100003"],
                  "pattern": "^HO-\\d{6}$",
                  "role_guess": "key",      // key | foreign_key | measure | dimension | date | text | flag | id_like
                  "pii": null,
                  "stats": null
                },
                {
                  "index": 2, "header": "Order Date", "inferred_type": "date", "type_confidence": 0.97,
                  "mixed_types": {"datetime": 4850, "text": 151},
                  "text_date_formats": ["MM/DD/YYYY"], "null_pct": 0.0,
                  "min": "2024-01-02", "max": "2026-09-30", "role_guess": "date"
                },
                {
                  "index": 5, "header": "Qty", "inferred_type": "int", "mixed_types": {"int": 4900, "text": 101},
                  "stats": {"min": 1, "max": 12, "mean": 2.3, "p50": 2, "p99": 9, "negatives": 0, "zeros": 0},
                  "outliers": {"method": "iqr", "count": 4}, "role_guess": "measure"
                }
              ],
              "wide_format": null,          // or {"id_columns":[…], "value_columns":[…], "pattern":"Mon-YYYY"}
              "merged_cells": [],
              "grain_guess": {"columns": ["Order ID"], "unique": true, "statement": "one row per order line"}
            }
          ]
        }
      ]
    }
  ],
  "relationships": [                         // candidate joins across regions
    {"from": "Orders#1.Product Code", "to": "Products#1.Product Code", "containment": 0.998,
     "to_unique": true, "type_match": true, "score": 0.97, "orphans": 9, "orphan_samples": ["ZZ-999"]}
  ],
  "date_columns": ["Orders#1.Order Date", "Orders#1.Ship Date", "returns_2025_2026.csv#1.Return Date"],
  "warnings": []
}
```

`profile.md` is a human-readable rendering of the same content: per region, one table with column, type, nulls, distinct, samples and role, followed by the issues, the relationship candidates and a draft star schema.

---

## 4. `sources.yaml` (Power Query transforms; one entry per model table that comes from a file)

### 4.1 Top level

| Field | Type | Req | Notes |
|---|---|---|---|
| `version` | `1` | ✔ | |
| `tables` | list of SourceTable | ✔ | Order = load order. |

### 4.2 SourceTable

| Field | Type | Req | Notes |
|---|---|---|---|
| `name` | string | ✔ | Model table name, unique. |
| `role` | enum `fact`\|`dimension`\|`bridge`\|`target` | ✔ | `target` = a table of targets/budgets. Treated as a fact at a coarser grain. |
| `description` | string | ✔ | One sentence, starting with what a row represents: "One row per order line…". It becomes the TMDL `///` table description. |
| `source` | SourceRef | ✔ | See 4.3. |
| `append` | list of SourceRef | | Extra files or sheets with **the same raw layout**. They're combined *before* `steps` (M `Table.Combine`). The profiler checks that the layouts match. |
| `steps` | list of Step | ✔ (may be `[]`) | Applied in order (see 4.4). |
| `columns` | map name → ColumnMeta | | Optional metadata overrides; the final column list comes from executing the steps. |
| `reconcilable` | bool (computed; don't set) | | `false` when a `custom_m` step exists. |

### 4.3 SourceRef

| Field | Type | Req | Notes |
|---|---|---|---|
| `file` | string | ✔ | File name relative to `input/` (local) or `sharepoint_folder` (sharepoint). Sub-folders use `/`. |
| `kind` | enum `sheet`\|`table`\|`csv` | ✔ | `sheet` = a worksheet's used range (no header promotion yet). `table` = an Excel Table (ListObject), headers already promoted. `csv` = a delimited text file. |
| `item` | string | for sheet/table | Sheet name or Excel Table name, case-sensitive. |
| `csv` | `{delimiter: ","\|";"\|"\t"\|"\|", encoding: 65001\|1252, quote: true}` | | Defaults: `,`, 65001, true. |

### 4.4 Step vocabulary (each step is a one-key map)

Every step has an exact M translation (`04-python-core.md` §3.3) and an exact pandas translation (§3.4). The **column naming convention before `promote_headers`** is `Column1…ColumnN`, as in M.

| Step | YAML form | Semantics |
|---|---|---|
| `skip_rows` | `skip_rows: 3` | Drop the first N rows. |
| `promote_headers` | `promote_headers: true` | First row becomes the header. Empty header cells become `Column<i>`, where i is the 1-based position. Duplicates get suffixes `_1`, `_2`, … in order of appearance. **The profiler flags empty and duplicate headers; the agent must then add a `rename` step.** |
| `keep_columns` | `keep_columns: [A, B, C]` | Select and reorder. A missing column is an error. |
| `remove_columns` | `remove_columns: [X]` | |
| `rename` | `rename: {Old: New, …}` | |
| `trim` | `trim: [ColA, ColB]` or `trim: all_text` | Trim spaces from text values only. |
| `clean_text` | `clean_text: [ColA]` | Remove non-printable characters (M `Text.Clean`). |
| `remove_blank_rows` | `remove_blank_rows: true` | Drop rows where every value is null or `""`. |
| `filter_rows` | `filter_rows: {column: C, op: OP, value: V}` or a list of these (AND) | `op ∈ not_null, is_null, eq, ne, gt, ge, lt, le, in, not_in, starts_with, not_starts_with`. `not_null` also excludes `""`. The value type is whatever the column has at that point. |
| `replace_values` | `replace_values: {column: C, map: {"N": "North", "": null}}` | Exact whole-value replacement (M `Replacer.ReplaceValue`). |
| `fill_down` | `fill_down: [ColA]` | Replace nulls with the value above. Merged-cell regions read as null below the first cell. |
| `unpivot` | `unpivot: {keep: [Region], attribute: Month, value: Target}` | Unpivot all columns **not** in `keep` (M `Table.UnpivotOtherColumns`). Nulls in value cells are dropped, as in M. |
| `parse_month_label` | `parse_month_label: {column: Month, format: "MMM-YYYY", into: "Month Start"}` | Turn labels such as `Jan-2026` into a date (the first of the month), as a new column; the original column is removed. Formats: `MMM-YYYY`, `MMMM YYYY`, `YYYY-MM`, `MM/YYYY`. |
| `types` | `types: {Col: TYPE, …}` (+ optional `culture: en-GB`) | `TYPE ∈ text, int, decimal, double, date, datetime, bool, percent`. Conversion uses the project `locale`, or `culture` if given. A failed conversion becomes **null**, and the error count is reported by `preview-source` (it matches what Power BI loads). |
| `distinct` | `distinct: true` or `distinct: [KeyCols]` | Keep the first occurrence. |
| `add_column` | `add_column: {name: N, type: TYPE, m: "<M expr using [Col]>", sql: "<DuckDB SQL expr using \"Col\">"}` | Derived column. **Both** expressions are required; `preview-source` evaluates the SQL. Mismatches are caught by reconciliation (column sums and distinct counts). Use it sparingly; derived numbers usually belong in DAX measures. |
| `custom_m` | `custom_m: "Table.TransformColumns(_, …)"` | The escape hatch. `_` is the previous step's table. Marks the table `reconcilable: false`; `preview-source` stops here and warns. |

Types → M / TMDL mapping (normative):

| spec type | M type in `Table.TransformColumnTypes` | TMDL `dataType` | default `formatString` | default `summarizeBy` |
|---|---|---|---|---|
| `text` | `type text` | `string` | (none) | `none` |
| `int` | `Int64.Type` | `int64` | `0` | `none` |
| `decimal` | `Currency.Type` (fixed decimal, 4 dp) | `decimal` | `#,##0.00` | `none` |
| `double` | `type number` | `double` | `#,##0.00` | `none` |
| `percent` | `Percentage.Type` | `double` | `0.0%` | `none` |
| `date` | `type date` | `dateTime` | `yyyy-mm-dd` | `none` |
| `datetime` | `type datetime` | `dateTime` | `yyyy-mm-dd hh:nn` | `none` |
| `bool` | `type logical` | `boolean` | `"TRUE";"TRUE";"FALSE"` | `none` |

`summarizeBy: none` everywhere is deliberate. All aggregation goes through explicit measures (lint rule PBA005).

### 4.5 ColumnMeta (optional overrides)

| Field | Type | Notes |
|---|---|---|
| `description` | string | Becomes the `///` description. **Required for visible columns by the end of `model_build`**; the KPI analyst or modeler writes these in `model.yaml` (§5) instead, if preferred. |
| `hidden` | bool | |
| `data_category` | enum `City`, `Country`, `StateOrProvince`, `County`, `PostalCode`, `Continent`, `Place`, `Address`, `Latitude`, `Longitude`, `WebUrl`, `ImageUrl` | |
| `format_string` | string | Overrides the default. |
| `sort_by` | column name | e.g. Month Name sorted by Month Number. |

### 4.6 Example (HarborOutfitters)

```yaml
version: 1
tables:
  - name: Sales
    role: fact
    description: One row per order line exported from the POS system (Jan 2024 – Sep 2026).
    source: {file: HarborOutfitters_Sales.xlsx, kind: sheet, item: Orders}
    steps:
      - skip_rows: 3
      - promote_headers: true
      - filter_rows:
          - {column: Order ID, op: not_null}
          - {column: Order ID, op: ne, value: "Order ID"}       # repeated header rows
          - {column: Order ID, op: not_starts_with, value: "Total"}
      - rename: {Qty: Quantity, Store: Store Name}
      - trim: [Store Name, Status, Product Code]
      - replace_values: {column: Status, map: {C: Completed, R: Returned, P: Pending}}
      - types:
          Order ID: text
          Order Date: date
          Store Name: text
          Product Code: text
          Quantity: int
          Unit Price: decimal
          Discount: decimal
          Status: text
          Ship Date: date
  - name: Product
    role: dimension
    description: One row per product (SKU) from the product master table.
    source: {file: HarborOutfitters_Sales.xlsx, kind: table, item: tblProducts}
    steps:
      - types: {Product Code: text, Product Name: text, Category: text, Subcategory: text, Unit Cost: decimal, Launch Date: date}
  - name: Store
    role: dimension
    description: One row per store, with its region and manager.
    source: {file: HarborOutfitters_Sales.xlsx, kind: sheet, item: Stores}
    steps:
      - promote_headers: true
      - fill_down: [Region]
      - remove_blank_rows: true
      - rename: {Store: Store Name}
      - trim: [Store Name, Region]
      - types: {Region: text, Store Name: text, Store Manager: text, Open Date: date, Sq Ft: int}
  - name: Target
    role: target
    description: One row per region and month with the revenue target set by Finance for 2026.
    source: {file: HarborOutfitters_Sales.xlsx, kind: sheet, item: Targets}
    steps:
      - promote_headers: true
      - unpivot: {keep: [Region], attribute: Month, value: Revenue Target}
      - parse_month_label: {column: Month, format: MMM-YYYY, into: Month Start}
      - types: {Region: text, Month Start: date, Revenue Target: decimal}
  - name: Returns
    role: fact
    description: One row per processed return (2025–2026).
    source: {file: returns_2025_2026.csv, kind: csv}
    steps:
      - promote_headers: true
      - types: {Return ID: text, Order ID: text, Return Date: date, Reason: text, Refund Amount: decimal}
```

---

## 5. `model.yaml` (star schema and model metadata)

| Field | Type | Req | Notes |
|---|---|---|---|
| `version` | `1` | ✔ | |
| `tables` | list of ModelTable | ✔ | Every `sources.yaml` table must appear here; generated tables also go here. |
| `relationships` | list of Relationship | ✔ | |
| `date_table` | DateTable | ✔ if any date column is used | |
| `measures_table` | string | | default `_Measures`. All KPI measures go here. |
| `helper_measures` | list of Measure | | Non-KPI helpers (dynamic titles, "Data As Of", sort helpers). KPI measures are generated from `kpis.yaml`, never written here. |
| `calculated_columns` | list `{table, name, expression, type, description, hidden}` | | Use sparingly (e.g. a `Region` lookup on Target if there's no Store key). |

**ModelTable**: `{name, source: <sources table name> | null, generated: null | date_table | measures_table | calculated_table, expression: <DAX table expr, only for calculated_table>, description, columns: [ColumnSpec], hierarchies: [{name, levels:[{name, column}]}], hidden: bool}`. You don't need to list the Date and `_Measures` tables: they're added automatically from `date_table` and `measures_table`.

**ColumnSpec**: `{name, description, hidden: bool=false, format_string?, data_category?, sort_by?, display_folder?}`. The type comes from `sources.yaml` and is **not** repeated here. Every visible column needs a description by the end of `model_build`.

**Relationship**:
```yaml
- from: Sales[Product Code]     # many side (fact)
  to: Product[Product Code]     # one side (dimension); must be unique in the profiled data
  active: true                  # default true
  cross_filter: single          # single | both   (both requires `justification:`)
  justification: null
```
Semantic checks:
- The two columns have the same type.
- `to` is unique: the profile must show `unique: true` after the transforms, verified with `preview-source`.
- Containment of at least 0.95, otherwise a warning that lists the orphans.
- No cycles.
- At most one active path between any two tables.

**DateTable**:
```yaml
date_table:
  name: Date
  range_from: [Sales[Order Date], Returns[Return Date], Target[Month Start]]   # min/max drive the range
  extend_to_year_end: true
  columns: [Date, Year, Quarter, Month Number, Month, Month Start, Year Month, Week Start, Day of Week, Fiscal Year, Fiscal Quarter, Is Past]
  relationships:                   # generated relationships to the Date table
    - {from: Sales[Order Date], active: true}
    - {from: Sales[Ship Date], active: false}     # role-playing; use USERELATIONSHIP
    - {from: Returns[Return Date], active: true}
    - {from: Target[Month Start], active: true}
```

Generated dimension tables (calculated, DAX) are declared like this:
```yaml
tables:
  - name: Region
    source: null
    generated: calculated_table
    expression: 'DISTINCT(UNION(DISTINCT(Store[Region]), DISTINCT(Target[Region])))'
    description: One row per sales region; shared by Store and Target so targets and actuals filter together.
    columns:
      - {name: Region, type: text, description: Sales region name.}
```
For `generated: calculated_table`, each column also states its `type`, because there's no source table to infer it from.

Example tail:
```yaml
relationships:
  - {from: Sales[Product Code], to: Product[Product Code]}
  - {from: Sales[Store Name],  to: Store[Store Name]}
  - {from: Store[Region],      to: Region[Region]}
  - {from: Target[Region],     to: Region[Region]}
  - {from: Returns[Order ID],  to: Sales[Order ID], active: false, justification: "fact-to-fact; used only by USERELATIONSHIP in Return Rate"}
helper_measures:
  - name: Data As Of
    expression: '"Data as of " & FORMAT(MAX(Sales[Order Date]), "d mmm yyyy")'
    format_string: null
    description: Latest order date in the data; shown in the page header.
    display_folder: _Helpers
```

> **Modeling note for the agent:** `Target` is at region × month grain, while `Store` holds Region as an attribute. That's why the example adds a shared `Region` dimension: Region → Store → Sales and Region → Target, with Target[Month Start] → Date. Visuals that compare actual with target must slice by `Region[Region]` and `Date` columns at month level or coarser, never by `Store` or `Product` (the target isn't defined there). `pbi-semantic-model/modeling-rules.md` covers this "targets at a coarser grain" pattern.

---

## 6. `kpis.yaml` (KPI catalog: the heart of the system)

### 6.1 Top level

```yaml
version: 1
business_questions: [BusinessQuestion]
kpis: [KPI]
```

**BusinessQuestion**: `{id: Q1, text, decision, audience, frequency: daily|weekly|monthly|quarterly|ad_hoc, priority: 1-5 (1 highest), source: brief|interview|inferred}`.

### 6.2 KPI fields

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | `KPI-\d{3}` | ✔ | Stable; never reused. |
| `name` | string | ✔ | The measure name, unique in the model. |
| `tier` | enum `headline`\|`supporting`\|`diagnostic` | ✔ | 3–7 headline KPIs in total (lint warns outside that range). |
| `questions` | list of Q ids | ✔ | At least one. |
| `decision` | string | ✔ | The decision or action this KPI informs ("Shift promo budget to regions below 90% of target"). |
| `definition` | string | ✔ | Plain language. No DAX jargon. Says what's included and excluded. |
| `rationale` | string | ✔ | Why this KPI, and why it's better than the alternatives. |
| `formula.dax` | string | ✔ | The measure expression. May reference other KPI measures as `[Name]` and helper measures. Must use `DIVIDE` for ratios. |
| `formula.sql` | string | ✔ unless `reconcile: skip` | A DuckDB SQL **scalar** query over the views named after the model tables, with the transforms applied. Must contain the placeholder `{where}` (see 6.4). |
| `formula.depends_on` | list of KPI ids or measure names | | Generated by the checker if omitted. |
| `format` | enum `currency`, `currency_2dp`, `currency_k`, `currency_m`, `integer`, `decimal`, `percent`, `percent_1dp`, `ratio`, `days`, `custom` | ✔ | Maps to a format string (`07-kpi-framework.md` §6). |
| `format_string` | string | if `format: custom` | |
| `unit` | string | | e.g. USD, orders, days. |
| `direction` | enum `higher_is_better`\|`lower_is_better`\|`target_band`\|`neutral` | ✔ | Drives the KPI colors and status measures. |
| `additivity` | enum `additive`\|`semi_additive`\|`non_additive` | ✔ | Non-additive KPIs (ratios, distinct counts) must not be summed in tables; documented in the catalog. |
| `grain` | string | ✔ | The base grain the formula aggregates ("order line"). |
| `valid_dimensions` | list of `Table` or `Table[Column]` | ✔ | Slicing outside these is flagged in docs as "not meaningful". |
| `time_intelligence` | list of enum `PY`, `YoY`, `YoY %`, `YTD`, `PYTD`, `MTD`, `QTD`, `Rolling 3M`, `Rolling 12M`, `3M Avg` | | Generates the variant measures `<name> <variant>` (07 §5). Needs the Date table. |
| `target.source` | enum `user`\|`data`\|`assumption`\|`none` | ✔ | `user` = given in the brief or answers. `data` = from a target table in the data. `assumption` = proposed by the agent and flagged for confirmation (**never shown as a "target" on visuals until approved**). `none` = no target. |
| `target.value` | number | if user/assumption and static | |
| `target.period` | enum `day`, `week`, `month`, `quarter`, `year`, `all` | if value | |
| `target.dax` | string | if source=data | e.g. `SUM(Target[Revenue Target])` |
| `target.note` | string | | Provenance ("Brief §4, CFO memo 2026-01"). |
| `thresholds` | `{good: "<op> <n>", warn: "<op> <n>", on: attainment\|value}` | | `on` defaults to `attainment` (tests `[<name> % of Target]`) when a target exists, else `value` (tests `[<name>]`). Example: `{good: ">= 1", warn: ">= 0.9"}`, or for a lower-is-better rate `{good: "<= 0.05", warn: "<= 0.08", on: value}`. They generate a `<name> Status` measure returning 1/0/-1 and a `<name> Color` measure returning a hex string (07 §5.6). |
| `min_base` | `{measure: <name>, value: int}` | | Suppresses the KPI (BLANK) when the base measure is below the value (small numbers, privacy). 07 §5.7. |
| `caveats` | list of string | | Known limitations users must understand. |
| `data_quality` | list of string | | Measured issues affecting this KPI (from the profile). |
| `confidence` | enum `high`\|`medium`\|`low` | ✔ | Rubric in 07 §3. |
| `owner` | string | | Business owner of the definition. |
| `status` | enum `proposed`\|`approved`\|`rejected`\|`revised` | ✔ | Only `approved` (or `proposed` in fast mode) KPIs are built. |
| `assumptions` | list of string | | Each starts with "ASSUMPTION:". Copied to the decisions log. |
| `display_folder` | string | | Defaults to the tier name. |
| `reconcile` | list of Slice, or `skip` | | Default `[{}]` (grand total). A Slice is `{by: "Table[Column]", filter: {"Table[Column]": value}}`. At most 25 result rows per slice (top values by absolute magnitude). |
| `visual_hint` | enum `card`, `kpi`, `trend`, `bar`, `table`, `none` | | For the report designer. |

### 6.3 Generated measure names

- Base: `name`
- Variants: `<name> PY`, `<name> YoY`, `<name> YoY %`, `<name> YTD`, `<name> PYTD`, `<name> MTD`, `<name> QTD`, `<name> Rolling 3M`, `<name> Rolling 12M`, `<name> 3M Avg`
- Target: `<name> Target`, `<name> vs Target` (difference), `<name> % of Target` (attainment = actual ÷ target), `<name> vs Target %` (variance % = (actual − target) ÷ target), `<name> Status`, `<name> Color`
- All variants are placed in display folder `<display_folder>\<name>` and get auto-generated descriptions ("Total Revenue for the same period in the prior year. See KPI-001.").

### 6.4 SQL placeholder contract

`{where}` is replaced by `WHERE <conditions>` or the empty string. Conditions come from the slice filters. `{group_by}` and `{group_select}` are inserted when a slice has `by`. The checker rewrites the query as:

```sql
SELECT {group_select} (<original scalar expression>) AS value FROM … {where} {group_by}
```

To keep this mechanical, `formula.sql` must have the form `SELECT <expr> FROM <from-clause> {where}`, with joins written explicitly in `<from-clause>`. The tool injects the `by` column, which must be reachable through the joins in the FROM clause. If it isn't, the checker reports `SPEC041` and the agent adds the join.

Example:
```yaml
- id: KPI-001
  name: Net Revenue
  tier: headline
  questions: [Q1, Q2]
  decision: Regional managers rebalance monthly promo spend toward regions below 90% of target.
  definition: Value of completed order lines after discounts (quantity × unit price − discount). Returned and pending orders are excluded.
  rationale: The outcome regional managers are measured on; net of discounts so that promotions are not double-counted as growth.
  formula:
    dax: |
      SUMX(
          FILTER(Sales, Sales[Status] = "Completed"),
          Sales[Quantity] * Sales[Unit Price] - Sales[Discount]
      )
    sql: |
      SELECT SUM(s."Quantity" * s."Unit Price" - s."Discount")
      FROM Sales s
      LEFT JOIN Store st ON st."Store Name" = s."Store Name"
      LEFT JOIN "Date" d ON d."Date" = s."Order Date"
      {where} AND s."Status" = 'Completed'
  format: currency
  unit: USD
  direction: higher_is_better
  additivity: additive
  grain: order line
  valid_dimensions: [Date, Store, Product, Region]
  time_intelligence: [PY, YoY %, YTD]
  target: {source: data, dax: "SUM(Target[Revenue Target])", note: "Targets sheet, Finance 2026 plan"}
  thresholds: {good: ">= 1", warn: ">= 0.9"}
  caveats: ["Targets exist only for 2026; vs-target measures are blank for earlier periods."]
  data_quality: ["151 order dates were stored as text and converted (0 failures)."]
  confidence: high
  owner: Sales Operations
  status: proposed
  assumptions: ["ASSUMPTION: Status code 'C' means Completed (confirmed in answers.md Q-03)."]
  reconcile: [{}, {by: "Store[Region]"}, {by: "Date[Year]"}]
  visual_hint: kpi
```

> The `{where} AND …` form is allowed: the tool turns a leading `AND` into `WHERE` when the injected condition list is empty. Implement this normalization in `kpi/sql.py`.

---

## 7. `report.yaml` (report design)

### 7.1 Top level

| Field | Type | Req | Notes |
|---|---|---|---|
| `version` | `1` | ✔ | |
| `pages` | list of Page | ✔ | 2–8 pages. The first page is the landing page (`activePageName`). |
| `global_slicers` | list of Slicer | | Rendered on every analytic page, in the same position (synced). |
| `about_page` | bool | | default `true`. Generated last from kpis and docs. |

### 7.2 Page

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | id | ✔ | Folder name seed. |
| `title` | string | ✔ | Page display name. Also the header textbox text. |
| `archetype` | enum `executive-summary`, `driver-analysis`, `trend`, `comparison`, `detail`, `operational-monitor`, `about` | ✔ | See `08-report-design.md` §2. |
| `questions` | list of Q ids | ✔ (not about) | Every headline question must be answered on at least one page. |
| `subtitle` | string or `{measure: Name}` | | Rendered under the title. |
| `slicers` | list of Slicer | | Page-level slicers, laid out in the header band at the right. Maximum 3. |
| `rows` | list of Row | ✔ | Layout rows, top to bottom. |
| `drillthrough` | `{field: "Table[Column]"}` | | Makes the page a drillthrough target (`detail` archetype only). |
| `hidden` | bool | | e.g. tooltip or drillthrough pages. |

**Slicer**: `{field: "Table[Column]", style: dropdown|list|between|relative_date, title?: string}`.

**Row**: `{height: int (px), visuals: [Visual]}`. The spans in a row sum to at most 12. The heights of all rows plus the header band (§08 layout) must fit the canvas height; the builder errors if they overflow.

### 7.3 Visual (`type` decides the other fields)

| `type` | Fields | PBIR `visualType` |
|---|---|---|
| `cards` | `measures: [names] (1–5)`, `comparison: none\|PY\|target` | `cardVisual` (multi-value). The comparison adds the reference label measures (`<name> YoY %` or `<name> % of Target`) when the template supports them; otherwise a second row of small cards. |
| `kpi` | `measure`, `trend_axis: "Date[Month Start]"`, `goal: <measure>` | `kpi` |
| `line` | `x: "Table[Column]"`, `y: [measures] (1–3)`, `series?: "Table[Column]"` | `lineChart` |
| `column` | `category`, `y: [measures]`, `series?` | `clusteredColumnChart` |
| `bar` | `category`, `y: [measures]`, `sort: desc\|asc\|category`, `top_n?: int` | `clusteredBarChart` |
| `combo` | `x`, `columns: [measures]`, `lines: [measures]` | `lineClusteredColumnComboChart` |
| `donut` | `category`, `y: measure` (≤ 5 categories, enforced by top_n + "Other" helper) | `donutChart` |
| `table` | `columns: ["Table[Column]" or measure names]`, `sort?`, `top_n?` | `tableEx` |
| `matrix` | `rows: [fields]`, `columns?: [fields]`, `values: [measures]` | `pivotTable` |
| `scatter` | `details: field`, `x: measure`, `y: measure`, `size?: measure` | `scatterChart` |
| `text` | `text: markdown-lite (paragraphs, **bold**)` | `textbox` |
| `raw_visual` | `visual: {…full visual.json "visual" object…}` | as given; validated |

Common fields for every visual:
- `span` (1–12, required)
- `title` (string; required except for cards and text), or `title_measure` (a helper measure returning text, for dynamic titles)
- `subtitle?`
- `kpi_refs: [KPI ids]`, used for traceability and the About page
- `tooltip_measures?: [measures]`
- `conditional_color?: {measure: "<name> Color"}`, which sets the data color from the Color measure (bar/column/table only)

Example (overview page):
```yaml
version: 1
global_slicers:
  - {field: "Date[Year]", style: dropdown}
  - {field: "Region[Region]", style: dropdown}
pages:
  - id: overview
    title: Store Performance Overview
    archetype: executive-summary
    questions: [Q1, Q2, Q3]
    subtitle: {measure: Data As Of}
    rows:
      - height: 120
        visuals:
          - {type: cards, span: 12, measures: [Net Revenue, Gross Margin %, Orders, Return Rate %], comparison: PY, kpi_refs: [KPI-001, KPI-002, KPI-003, KPI-005]}
      - height: 248
        visuals:
          - {type: line, span: 8, title_measure: Title Net Revenue Trend, x: "Date[Month Start]", y: [Net Revenue, Net Revenue PY], kpi_refs: [KPI-001]}
          - {type: bar, span: 4, title_measure: Title Region Attainment, category: "Region[Region]", y: [Net Revenue % of Target], sort: asc, conditional_color: {measure: Net Revenue Color}, kpi_refs: [KPI-001]}
      - height: 208
        visuals:
          - {type: matrix, span: 7, title: Margin by Category, rows: ["Product[Category]", "Product[Subcategory]"], values: [Net Revenue, Gross Margin %, Net Revenue YoY %], kpi_refs: [KPI-001, KPI-002]}
          - {type: column, span: 5, title: Returns by Reason, category: "Returns[Reason]", y: [Return Rate %], kpi_refs: [KPI-005]}
```

---

## 8. `questions.md` format (written by the profiler and intake; answered by the user)

```markdown
# Open questions — HarborOutfitters

| ID | Blocking | Question | Why it matters | Proposed default | Status | Answer |
|----|----------|----------|----------------|------------------|--------|--------|
| Q-01 | yes | Status codes C/R/P — do they mean Completed/Returned/Pending? | Revenue definition excludes non-completed orders | C=Completed, R=Returned, P=Pending | open | |
| Q-02 | no | Is the fiscal year the calendar year? | YTD and fiscal columns | Yes (Jan start) | open | |
```

`pbiagent questions <project> --answer Q-01 "yes"` updates the row and appends to `context/answers.md` and `work/decisions.log.md`. The user can also edit the table directly. `--assume-all` sets every open question to its proposed default with status `assumed` (fast mode).

---

## 9. `decisions.log.md` format

An append-only Markdown table with columns `When | Phase | Decision | Rationale | Source (user/assumption/data) | Ref`. `pbiagent log <project> --phase X --decision "…" --rationale "…" --source assumption --ref KPI-003` appends a row. `docs/assumptions-and-decisions.md` is generated from it.
