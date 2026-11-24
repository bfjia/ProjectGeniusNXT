<!-- Source: https://learn.microsoft.com/en-us/dax/distinct-table-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DISTINCT (table)

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns a table by removing duplicate rows from another table or expression.

## Syntax

``` lang-dax
DISTINCT(<table>)
```

### Parameters

| Term    | Definition                                                                                                        |
|---------|-------------------------------------------------------------------------------------------------------------------|
| `table` | The table from which unique rows are to be returned. The table can also be an expression that results in a table. |

## Return value

A table containing only distinct rows.

## Related functions

There is another version of the DISTINCT function, [DISTINCT (column)](distinct-function-dax), that takes a column name as input parameter.

## Example

The following query:

``` lang-dax
EVALUATE DISTINCT( { (1, "A"), (2, "B"), (1, "A") } )
```

Returns table:

| \[Value1\] | \[Value2\] |
|------------|------------|
| 1          | A          |
| 2          | B          |

## Related content

-   [Filter functions](filter-functions-dax)
-   [DISTINCT (column)](distinct-function-dax)
-   [FILTER function](filter-function-dax)
-   [RELATED function](related-function-dax)
-   [VALUES function](values-function-dax)

------------------------------------------------------------------------
