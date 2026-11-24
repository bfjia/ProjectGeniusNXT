# 07: KPI framework, pattern libraries, DAX patterns

This document defines how the agents choose, define and verify KPIs. Its sections become these skill reference files:
- §4 → `.github/skills/pbi-kpi-design/kpi-patterns.md`
- §5 + §6 → `.github/skills/pbi-kpi-design/dax-patterns.md`
- §7 → `.github/skills/pbi-kpi-design/modeling-checklist.md` and `.github/skills/pbi-semantic-model/modeling-rules.md`
- §8 → `.github/skills/pbi-qa/reconciliation.md`

The DAX functions used here are documented offline in `reference/learn/dax/*.md`.

---

## 1. Method: from decisions to KPIs

1. **Decision → question → measure.** Each KPI answers a business question, and each question informs a decision. If you can't name the decision, the KPI is a vanity metric. Drop it or demote it to diagnostic.
2. **Outcome, driver, diagnostic tiers.**
   - *Headline* (3–7): the outcomes the audience is accountable for. They go on page 1, with a comparison (target or prior year) and a trend.
   - *Supporting*: the drivers that explain the headline (volume × rate × price decompositions, mix, conversion).
   - *Diagnostic*: breakdowns, data-quality counters and operational detail for root-cause analysis.
3. **Always pair a level with context.** A number alone isn't actionable. Pair it with one of: a target (attainment), a prior period (YoY/MoM), a benchmark (average across peers), or a trend.
4. **Decompose ratios.** For every ratio KPI, also define its numerator and denominator as measures and show them on a supporting page. Readers need to see whether a rate moved because of the top or the bottom.
5. **Prefer counts of business entities over row counts.** If the grain is order *lines*, "Orders" is `DISTINCTCOUNT(Order ID)`, not `COUNTROWS`.
6. **Respect additivity.**
   - Additive KPIs (revenue, units) can be summed across every dimension.
   - Semi-additive ones (balances, headcount, inventory) sum across entities but not across time; use the period-end value.
   - Non-additive ones (ratios, averages, distinct counts) must be recomputed at every level, never summed.
7. **Data must support the KPI.** Check the profile: the columns exist, nulls are under 10% (or explained), and the grain matches. If the data can't support a KPI the user asked for, keep it in the catalog with `status: rejected` and a rationale ("no cost column; provide Unit Cost to enable margin").
8. **Never invent targets.** `target.source` is `user`, `data`, `assumption` (flagged, not shown until approved) or `none`.
9. **Write for the reader.** The definition is one or two sentences a manager understands. It states what's included and excluded and the unit.

## 2. KPI quality checklist (applied by the agent before the gate; `check-spec` checks the mechanical parts)

- [ ] It's linked to at least one question, with a decision sentence.
- [ ] The definition is plain-language, with inclusions and exclusions.
- [ ] The DAX uses DIVIDE for ratios, measures on measures, and no hard-coded dates.
- [ ] The SQL reference is independent (computed from the transformed tables, not by re-using DAX logic) and runs in DuckDB.
- [ ] The format, unit and direction are set.
- [ ] Additivity is set, and the valid dimensions are consistent with it and with the target grain.
- [ ] The target source and provenance are stated; thresholds are only set when a target exists, or for well-known norms that the user confirmed.
- [ ] Caveats and data-quality notes are copied from the profile issues that affect the KPI's columns.
- [ ] Confidence is set using §3.
- [ ] There are 3–7 headline KPIs in total; the KPIs don't duplicate each other (e.g. "Revenue" and "Sales" defined the same way).
- [ ] Ratio KPIs have numerator and denominator measures (supporting tier).

## 3. Confidence rubric

| Level | All of these hold |
|---|---|
| **high** | The definition comes from the user or an official source (or is an unambiguous standard, e.g. a count of orders). The required columns are < 2% null. No unconfirmed assumptions. Reconciliation passes. |
| **medium** | A standard definition that was inferred and not yet confirmed. Or 2–10% nulls or converted values in the required columns. Or one unconfirmed assumption. |
| **low** | A proxy measure. Or > 10% nulls or conversions. Or several assumptions. Or a typical slice has fewer than 30 underlying records (small base). |

Confidence appears in the catalog and on the About page. Low-confidence headline KPIs need a caveat subtitle on page 1 (lint PBA024).

## 4. KPI pattern library (`kpi-patterns.md`)

Each pattern lists: **name**: definition | typical DAX shape | the columns it needs | direction | additivity | pitfalls. The column names are illustrative; map them to the profiled columns.

### 4.1 Sales / retail / commerce
- **Net Revenue**: value of completed sales after discounts | `SUMX(FILTER(Fact, status=completed), qty*price - discount)` | qty, price, discount, status | ↑ | additive | Exclude returns or deduct them? State which. Tax included?
- **Orders**: number of distinct orders | `DISTINCTCOUNT(Fact[Order ID])` | order id | ↑ (context) | non-additive | Line grain vs order grain.
- **Average Order Value**: revenue per order | `DIVIDE([Net Revenue], [Orders])` | | ↑ | non-additive | Outliers (bulk orders); consider the median.
- **Units Sold**: `SUM(qty)` | ↑ | additive.
- **Gross Margin** / **Gross Margin %**: revenue − cost; `DIVIDE(revenue − cost, revenue)` | needs a cost per unit (a product dimension) | ↑ | additive / non-additive | Cost at the time of sale vs current cost.
- **Return Rate %**: returned value (or units, or orders) / sold | `DIVIDE([Returned Value], [Gross Sales])` | a returns table or status | ↓ | non-additive | Return-date vs sale-date attribution; state which (cohort by order date is better for product-quality questions).
- **Revenue % of Target**: attainment | `DIVIDE([Net Revenue], [Net Revenue Target])` | a targets table | ↑ (band) | non-additive | Target grain (region × month): don't slice by product.
- **Sales per Store / per Sq Ft**: productivity | `DIVIDE([Net Revenue], DISTINCTCOUNT(Store[Store]))` or `/ SUM(sqft)` | ↑ | non-additive.
- **New vs Returning Customers**, **Customer Count**, **Purchase Frequency**: needs a customer id | distinct counts with first-purchase logic.

### 4.2 Finance
- **Revenue**, **Operating Expense**, **EBITDA** (if the components exist), **Budget Variance** (actual − budget) and **Budget Variance %** (`DIVIDE(actual − budget, budget)`; ↓ for costs), **Days Sales Outstanding** (`DIVIDE(AR balance, revenue) × days in period`; semi-additive AR), **Cash Balance** (semi-additive: period-end), **Forecast Accuracy** (`1 − DIVIDE(ABS(actual − forecast), actual)`).
- Pitfalls: sign conventions (expenses negative?), period-end vs average balances, currency conversion.

### 4.3 Operations / supply chain
- **On-Time Delivery %**: `DIVIDE(COUNTROWS(FILTER(Fact, delivered <= promised)), COUNTROWS(FILTER(Fact, NOT ISBLANK(delivered))))` | ↑ | Needs a promised date; exclude undelivered from the denominator, and say so.
- **Average Lead Time / Cycle Time (days)**: `AVERAGEX(FILTER(Fact, NOT ISBLANK(end)), end − start)` | ↓ | Consider the median (MEDIANX) when skewed.
- **Fill Rate %**: shipped qty / ordered qty | ↑.
- **Inventory On Hand** (semi-additive), **Inventory Turns** (`DIVIDE(COGS, average inventory)`), **Days of Supply**.
- **Backlog** (open items at period end; semi-additive), **Throughput** (completed per period).
- **Defect Rate / First Pass Yield**: defects / units inspected | ↓ / ↑.

### 4.4 Customer service / support
- **Tickets Opened / Closed**, **Backlog** (open at period end), **First Response Time** (median), **Resolution Time** (median, p90), **SLA Compliance %**, **First Contact Resolution %**, **Reopen Rate %**, **CSAT** (the average of 1–5 scores, or the % of 4–5), **NPS** (`% promoters − % detractors`; non-additive).
- Pitfalls: business hours vs calendar hours; tickets that span periods; survey response bias (show the response count).

### 4.5 HR / workforce
- **Headcount** (period-end, semi-additive), **FTE**, **Hires**, **Leavers**, **Turnover Rate %** (`DIVIDE(leavers, average headcount)`, annualized if needed), **Voluntary Turnover %**, **Time to Fill (days)**, **Absence Rate %**, **Overtime Hours %**, **Training Hours per FTE**.
- Pitfalls: privacy (aggregate only, minimum group size ≥ 5; set `min_base`), and average headcount = (start + end)/2 or the average of month-ends.

### 4.6 Marketing / digital
- **Leads**, **Conversion Rate %**, **Cost per Lead / per Acquisition** (`DIVIDE(spend, conversions)`; ↓), **ROAS** (`DIVIDE(attributed revenue, spend)`), **CTR %**, **Bounce Rate %**, **Email Open Rate %**.
- Pitfalls: the attribution model; date of spend vs date of conversion.

### 4.7 Projects / PMO
- **Projects On Track %** (status = green), **Schedule Variance (days)**, **Budget Burn %** (`DIVIDE(actual cost, budget)`), **Milestones Hit %**, **Open Risks / Issues** (period-end).
- Pitfalls: status snapshots (semi-additive by snapshot date).

### 4.8 Health / public sector / service delivery
- **Cases / Visits / Encounters** (counts of distinct ids), **Rate per 1,000 / 100,000 population** (`DIVIDE([Cases], [Population]) * 100000`; needs a population table at the matching grain), **Positivity Rate %**, **Wait Time (median days)**, **Coverage %** (served / eligible), **Target Attainment %**, **Turnaround Time** (median, p90).
- Pitfalls: small numbers (suppress below a threshold with `min_base`), reporting lag (recent periods are incomplete: flag the last N periods), and population denominators by year.

### 4.9 Data-quality KPIs (always consider adding them as diagnostic)
- **Rows Loaded**, **% Rows Missing <key field>**, **Latest Data Date** (`Data As Of`), **Late-Arriving Records** (if the data has a load date).

### 4.10 Anti-patterns (reject or fix)
- Averages of averages, or summing ratios across categories. Recompute from the components instead.
- `COUNTROWS` on a line-grain table labeled "Orders".
- YoY on a partial current period vs a full prior period. Use same-period comparisons (SAMEPERIODLASTYEAR on the same dates, plus the `Is Past` guard).
- A % with a tiny base, shown without the base. Add `min_base` or show the count next to it.
- A KPI with no direction or no comparison on page 1.
- Mixing grains: comparing an order-level target with a line-level actual.
- Unexplained cumulative totals; label them YTD or rolling.

## 5. DAX patterns (`dax-patterns.md`)

Conventions:
- Always write `'Table'[Column]` for columns and `[Measure]` for measures.
- Measures reference measures where possible.
- `VAR … RETURN` for readability.
- DIVIDE for every division. Never `/`.
- No hard-coded dates. Use the Date table.
- The Date table is called `'Date'`, is marked (`dataCategory: Time`, key `Date`), and has an `Is Past` column.

### 5.1 Base measures
```dax
-- Additive sum
SUM ( 'Sales'[Quantity] )

-- Row-level expression
SUMX ( 'Sales', 'Sales'[Quantity] * 'Sales'[Unit Price] - 'Sales'[Discount] )

-- Filtered base (boolean filter on one column)
CALCULATE ( [Gross Sales], 'Sales'[Status] = "Completed" )

-- Distinct entities (use DISTINCTCOUNTNOBLANK if blanks are possible and should not count)
DISTINCTCOUNT ( 'Sales'[Order ID] )

-- Ratio
DIVIDE ( [Gross Margin], [Net Revenue] )

-- Average per entity
DIVIDE ( [Net Revenue], [Orders] )

-- Median of a duration (days)
MEDIANX ( FILTER ( 'Sales', NOT ISBLANK ( 'Sales'[Ship Date] ) ), 'Sales'[Ship Date] - 'Sales'[Order Date] )

-- Cost via the product dimension (row context + RELATED; needs the Sales → Product relationship)
SUMX ( 'Sales', 'Sales'[Quantity] * RELATED ( 'Product'[Unit Cost] ) )

-- Fact-to-fact via an inactive relationship (e.g. Returns[Order ID] → Sales[Order ID])
CALCULATE ( SUM ( 'Returns'[Refund Amount] ), USERELATIONSHIP ( 'Returns'[Order ID], 'Sales'[Order ID] ) )
```

### 5.2 Helper measures (generated once per model)
```dax
Last Data Date =
CALCULATE ( MAX ( 'Date'[Date] ), REMOVEFILTERS ( 'Date' ), 'Date'[Is Past] = TRUE () )

Data As Of =
"Data as of " & FORMAT ( [Last Data Date], "d mmm yyyy" )
```

### 5.3 Time-intelligence variants (generated from `time_intelligence`; `[X]` = the base measure)

`<FYE>` = the fiscal year-end as `"m-d"`, i.e. the last day of the month before `fiscal_year_start_month`:
- start 1 → `"12-31"`
- 4 → `"3-31"`
- 7 → `"6-30"`
- 10 → `"9-30"`

Compute it as `f"{prev_month}-{last_day(prev_month)}"`, using 28 for February.

| Variant | DAX |
|---|---|
| `PY` | `CALCULATE ( [X], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )` |
| `YoY` | `VAR _cur = [X] VAR _py = [X PY] RETURN IF ( NOT ISBLANK ( _cur ) && NOT ISBLANK ( _py ), _cur - _py )` |
| `YoY %` | `VAR _cur = [X] VAR _py = [X PY] RETURN IF ( NOT ISBLANK ( _cur ), DIVIDE ( _cur - _py, _py ) )` |
| `YTD` | `IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], CALCULATE ( [X], DATESYTD ( 'Date'[Date], "<FYE>" ) ) )` |
| `PYTD` | `IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], CALCULATE ( [X], SAMEPERIODLASTYEAR ( DATESYTD ( 'Date'[Date], "<FYE>" ) ) ) )` |
| `MTD` | `IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], CALCULATE ( [X], DATESMTD ( 'Date'[Date] ) ) )` |
| `QTD` | `IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], CALCULATE ( [X], DATESQTD ( 'Date'[Date] ) ) )` (fiscal quarters ≠ calendar quarters: if `fiscal_year_start_month` ∉ {1,4,7,10}, don't offer QTD and warn) |
| `Rolling 3M` / `Rolling 12M` | `IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], CALCULATE ( [X], DATESINPERIOD ( 'Date'[Date], MIN ( MAX ( 'Date'[Date] ), [Last Data Date] ), -<3\|12>, MONTH ) ) )` |
| `3M Avg` (monthly average) | `VAR _end = MIN ( MAX ( 'Date'[Date] ), [Last Data Date] ) VAR _period = DATESINPERIOD ( 'Date'[Date], _end, -3, MONTH ) RETURN IF ( MIN ( 'Date'[Date] ) <= [Last Data Date], DIVIDE ( CALCULATE ( [X], _period ), CALCULATE ( DISTINCTCOUNT ( 'Date'[Month Start] ), _period ) ) )` |

Notes:
- Time intelligence on a **non-additive** KPI is fine: it re-evaluates the ratio over the shifted period. YTD of a ratio = the ratio over the YTD period, **not** the sum of monthly ratios.
- For **semi-additive** KPIs, offer only `PY` and `YoY`/`YoY %`; YTD, MTD and rolling are meaningless.
- Variants inherit `format` from the base, except `YoY %` → `percent_1dp`. `YoY` uses the base format.

### 5.4 Semi-additive (period-end balance) base
```dax
CALCULATE (
    SUM ( 'Inventory'[On Hand] ),
    LASTNONBLANK ( 'Date'[Date], CALCULATE ( COUNTROWS ( 'Inventory' ) ) )
)
```
Average balance over a period: `AVERAGEX ( VALUES ( 'Date'[Month Start] ), [Inventory On Hand] )`. Because Month Start isn't the Date key, add `REMOVEFILTERS` carefully. Prefer `AVERAGEX ( DATESINPERIOD(...) )` patterns only when necessary, and document them.

### 5.5 Targets
- `target.source: data` → `<X> Target = <target.dax>`, e.g. `SUM ( 'Target'[Revenue Target] )`. Valid only over the target's dimensions; outside them (e.g. by Product) the measure should return BLANK. Guard: `IF ( ISFILTERED ( 'Product' ) || ISFILTERED ( 'Store' ), BLANK (), SUM ( 'Target'[Revenue Target] ) )`, listing every dimension table that isn't in `valid_dimensions` but is connected to the fact.
- `target.source: user` with a static value:
  - non-additive KPI (ratio) or `period: all` → `<X> Target = <value>`
  - additive KPI with a period → `<X> Target = <value> * CALCULATE ( DISTINCTCOUNT ( 'Date'[<Period column>] ), 'Date'[Is Past] = TRUE () )`, where the period column is `Month Start` for month, `Week Start` for week, `Date` for day, `Quarter`+`Year` for quarter (use `COUNTROWS ( SUMMARIZE ( FILTER('Date', 'Date'[Is Past]), 'Date'[Year], 'Date'[Quarter Number] ) )`), and `Year` for year.
- Derived measures (generated whenever a target exists):
  - `<X> vs Target` = `[X] - [X Target]` (same format as X)
  - `<X> % of Target` = `DIVIDE ( [X], [X Target] )` (attainment; `percent`)
  - `<X> vs Target %` = `DIVIDE ( [X] - [X Target], [X Target] )` (variance %; `percent_1dp`)
- `target.source: assumption` → the measures are generated with the suffix ` (Proposed)` and the display folder `_Proposed targets`. Lint PBA015 blocks them from visuals until `status: approved`. Once approved, the suffix is dropped.

### 5.6 Status and color (generated when `thresholds` exist)
Thresholds are written as strings `"<op> <number>"`, op ∈ `>=, >, <=, <`. `thresholds.on` is `attainment` (default when a target exists; the value tested is `[X % of Target]`) or `value` (the value tested is `[X]`).

```dax
<X> Status =
VAR _v = <[X % of Target] | [X]>
RETURN
    SWITCH (
        TRUE (),
        ISBLANK ( _v ), BLANK (),
        _v <good op> <good n>, 1,
        _v <warn op> <warn n>, 0,
        -1
    )

<X> Color =
SWITCH ( [<X> Status], 1, "<theme.good>", 0, "<theme.warn>", -1, "<theme.bad>", "<theme.neutral>" )
```
Format strings: Status `0`; Color is text (omit formatString for text measures, or use `@`). **Check this in e2e:** if the generator requires a formatString on every measure, use `formatString: @` for text-returning measures. Update the lint rule PBA002 to accept text measures that have `@` or no formatString.

### 5.7 Minimum base (`min_base`)
If the KPI has `min_base: {measure: <M>, value: <n>}`, wrap the base expression:
`VAR _base = [<M>] RETURN IF ( _base < <n>, BLANK (), <original expression> )`. Its documentation states: "Suppressed when fewer than n <M>."

### 5.8 Dynamic titles (helper measures; text, no format)
```dax
Title Net Revenue Trend =
VAR _y = [Net Revenue YoY %]
RETURN
    "Net Revenue by month"
        & IF ( NOT ISBLANK ( _y ), " — " & FORMAT ( _y, "+0.0%;-0.0%;0.0%" ) & " vs prior year" )

Title Region Attainment =
VAR _worst = MINX ( VALUES ( 'Region'[Region] ), [Net Revenue % of Target] )
RETURN "Revenue vs target by region — lowest at " & FORMAT ( _worst, "0%" )
```

### 5.9 Ranking and top N helpers
```dax
<X> Rank = IF ( ISINSCOPE ( 'Product'[Category] ), RANKX ( ALLSELECTED ( 'Product'[Category] ), [X], , DESC, DENSE ) )
<X> Share of Total = DIVIDE ( [X], CALCULATE ( [X], ALLSELECTED ( 'Product' ) ) )
```

## 6. Format mapping (KPI `format` → TMDL `formatString`)

`<s>` = the currency symbol for `project.currency` (USD/CAD/AUD → `$`, EUR → `€`, GBP → `£`, JPY → `¥`; any other currency → `"<CODE> "` as a quoted prefix).

| format | formatString |
|---|---|
| currency | `<s>#,##0` |
| currency_2dp | `<s>#,##0.00` |
| currency_k | `<s>#,##0,K` |
| currency_m | `<s>#,##0.0,,M` |
| integer | `#,##0` |
| decimal | `#,##0.00` |
| percent | `0%` |
| percent_1dp | `0.0%` |
| ratio | `0.00` |
| days | `#,##0.0` |
| custom | `format_string` |

(Add `currency_2dp` to the `format` enum in `03-specs.md`; it's included in the schema.)

## 7. Modeling checklist (`modeling-checklist.md` / `modeling-rules.md`)

1. **Star schema.** Facts (events, transactions, snapshots, targets) sit on the many side; dimensions (who, what, where) on the one side. Avoid snowflakes unless a dimension is shared (e.g. Region used by Store and Target).
2. **Relationships:** single-column, many-to-one, single direction (dimension → fact). The `to` column must be unique after transforms. No bidirectional filters unless justified. No many-to-many in v1; use a bridge table if one is truly needed.
3. **Role-playing dates:** one active relationship (the primary business date), the others inactive and used with `USERELATIONSHIP` in specific measures.
4. **Date table:** generated, contiguous, covering all fact dates, marked, with `Is Past`. Auto date/time off.
5. **Targets at a coarser grain:** relate the target table to shared dimensions at its own grain (Region, Month Start → Date), and guard the target measures against dimensions finer than the target (§5.5).
6. **Measures live in `_Measures`**, with display folders by tier and KPI. Never rely on implicit measures: `summarizeBy: none` everywhere.
7. **Descriptions everywhere:** tables (what a row is), visible columns (meaning + unit), measures (definition + KPI id).
8. **Hide** foreign keys, technical ids, sort-helper columns and free-text columns not used in visuals.
9. **Sort-by columns** for month and day names, and fiscal labels.
10. **Data categories** for geography (Country, StateOrProvince, City, PostalCode) and URLs.
11. **Data reduction:** drop columns that no KPI, visual or relationship uses (`keep_columns`), and avoid high-cardinality text columns (see `reference/learn/modeling/import-modeling-data-reduction.md`).
12. **Prefer transforms in M (`sources.yaml`) over DAX calculated columns.**
13. **Names:** business-friendly Title Case. No prefixes. Units in the names of numeric columns where helpful ("Sq Ft").

Upstream reference: `reference/learn/modeling/star-schema.md`, `model-date-tables.md`, `desktop-relationships-understand.md`, and Microsoft's `reference/microsoft-skills-for-fabric/powerbi-authoring/skills/semantic-model-authoring/references/modeling-guidelines.md`, `naming-conventions.md`, `dax-guidelines.md`.

## 8. Reconciliation method (`reconciliation.md`)

**Why:** the DAX measures and the DuckDB SQL are written independently from the same definition. They also run over data produced by two independent transform engines (Power Query M in Power BI; pandas in pbiagent). Agreement is strong evidence that the definition, the transforms and the model wiring are all right.

**Steps:**
1. `pbi expected` computes the SQL values per slice → `work/expected/kpi-values.json`. It also stores table sanity numbers (row counts, sums of decimal columns).
2. `pbi dax-queries` writes the matching DAX queries.
3. The results come from the MCP (`dax_query_operations` against the Desktop instance) or are pasted by the user.
4. `pbi reconcile` compares them with a relative tolerance of 0.05%, and exact equality for counts.

**Expected benign differences, normalized by the comparer:**
- SQL `NULL` group ↔ DAX blank group: both are shown as `(Blank)`.
- **Case and trailing spaces:** the VertiPaq engine groups text case-insensitively and ignores trailing spaces, while DuckDB doesn't. The comparer case-folds and trims group keys. If that merges SQL groups, it raises a warning recommending `trim` (plus a case-normalizing `replace_values`) in `sources.yaml`.
- Fixed-decimal (`decimal`) columns are rounded to 4 dp by Power Query, while SQL uses doubles. The tolerance covers this.
- `DISTINCTCOUNT` counts BLANK as a value; SQL `COUNT(DISTINCT)` doesn't. If they differ by exactly 1 and the column has nulls, classify it as `BLANK_IN_DISTINCTCOUNT`. Fix it by using `DISTINCTCOUNTNOBLANK` or filtering the blanks out.

**Diagnosis order on a mismatch:**
1. The **table sanity** queries (row counts and sums) disagree → a transform difference (M vs pandas). Look at the type-conversion error counts (`preview-source`), the filters, `promote_headers` naming, and the locale/culture used for dates and numbers.
2. Sanity agrees but the KPI disagrees at the grand total → a definition difference (DAX vs SQL). Re-read both against the plain-language definition and fix the wrong one.
3. The total agrees but a slice disagrees → a relationship or join issue: orphan keys (SQL LEFT JOIN keeps the orphans as a NULL group; DAX shows them under `(Blank)`), an inactive relationship, or a wrong `by` column.
4. Only time-intelligence variants disagree → the Date table range, fiscal year-end, or the `Is Past` guard.

**Accepting a mismatch** requires the user's explicit agreement, logged with `pbi log --source user`. It's also listed in `docs/validation-report.md` under "Accepted differences".
