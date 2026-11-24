# 09: Format reference (PBIP / TMDL / PBIR)

This is a condensed reference compiled from the vendored sources. Full texts:
- `vendor/learn/pbip/*.md` (projects-overview, projects-report, projects-dataset, projects-external-editing, source-code-format)
- `vendor/learn/tmdl/*.md`
- `vendor/skills-for-fabric/powerbi-authoring/skills/semantic-model-authoring/references/{tmdl-guidelines,pbip}.md`
- `vendor/skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring*.md` and `authoring/*.md`
- `vendor/json-schemas/fabric/**`

> **The rule that resolves every conflict below:** the blank PBIP saved by the user's Power BI Desktop is the source of truth for file shapes and `$schema` versions. Copy its values; never "upgrade" them. Next in authority are the Microsoft skill references, then the Learn pages, then this document.

## 1. PBIP structure (verified)
```
<Project folder>/
├── <Name>.pbip                       shortcut to the report (optional but convenient)
├── <Name>.Report/
│   ├── .platform
│   ├── definition.pbir               REQUIRED — binding to the model
│   ├── definition/                   REQUIRED for PBIR
│   │   ├── version.json              REQUIRED
│   │   ├── report.json               REQUIRED
│   │   ├── reportExtensions.json     optional (report-level measures; not used)
│   │   ├── bookmarks/                optional
│   │   └── pages/
│   │       ├── pages.json            order + active page
│   │       └── <pageName>/
│   │           ├── page.json         REQUIRED per page
│   │           └── visuals/<visualName>/visual.json (+ mobile.json optional)
│   ├── StaticResources/SharedResources/BaseThemes/*.json   (Desktop-shipped base theme)
│   ├── StaticResources/RegisteredResources/*               (custom theme, images)
│   ├── semanticModelDiagramLayout.json  (don't edit)
│   └── .pbi/localSettings.json       (user-local; gitignore)
└── <Name>.SemanticModel/
    ├── .platform
    ├── definition.pbism              REQUIRED (version ≥ 4.0 allows TMDL)
    ├── definition/                   REQUIRED for TMDL
    │   ├── database.tmdl  model.tmdl  relationships.tmdl  expressions.tmdl  [functions.tmdl] [dataSources.tmdl]
    │   ├── tables/<Table>.tmdl   cultures/<locale>.tmdl   [roles/] [perspectives/]
    ├── diagramLayout.json            (don't edit)
    └── .pbi/{localSettings.json, cache.abf, editorSettings.json, unappliedChanges.json}  (Desktop-owned)
```

**General rules:**
- **Encoding:** UTF-8 **without BOM**. **Line endings:** Desktop uses CRLF.
- **Path length:** 260 characters by default on Windows. Keep project paths short.
- **Default `.gitignore`:** `**/.pbi/localSettings.json`, `**/.pbi/cache.abf`.
- **Opening without data:** Desktop can open a PBIP without `cache.abf`. The model is then empty until the user clicks Refresh.
- **Names:** page, visual and bookmark names (and their folder names) must match `^[\w-]+$`. Desktop's default is a 20-character hex id. A non-compliant folder is ignored and treated as private user files. After renaming PBIR files or folders, Desktop must be restarted.
- **External edits:** save in Desktop before editing externally. With the preview feature *Detect and reload external PBIP changes*, Desktop shows an *Apply external changes* banner. Blocking errors (an invalid schema, a missing required property) prevent the load.
  - Not supported for external edits during the preview: `definition.pbir`, `report.json`, `mobileState.json`, `semanticModelDiagramLayout.json`.
  - The kit **does** generate `definition.pbir` and `report.json`, but only while Desktop is closed. The `reload` path is used for page and visual changes. For a model or `report.json` change, the QA skill asks the user to close and reopen Desktop.
- **Unapplied changes:** expression edits made outside Desktop are lost when `unappliedChanges.json` exists and the user applies it. The builder warns if that file exists.
- **Sensitivity labels** aren't supported with PBIP. The report linguistic schema isn't supported.
- **Automatic date tables** must not be changed by external tools. The kit disables auto date/time (`__PBI_TimeIntelligenceEnabled = 0`) and supplies its own Date table.

### 1.1 Shell files (shapes; take versions from the blank)
```json
// <Name>.pbip
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json",
  "version": "1.0",
  "artifacts": [ { "report": { "path": "<Name>.Report" } } ],
  "settings": { "enableAutoRecovery": true } }

// <Name>.Report/definition.pbir  (local model)
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  "version": "4.0",
  "datasetReference": { "byPath": { "path": "../<Name>.SemanticModel" } } }
// byConnection (used only for Fabric REST deployment) is OUT OF SCOPE for this kit. Always use byPath.
// Do not add "byConnection": null next to byPath. Relative paths with forward slashes only.

// <Name>.SemanticModel/definition.pbism
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json",
  "version": "4.2", "settings": {} }
// (Fabric docs show "version": "5.0"; MS skill shows "4.2". Use the blank's value.)

// .platform (both items)
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
  "metadata": { "type": "Report" | "SemanticModel", "displayName": "<Name>" },
  "config": { "version": "2.0", "logicalId": "<uuid>" } }
// "type" is case-sensitive. logicalId must be unique per item; keep it stable across rebuilds.

// definition/version.json
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json",
  "version": "2.0.0" }       // copy verbatim from blank

// definition/pages/pages.json
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.1.0/schema.json",
  "pageOrder": ["<page1>", "<page2>"], "activePageName": "<page1>" }

// definition/pages/<p>/page.json
{ "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json",
  "name": "<p>", "displayName": "Overview", "displayOption": "FitToPage", "height": 720, "width": 1280 }
// page background: "objects": {"background": [{"properties": {"color": {"solid": {"color": {"expr": {"Literal": {"Value": "'#F7F8FA'"}}}}}, "transparency": {"expr": {"Literal": {"Value": "0D"}}}}}]}
// (page background has no "show" property; colors must be static Literals)
```

The schema families (for reference; versions vary by Desktop build):

| File | Family (after `…/json-schemas/fabric/`) | Vendored versions |
|---|---|---|
| .pbip | `pbip/pbipProperties` | 1.0.0 |
| definition.pbir | `item/report/definitionProperties` | 1.0.0, 2.0.0 |
| definition.pbism | `item/semanticModel/definitionProperties` | 1.0.0 |
| .platform | `gitIntegration/platformProperties` | 2.0.0, 2.1.0 |
| version.json | `item/report/definition/versionMetadata` | 1.0.0 |
| report.json | `item/report/definition/report` | 1.0.0 … 3.3.0 |
| pages.json | `item/report/definition/pagesMetadata` | 1.0.0, 1.1.0 |
| page.json | `item/report/definition/page` | 1.0.0 … 2.1.0 |
| visual.json | `item/report/definition/visualContainer` | 1.0.0 … 2.13.0 |
| bookmark | `item/report/definition/bookmark` | 1.0.0 … 2.1.0 |

Desktop errors from wrong versions:
- `UnrecognizedSchemaVersion` means the wrong family or path.
- *"This version of Power BI does not support the version you have provided in X"* means the version number is too new for the installed build.

Older versions are accepted and upgraded on save.

## 2. TMDL essentials (verified unless marked)

**Indentation and declarations**
- Indentation uses **tabs**. Level 0 is a declaration (`table`, `relationship`, `expression`, `model`, `database`, `ref`, `cultureInfo`, `role`); level 1 is children (`column`, `measure`, `partition`, `hierarchy`, `annotation`); level 2 is properties; level 3 is multi-line expression lines.
- Declaration syntax: `<objectType> <name>`.
- **Name quoting:** names containing `.`, `=`, `:`, `'` or whitespace need single quotes, with `'` doubled. The kit quotes every name that isn't `^[A-Za-z_][A-Za-z0-9_]*$`.
- References: `Table.Column` in `fromColumn`/`toColumn`, each part quoted as needed (`Sales.'Order Date'`).

**Properties and expressions**
- Properties are `key: value`, on one line. Quotes are optional unless the value has leading or trailing whitespace; inside quotes, `"` is escaped as `""`. Booleans can be a bare keyword (`isHidden`, `isKey`).
- Expressions use `=`: measures (`measure 'X' = <DAX>`), partitions (`partition T = m` / `= calculated` / `= entity` / `= calculationGroup`), calculated columns (`column 'X' = <DAX>`), named expressions (`expression P = <M> meta [...]`).
- Multi-line expressions are indented one level deeper than the object's properties. Triple-backtick blocks keep whitespace verbatim (``` right after `=`; the closing ``` on its own line).

**Descriptions, comments, annotations, lineage tags**
- Descriptions are `///` lines directly above the declaration (no blank line between). **Don't use the `description:` property.**
- `//` comments aren't supported in TMDL. They're fine inside M or DAX expressions.
- `lineageTag` can be **omitted** for new objects; the engine assigns tags on first save (MS skill). Desktop will add them, and the drift check ignores them.
- **Don't author `PBI_*` annotations** (Desktop-internal). `annotation SummarizationSetBy = User` is fine (it's a normal annotation Desktop also uses).

**Required lines**
- `database.tmdl` must start with `database <name-or-guid>`, followed by properties such as `compatibilityLevel: 1702`, `compatibilityMode: powerBI`, `language: 1033`. A bare `compatibilityLevel:` without the declaration fails with `InvalidLineType: Property!`.
- `model.tmdl` needs `defaultPowerBIDataSourceVersion: powerBI_V3` for Import models. Without it: "Import from JSON supported for V3 models only".
- `ref table X` lines in `model.tmdl` define the order. A referenced table without a file is ignored; a file without a ref is appended to the end.

**Table contents**
- Measures go before columns within a table (MS convention). Every measure has a `formatString`.
- Valid `dataType` values (TOM `DataType`, camelCase): `string`, `int64`, `double`, `decimal`, `dateTime`, `boolean`, `binary`, `variant`, `automatic`. The kit uses the first 6.
- Valid `summarizeBy` values (TOM `AggregateFunction`): `none`, `sum`, `min`, `max`, `count`, `average`, `distinctCount`, `default`. The kit uses `none`.
- Relationship properties: `fromColumn` (many side), `toColumn` (one side), `isActive: false`, `crossFilteringBehavior: oneDirection|bothDirections|automatic`, and `fromCardinality`/`toCardinality` (`many`/`one`; the defaults are many-to-one, so they're omitted).
- Date table: `dataCategory: Time` on the table; the key date column has `isKey`.
- Calculated table: `partition <T> = calculated` / `mode: import` / `source = <DAX>`. Columns use `sourceColumn: [Name]`; MS examples also set `dataType` explicitly (see the §6 verification item).
- Parameters: `expression Name = "value" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]`. In M, reference them as `Name` or `#"Name"`.
- Hierarchies: `hierarchy 'H'`, then `level L` with `column: C`.

**Power Query step naming** (MS guidance): `#"Past-tense verb phrase"`, ≤ 50 characters, with a `//` comment above (≤ 225 characters) that doesn't restate the code.

**Format strings** (examples from MS): `$#,##0.00`, `0.00%`, `#,##0`, `#,##0.00`, `#,##0,K`, `#,##0,,M`.

**TMDL examples verified in MS sources** (copy patterns from them when in doubt): see `vendor/skills-for-fabric/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md`. It covers import tables, field parameters, relationships, hierarchies, calculation groups, roles, cultures, perspectives, functions, calculated tables, the date-table rules, parameters, annotations and calendar objects.

## 3. PBIR visual essentials
- visual.json top level: `$schema`, `name`, `position {x, y, z, height, width, tabOrder}`, `visual {visualType, query {queryState {<Role>: {projections: [...]}}, sortDefinition?}, objects?, visualContainerObjects?, drillFilterOtherVisuals?}`, `filterConfig?`.
- **All role projections go inside `visual.query.queryState`.** Projections directly under `query` fail schema validation.
- Field expressions:
  - Column: `{"Column": {"Expression": {"SourceRef": {"Entity": "<Table>"}}, "Property": "<Column>"}}`
  - Measure: `{"Measure": {"Expression": {"SourceRef": {"Entity": "<Table>"}}, "Property": "<Measure>"}}`
  - Aggregation: `{"Aggregation": {"Expression": {"Column": …}, "Function": 0}}` (0 = Sum, 3 = Min, 4 = Max, 5 = CountNonNull, …). The kit avoids aggregations and uses measures.
- Projection: `{"field": <expr>, "queryRef": "<Table>.<Field>", "nativeQueryRef": "<Field>", "active": true?}`.
- **Literal encoding in formatting:**
  - strings `{"expr": {"Literal": {"Value": "'text'"}}}` (single quotes; `'` doubled)
  - doubles `"12D"`
  - integers `"29L"`
  - booleans `"true"`
  - colors `{"solid": {"color": {"expr": {"Literal": {"Value": "'#RRGGBB'"}}}}}`
  - theme colors `{"solid": {"color": {"expr": {"ThemeDataColor": {"ColorId": 0, "Percent": 0}}}}}`
  - `powerbi-report-author expr encode --kind …` produces these.
- **Measure-driven formatting:** put `{"expr": {"Measure": {…}}}` in the property slot (title text, dataPoint fill, …). For per-category chart color, set the selector `{"data": [{"dataViewWildcard": {"matchingOption": 1}}]}`. For tables/matrices, use a `metadata` selector of the formatted Values field's queryRef.
- **Sort:** `"sortDefinition": {"sort": [{"field": <expr>, "direction": "Descending"}], "isDefaultSort": true}` inside `visual.query`.
- **Data roles by visualType:**

  | visualType | Roles |
  |---|---|
  | `cardVisual` | `Data` |
  | `kpi` | `Indicator`, `TrendLine`, `Goal` |
  | `lineChart` | `Category`, `Series`, `Y`, `Y2`, `Rows`, `Tooltips` |
  | bar/column (`barChart`, `columnChart`, `clusteredBarChart`, `clusteredColumnChart`) | `Category`, `Series`, `Y`, `Rows`, `Tooltips`, `Gradient` |
  | `tableEx` | `Values` |
  | `pivotTable` | `Rows`, `Columns`, `Values` |
  | `slicer` | `Values` |
  | `scatterChart` | `Category`, `Series`, `X`, `Y`, `Size` |
  | `textbox` | none |

  **To verify with `catalog describe`:** `donutChart`, `lineClusteredColumnComboChart`.
- **Deprecated (don't create):** `card`, `multiRowCard`, `map`, `filledMap`, Q&A. Validate warns `PBIR_VISUAL_TYPE_DEPRECATED`.
- **Theme registration:**
  - `report.json` `themeCollection.customTheme {name: "<file>.json", reportVersionAtImport: …, type: "RegisteredResources"}`
  - `resourcePackages[]` item `{name: "<file>.json", path: "<file>.json", type: "CustomTheme"}` inside the package `{name: "RegisteredResources", type: "RegisteredResources"}`
  - The theme file's internal `name` equals the file name, including `.json`. Rotate the file name on content change; Desktop caches by name.
- `reportVersionAtImport` differs between sources: the Learn example uses the string `"5.55"`, while the MS skill shows an object `{visual, report, page}`. Copy the blank's `baseTheme.reportVersionAtImport` value and shape.
- **Service limits:** 1,000 pages per report, 1,000 visuals per page, 300 MB of resource package files, 300 MB of report files.

## 4. Power Query M essentials (used by the emitter)
- Excel: `Excel.Workbook(binary, null, true)`, where the third argument `delayTypes=true` keeps cells untyped until `TransformColumnTypes`.
  - navigate a sheet: `Source{[Item="Orders",Kind="Sheet"]}[Data]` (columns `Column1…`)
  - navigate a table: `{[Item="tblProducts",Kind="Table"]}[Data]` (headers already promoted)
- CSV: `Csv.Document(binary, [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv])`.
- Files: `File.Contents(path)`. SharePoint: `SharePoint.Files(siteUrl, [ApiVersion = 15])` → columns `Content`, `Name`, `Folder Path`, …
- **Types:** `type text`, `Int64.Type`, `Currency.Type` (fixed decimal), `type number`, `Percentage.Type`, `type date`, `type datetime`, `type logical`. `Table.TransformColumnTypes(t, {{"c", type}}, "en-US")`; the third argument is the culture.
- Function references are in `vendor/learn/powerquery-m/*.md` (each page has its syntax and examples).

## 5. Known conflicts between sources, and the resolution

| Topic | Source A | Source B | Resolution |
|---|---|---|---|
| `definition.pbism` version | MS skill: `4.2` | Fabric REST doc: `5.0` | Copy the blank's value. |
| `compatibilityLevel` | MS skill example: 1702 | Learn AS table: latest 1700; examples 1567/1601 | Copy the blank's `database.tmdl`. |
| `reportVersionAtImport` shape | Learn: `"5.55"` | MS skill: object | Copy the blank's value. |
| Named-expression language | Learn table 1: DAX | Learn table 2: M | M (parameters are Power Query). |
| `mode: Import` vs `import` | how-to page | overview | lowercase `import`. |
| Desktop Bridge default screenshot scale | Learn: 1.0 | npm README: CLI default 2 | Pass `--scale 1` explicitly. |
| Agent name precedence (Copilot CLI) | docs conflict | | Don't reuse agent names across user and repo locations. |
| `.mcp.json` `type` | CLI example uses `local` | add-mcp page: `stdio` is the standard | Use `stdio`. |

## 6. Verification log (the implementer fills this in during e2e testing on Windows)

Record each item as **verified / changed**, with the date and the Desktop version:
1. A calculated-table column with an explicit `dataType` (the Date table) loads without a type conflict.
2. A `_Measures` table with `ROW("Dummy", BLANK())` and a `Dummy` column without dataType loads and shows as a measure table.
3. Removing `PBI_QueryOrder` from `model.tmdl` is tolerated (Desktop re-creates it).
4. `annotation __PBI_TimeIntelligenceEnabled = 0` disables auto date/time.
5. Text measures without a `formatString` (or with `@`) are accepted.
6. A title bound to a measure (`title.text` `{"expr": {"Measure": …}}`) renders; confirm against the gallery harvest.
7. The bar `dataPoint.fill` from the Color measure, with a dataViewWildcard selector, colors each bar.
8. A cardVisual reference-label slot for comparisons (from the gallery) is present.
9. The role names for `donutChart` and `lineClusteredColumnComboChart`.
10. The alt-text property path (`visualContainerObjects.general[0].properties.altText`).
11. SharePoint-mode M refreshes in Desktop and in the service without a gateway.
12. The Desktop "Apply external changes" banner handles regenerated pages and visuals.
13. `powerbi-report-author validate` passes on the generated report.
14. A slicer `syncGroup` works across pages.
