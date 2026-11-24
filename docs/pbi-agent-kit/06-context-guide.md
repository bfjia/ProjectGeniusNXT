# 06: Context guide and templates

This file defines four deliverables:
- `docs/CONTEXT-GUIDE.md` (§1, user-facing)
- `docs/templates/context-brief.md` (§2)
- `docs/templates/data-dictionary.csv` and `kpi-definitions.csv` (§3)
- `docs/templates/answers.md` (§4)

§5 is the scoring rubric used by `pbi intake` and the `pbi-context-intake` skill (`rubric.md`).

---

## 1. `docs/CONTEXT-GUIDE.md`: How to give the agent good context

````markdown
# How to give the agent good context

The agent can explore your spreadsheets on its own, but **it cannot know why the dashboard exists**. The quality of the KPIs depends far more on context than on the data. Ten minutes spent here typically saves hours of back-and-forth and avoids dashboards that look busy but don't help anyone decide anything.

You provide context in `projects/<Name>/context/`:

| File | Required? | What |
|---|---|---|
| `brief.md` | Strongly recommended | The brief — copy of `docs/templates/context-brief.md`, created for you by `pbi init`. |
| `data-dictionary.csv` | Optional | Meaning of columns/codes if you have them. |
| `kpi-definitions.csv` | Optional | KPIs your organization already uses, with exact formulas and targets. |
| `answers.md` | Created by the agent | Your answers to the agent's questions; you can edit it. |
| Any other `.md`/`.txt`/`.pdf` | Optional | Existing documents (a strategy memo, a metric definitions page). The agent reads `.md`/`.txt` directly; for PDFs, paste the relevant parts into `brief.md`. |

## The 5-minute minimum brief
If you only answer five things, answer these (they are at the top of the template):
1. **Who will use this dashboard, and what decision will they make with it?** ("Regional managers, monthly, deciding where to move promotion budget.")
2. **What are the 3 questions they must be able to answer in under a minute?**
3. **Which numbers do they already track, and how exactly are they calculated?** (Even "we look at margin, revenue minus cost over revenue" helps.)
4. **Are there targets or thresholds? Where do they come from?**
5. **What does one row in each file mean, and is anything in the data known to be wrong or tricky?**

## What makes context good

### 1. Decisions, not topics
| Weak | Strong |
|---|---|
| "Sales dashboard" | "Regional managers decide every month how to split a fixed promo budget across their stores; they need to see which stores are below target and whether it's traffic or basket size." |
| "Show returns" | "The COO wants to know if return rates are rising after we changed the courier in March 2025, and which product categories are affected." |

The agent builds KPIs **backwards from decisions**. A dashboard without a decision gets generic KPIs.

### 2. Exact definitions beat names
| Weak | Strong |
|---|---|
| "Revenue" | "Revenue = quantity × unit price − discount, completed orders only (Status = C). Returns are NOT subtracted; we track them separately." |
| "Active customer" | "A customer with ≥ 1 completed order in the trailing 90 days." |

If your organization has an official definition, **paste it verbatim** and say who owns it. If there's disagreement, say so; the agent will document both options and ask.

### 3. Targets with provenance
Give the number, the period, and the source: "2026 monthly revenue targets per region are in the Targets sheet (Finance plan, approved Jan 2026)". If there are no targets, say "no targets". The agent **never invents targets**. Without one it shows trends and comparisons (vs prior year) instead.

### 4. Business rules and calendars
- Fiscal year start month, week start day, holidays/closures that explain gaps.
- Inclusions and exclusions: test accounts, internal orders, cancelled records.
- Code meanings: status codes, abbreviations, region codes.
- Time zones, currencies, units (thousands? cents?), VAT included or not.

### 5. What a row is (grain)
For each file or sheet: "one row per order line", "one row per employee per month", "one row per ticket status change". This is the single most useful data fact you can give, because it determines how everything is counted.

### 6. Known data problems
"Store 14 closed in June 2025, ignore its data after that." "Before 2025 the Discount column was in percent, after that in dollars." "The Region column is blank for online orders." Telling the agent saves it from guessing and lets it document the caveat for readers.

### 7. Audience and constraints
Who reads it (executives on phones? analysts on large screens?), how often, how much detail, confidentiality (no personal names on the dashboard?), branding colors, language, page count limits.

### 8. Out of scope
What should **not** be on the dashboard (it keeps the design focused).

## Preparing the spreadsheets (helps, but is not required)
The agent handles title rows, merged cells, blank rows, totals, wide month columns and text-formatted numbers, and it tells you what it did. These help:
- Save `.xls` as `.xlsx`.
- One table per sheet if you can; keep notes on a separate sheet.
- Don't change file or sheet names after the dashboard is built (refresh depends on them). If you must, tell the agent.
- New data next month? Replace the file with the same name and layout, then refresh. If you'll get one file per month, say so: the agent will set the dashboard up to combine them.
- Personal data: remove columns you don't need (names, emails). The agent masks what it detects, but not sending it is better.

## How the conversation works
1. You drop files and (ideally) fill `brief.md`, then ask the agent to build the dashboard.
2. The agent reads everything, scores how complete the context is, and asks **at most 5** questions, each with a suggested answer. You can reply "use your defaults".
3. After exploring the data it asks **at most 7** data questions (e.g. "Status codes C/R/P mean Completed/Returned/Pending?").
4. You review and approve the **KPI catalog** (the most important review: are these the right numbers, defined the right way?).
5. You review and approve the **page wireframes**.
6. You open the result in Power BI Desktop, refresh, and review. The agent checks every KPI against an independent calculation and documents the results.
7. You publish when you're happy.

Anything the agent assumed is listed in `docs/assumptions-and-decisions.md`. Read it. It's where silent mistakes would hide.

## Changing things later
Just say it in chat: "Gross margin should exclude shipping", "Add a page for store managers", "Targets changed — new file attached". The agent updates the right spec and rebuilds the affected parts.
````

---

## 2. `docs/templates/context-brief.md`

````markdown
# Dashboard brief — <Project title>

> Fill what you can. Short answers are fine. Delete the hints in *italics*. "Don't know" is a valid answer.

## ⭐ Minimum brief (please answer these 5)
1. **Users and decision** — *Who uses it, how often, and what will they decide or do differently?*
   -
2. **Top questions (max 3–5, most important first)** — *What must they be able to answer in under a minute?*
   1.
   2.
   3.
3. **Numbers you already track** — *Names and, if you know, exact formulas.*
   -
4. **Targets / thresholds** — *Values, period, source; or "none".*
   -
5. **The data** — *What one row means in each file/sheet; anything known to be wrong or tricky.*
   -

---

## Purpose & audience (optional detail)
- Primary audience: *(role, number of people)*
- Secondary audience:
- Frequency of use: *(daily / weekly / monthly / ad hoc)*
- Device: *(desktop / large screen / mobile)*
- Data literacy: *(executive summary only / comfortable with filters / analysts)*

## Decisions supported
| Decision | Who | When | What would change it |
|---|---|---|---|
| | | | |

## Business questions (ranked)
| # | Question | Decision it informs | Priority (1=highest) |
|---|---|---|---|
| Q1 | | | |

## Known KPIs / metrics
| Name | Exact definition / formula | Includes / excludes | Target & source | Higher or lower is better | Owner |
|---|---|---|---|---|---|
| | | | | | |

## Business rules
- Fiscal year starts in: *(month)*  Week starts on: *(Mon/Sun)*
- Currency / units: *(e.g. USD, values in thousands?)*  Tax included?:
- Exclusions: *(test data, internal orders, cancelled…)*
- Code meanings: *(e.g. Status C = Completed…)*
- Other rules:

## Data description
| File / sheet | One row = | Source system | Refresh frequency | Notes / known issues |
|---|---|---|---|---|
| | | | | |

## Comparisons wanted
- [ ] vs target   - [ ] vs prior year   - [ ] vs prior period   - [ ] vs peer group/average   - [ ] trend only
- Segments/filters people need: *(region, product, team…)*

## Constraints
- Confidentiality (e.g. no personal names shown):
- Branding (colors/logo/fonts):
- Language/locale:
- Max number of pages:
- Accessibility needs:

## Out of scope
-

## Where it will live
- Workspace name (if known):
- Where the production spreadsheets will be stored: *(SharePoint/OneDrive for Business path, or network/local folder)*
- Who owns refresh:
````

---

## 3. CSV templates

`docs/templates/data-dictionary.csv`:
```csv
file,sheet_or_table,column,meaning,type,unit,allowed_values_or_codes,notes
HarborOutfitters_Sales.xlsx,Orders,Status,Order status,code,,"C=Completed;R=Returned;P=Pending",
```

`docs/templates/kpi-definitions.csv`:
```csv
name,definition,formula_in_words,includes,excludes,target_value,target_period,target_source,direction,owner
Gross Margin %,Share of revenue kept after product cost,(revenue - cost) / revenue,completed orders,returns,0.42,month,Finance plan 2026,higher_is_better,CFO office
```

`pbi intake` parses both with the stdlib `csv` module (UTF-8, falling back to cp1252). Unknown columns are kept as notes.

---

## 4. `docs/templates/answers.md`

````markdown
# Answers to agent questions

<!-- The agent appends here when you answer in chat. You can also edit answers directly. Format: one heading per question id. -->

## Q-01
Question: …
Answer: …
Answered by: <name> on <date>
````

---

## 5. Completeness rubric (`pbi-context-intake/rubric.md` and `pbi intake` scoring)

`pbi intake` extracts each section from the brief by heading, matching the template headings case-insensitively. It also counts filled table rows and bullet items that aren't hint text (it ignores lines that are still template placeholders, i.e. italic hints, empty bullets, or `|  |` rows).

| Section | Weight | 0 | 0.5 | 1 |
|---|---|---|---|---|
| Users & decision | 0.25 | empty | audience OR decision | audience AND a concrete decision (verb + object, e.g. "allocate budget") |
| Top questions | 0.20 | none | 1–2 questions or vague ("show sales") | ≥ 3 specific questions |
| Known KPIs | 0.15 | none | names only | ≥ 1 with a formula or definition |
| Targets | 0.10 | not mentioned | mentioned without value/source | values with source, **or** an explicit "none" |
| Data description | 0.15 | none | some files described | grain stated for every file/sheet |
| Business rules | 0.10 | none | some | fiscal calendar + exclusions + codes (where relevant) |
| Constraints / scope | 0.05 | none | some | audience device + confidentiality + out-of-scope |

`score = Σ weight × level`.
- **≥ 0.75**: good. Proceed.
- **0.5–0.75**: adequate. Ask the top gaps only.
- **< 0.5**: thin. Ask up to 5 questions, or proceed with assumptions if the user prefers.

The CSV files count toward their sections: `kpi-definitions.csv` → Known KPIs (and Targets if target columns are filled); `data-dictionary.csv` → Data description and Business rules (codes).

**Question priority when asking** (pick the top 5 unresolved):
1. the decision and audience
2. the top questions
3. the definitions of KPIs the user named
4. targets
5. the grain of each file
6. fiscal calendar and exclusions
7. code meanings
8. constraints

Each question is phrased with a proposed default: *"Who will use this and what will they decide? — My assumption: regional managers reviewing monthly performance to allocate budget. OK?"*

`work/context-summary.md` structure:
1. Score table
2. Normalized facts (audience, decisions, questions with ids, KPIs, targets, rules, data notes, constraints, out of scope)
3. Gaps (ranked)
4. Questions asked and answers
5. Assumptions in force
