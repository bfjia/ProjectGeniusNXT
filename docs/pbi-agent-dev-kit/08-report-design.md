# 08: Report design rules

This becomes `.github/skills/pbi-report-build/design-rules.md`. It's aligned with Microsoft's design references, which are vendored at `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/design/`:
- `layout.md`
- `chart-selection.md`
- `color.md`
- `typography.md`
- `accessibility.md`
- `anti-patterns.md`
- `archetypes/*.md`
- `pre-flight-checklist.md`

Link those files from the skill for deeper guidance.

## 1. Principles
1. **Answer questions, in order of importance.** Every page states which business questions it answers (`questions:`). Page 1 answers the priority-1 questions at a glance (under 1 minute).
2. **Overview first, then zoom and filter, then details on demand.** Executive summary → driver pages → detail/drillthrough.
3. **Every number has context:** a comparison (target, PY), a trend, or a benchmark.
4. **Few visuals, each earning its place:** ≤ 8 data visuals per page (cards count as 1 group).
5. **Titles say what the reader learns.** Use a question or insight ("Which regions are below target?"), or a dynamic title measure, not "Sales by Region".
6. **Consistency:** the same colors for the same meaning on every page (good, warn, bad, actual vs comparison), the same slicer positions, the same number formats.
7. **Accessibility is mandatory:**
   - contrast ≥ 4.5:1 for text and ≥ 3:1 for marks
   - color is never the only channel (status also shown as text or an icon)
   - alt text on every visual
   - logical tab order

## 2. Page archetypes (`archetype:` in report.yaml)

| Archetype | Purpose | Typical composition (1280×720) |
|---|---|---|
| `executive-summary` | Headline status at a glance | Header; a card strip (all headline KPIs, with PY/target comparison) of span 12, height 120; a hero trend (span 8) + a ranked breakdown vs target (span 4), height 248; a secondary row of 2 visuals (driver matrix + diagnostic), height 208 |
| `driver-analysis` | Why a headline moved | Header + a KPI-selector cards row (optional); a decomposition (bar by dimension sorted by contribution; matrix with numerator, denominator, rate); a scatter of rate vs volume (optional); ≤ 6 visuals |
| `trend` | How things evolve | Header; a large line (span 12) with PY; small multiples via `series`, or 2–3 smaller lines by segment |
| `comparison` | Segment vs segment / benchmark | Sorted bars with an average reference; a matrix with conditional color; ≤ 3 measures |
| `detail` | Exact values, lookup, export | Header + slicers; a table or matrix spanning 12 and filling the page; drillthrough from other pages via `drillthrough.field` |
| `operational-monitor` | Daily or weekly operational status | A status card row with Color measures; a list of exceptions (table filtered to Status = -1); a short trend |
| `about` | Definitions, sources, caveats (auto-generated) | See §7 |

**Default page set** (the designer adapts it to the questions):
1. Executive summary (always)
2. One driver page per cluster of supporting KPIs (1–3 pages)
3. Detail page (when the audience needs record-level lookup)
4. About & Definitions (always)

Total: 3–6 pages.

## 3. Layout grid (enforced by `report/layout.py`)
- Canvas: 1280×720 (16:9). `displayOption: FitToPage`.
- 8px base grid: all positions and sizes are multiples of 8.
- Margins 24, gutter 16, 12 columns of 88px. A span of N columns = `104·N − 16` px wide.
  - span 12 = 1232
  - span 8 = 816
  - span 6 = 608
  - span 4 = 400
  - span 3 = 296
- Header band: title at (24, 16, 608×40); subtitle at (24, 56, 608×24); up to 3 slicers right-aligned at y=16, each 2 columns (192×56).
- Content area: y from 88 to 696, i.e. 608 px. With R rows: Σheights + 16·(R−1) ≤ 608.
  - 3 rows: e.g. 120 / 248 / 208
  - 2 rows: e.g. 120 / 472, or 288 / 304
- Reading order (F-pattern): the most important visual top-left; card strip first.
- Card strip: one multi-value `cardVisual`; at least 250 px per callout (≤ 4 callouts for span 12 is comfortable; 5 is the maximum).
- Tables and matrices need height ≥ 208.

## 4. Visual selection

| What the KPI or question needs | Use (spec `type`) | Notes |
|---|---|---|
| A headline value with comparison | `cards` (comparison PY or target) | Not gauges. |
| A single KPI vs goal with trend | `kpi` | Needs a `trend_axis` date column and a goal measure. |
| Trend over time, ≥ 7 points | `line` (with PY as a second series) | Month Start axis; ≤ 3 series. |
| Trend, ≤ 6 periods | `column` | |
| Ranking or comparison across ≤ 15 categories | `bar` sorted desc (top_n 10 if > 15) | Long labels → bar, not column. |
| Attainment vs target by segment | `bar` on `% of Target`, sorted asc, `conditional_color` = Color measure | Reference line at 100% (v1: say it in the title). |
| Part-to-whole, ≤ 5 parts | `donut` | Otherwise a sorted bar. |
| Volume and rate together | `combo` (columns = volume, line = rate) | Only with a clear secondary axis and different units. Otherwise two visuals. |
| Relationship between two measures | `scatter` | Analyst audience. |
| Exact values / multi-measure breakdown | `matrix` (hierarchy rows) or `table` | Use `% of Target` / YoY columns with conditional color. |
| Filters | slicers in the header band (≤ 3); global slicers for Date/Region | Dropdowns save space. |
| Explanation | `text` | Short. Definitions live on the About page. |

Never use: pie with > 5 slices, gauges, 3D, dual-axis with the same units, legacy `card`/`multiRowCard`, maps (`map`, `filledMap`; deprecated; for geography prefer sorted bars in v1), or Q&A visuals.

## 5. Theme (`report/theme.py`)

Generated from `project.yaml report.theme`. Defaults:
- primary `#1F4E79`
- secondary `#2E86C1`
- accent `#F39C12`
- good `#1E8449`
- warn `#B9770E`
- bad `#C0392B`
- neutral `#7F8C8D`
- background `#FFFFFF`
- foreground `#252423`
- font `Segoe UI`

The data colors start with the colorblind-safe Okabe-Ito order, adjusted for contrast on white.

```json
{
  "name": "<ThemeName>-<hex8>.json",
  "dataColors": ["#1F4E79", "#E69F00", "#009E73", "#56B4E9", "#D55E00", "#CC79A7", "#0072B2", "#7F8C8D"],
  "good": "#1E8449",
  "neutral": "#B9770E",
  "bad": "#C0392B",
  "maximum": "#1F4E79",
  "center": "#F7F7F7",
  "minimum": "#C0392B",
  "background": "#FFFFFF",
  "foreground": "#252423",
  "tableAccent": "#1F4E79",
  "textClasses": {
    "callout": { "fontSize": 28, "fontFace": "Segoe UI", "color": "#252423" },
    "title":   { "fontSize": 14, "fontFace": "Segoe UI Semibold", "color": "#252423" },
    "header":  { "fontSize": 12, "fontFace": "Segoe UI Semibold", "color": "#252423" },
    "label":   { "fontSize": 10, "fontFace": "Segoe UI", "color": "#3B3A39" }
  },
  "visualStyles": {
    "*": {
      "*": {
        "border": [{ "show": true, "color": { "solid": { "color": "#E1DFDD" } }, "radius": 8 }],
        "dropShadow": [{ "show": false }],
        "padding": [{ "top": 8, "bottom": 8, "left": 8, "right": 8 }],
        "valueAxis": [{ "gridlineStyle": "dotted", "gridlineColor": { "solid": { "color": "#EDEBE9" } } }],
        "categoryAxis": [{ "gridlineStyle": "dotted", "gridlineColor": { "solid": { "color": "#EDEBE9" } } }]
      }
    },
    "page": { "*": { "background": [{ "color": { "solid": { "color": "#F7F8FA" } }, "transparency": 0 }] } }
  }
}
```

Notes:
- `name` must equal the file name, including `.json` (see `04-python-core.md` §6.10).
- Validate the theme with `reference/report-theme-schema/reportThemeSchema-2.159.json`, and fix any property the schema rejects. The `visualStyles.page` structure in particular must match the schema; if it doesn't, drop it and set the page background in each `page.json` instead (page `objects.background`, a static Literal color).
- Status colors in Color measures use the theme's good/warn/bad hex values, so pages stay consistent.
- Contrast check (implement in `theme.py`): compute the WCAG contrast ratio of foreground on background (≥ 4.5) and of every data color on the background (≥ 3.0). On failure, darken the color in steps of 5% lightness until it passes, then warn.

## 6. Titles, labels and numbers
- **Titles:** 14pt semibold, sentence case, ≤ 60 characters. Questions or insights. For dynamic titles use helper measures (`Title …`) that include the key comparison.
- **Data labels:** on for bars when there are ≤ 12 bars; off for lines (use tooltips), except the last point (v1: off).
- **Number formats** come from the measure formats. No per-visual overrides.
- **Axis titles:** off when the title already states the measure; keep the units in the measure name or title.
- **Blank handling:** cards show "—" for blank (cardVisual formatting if available; else leave it).
- **Subtitle on page 1:** `Data As Of` + caveats for low-confidence KPIs.

## 7. About & Definitions page (generated)
- **Title:** "About this report".
- **Left column:** "What this report answers" (business questions → page names); "KPI definitions" (for each approved KPI: **name**, definition, target source, confidence, owner).
- **Right column:** "Data sources & refresh" (files and sheets, source mode, refresh guidance, `Data As Of` card); "Caveats & data quality" (top 5, from KPI caveats and the data-quality log); "Contact / owner" (`docs.owner`).
- **Footer text:** "Full documentation: docs/README.md and docs/kpi-catalog.md in the project folder."

## 8. Wireframes (`pbi wireframe` → docs/report-design.md)
ASCII, scaled to a 96×36 character grid representing 1280×720. Each visual is drawn as a box labeled `[type] title (measures)`. For example:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Store Performance Overview                                    [Year ▾] [Region ▾]           │
│ Data as of 30 Sep 2026                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [cards] Net Revenue · Gross Margin % · Orders · Return Rate %   (vs PY)                      │
├─────────────────────────────────────────────────────────────┬────────────────────────────────┤
│ [line] Net Revenue by month — +4.2% vs PY                   │ [bar] Revenue vs target by     │
│        (Net Revenue, Net Revenue PY)                        │  region (% of Target, colored) │
├──────────────────────────────────────────┬──────────────────┴────────────────────────────────┤
│ [matrix] Margin by category              │ [column] Returns by reason (Return Rate %)        │
└──────────────────────────────────────────┴───────────────────────────────────────────────────┘
```
Under each wireframe there's a table: visual | type | fields | KPI refs | question.

## 9. Pre-flight checklist (the designer runs it before the design gate; the lint rules enforce most of it)
- [ ] Every priority-1 question is answered on page 1.
- [ ] All headline KPIs are on page 1, with comparisons.
- [ ] ≤ 8 data visuals per page; no overlaps; fits the canvas.
- [ ] Titles are questions, insights or dynamic.
- [ ] No proposed (unapproved) targets are shown.
- [ ] Ratio KPIs are shown with their base somewhere (a matrix column or tooltip).
- [ ] Slicers are consistent across pages; at most 3 per page.
- [ ] Colors: the theme only; status by Color measures; color isn't the only channel (values or labels shown).
- [ ] Alt text and tab order are set (automatic).
- [ ] The About page is present.
