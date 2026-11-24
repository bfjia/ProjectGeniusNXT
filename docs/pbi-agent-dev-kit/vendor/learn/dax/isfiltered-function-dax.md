<!-- Source: https://learn.microsoft.com/en-us/dax/isfiltered-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# ISFILTERED

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns `TRUE` when the specified table or column is being filtered directly.

## Syntax

``` lang-dax
ISFILTERED(<TableNameOrColumnName>)
```

### Parameters

| Term                    | Definition                                                           |
|-------------------------|----------------------------------------------------------------------|
| `TableNameOrColumnName` | The name of an existing table or column. It cannot be an expression. |

## Return value

`TRUE` when `ColumnName` or a column of `TableName` is being filtered directly. Otherwise returns `FALSE`.

## Remarks

-   A column or table is said to be filtered directly when a filter is applied to `ColumnName` or any column of `TableName`.

-   A column or table is said to be cross-filtered when a filter is applied to `ColumnName`, any column of `TableName`, or to any column of a related table. Therefore, the [ISCROSSFILTERED](iscrossfiltered-function-dax) function also returns `TRUE` when `ColumnName`, any column of `TableName`, or a column of a related table is filtered.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Related content

-   [ISCROSSFILTERED function](iscrossfiltered-function-dax)
-   [FILTERS function](filters-function-dax)
-   [HASONEFILTER function](hasonefilter-function-dax)
-   [HASONEVALUE function](hasonevalue-function-dax)

------------------------------------------------------------------------
