<!-- Source: https://learn.microsoft.com/en-us/dax/union-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# UNION

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Creates a union (join) table from a pair of tables.

## Syntax

``` lang-dax
UNION(<tableExpression1>, <tableExpression2> [,<tableExpression>]…)
```

### Parameters

| Term              | Definition                               |
|-------------------|------------------------------------------|
| `tableExpression` | Any DAX expression that returns a table. |

## Return value

A table that contains all the rows from each of the two table expressions.

## Remarks

-   The two tables must have the same number of columns.

-   Columns are combined by position in their respective tables.

-   The column names in the return table will match the column names in tableExpression1.

-   Duplicate rows are retained.

-   The returned table has lineage where possible. For example, if the first column of each tableExpression has lineage to the same base column C1 in the model, the first column in the UNION result will have lineage to C1. However, if combined columns have lineage to different base columns, or if there is an extension column, the resulting column in UNION will have no lineage.

-   When data types differ, the resulting data type is determined based on the rules for data type coercion.

-   The returned table will not contain columns from related tables.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following expression creates a union by combining the USAInventory table and the INDInventory table into a single table:

``` lang-dax
UNION(UsaInventory, IndInventory)
```

**USAInventory**

| Country/Region | State | Count | Total |
|----------------|-------|-------|-------|
| USA            | CA    | 5     | 500   |
| USA            | WA    | 10    | 900   |

**INDInventory**

| Country/Region | State | Count | Total |
|----------------|-------|-------|-------|
| IND            | JK    | 20    | 800   |
| IND            | MH    | 25    | 1000  |
| IND            | WB    | 10    | 900   |

Return table,

| Country/Region | State | Count | Total |
|----------------|-------|-------|-------|
| USA            | CA    | 5     | 500   |
| USA            | WA    | 10    | 900   |
| IND            | JK    | 20    | 800   |
| IND            | MH    | 25    | 1000  |
| IND            | WB    | 10    | 900   |

------------------------------------------------------------------------
