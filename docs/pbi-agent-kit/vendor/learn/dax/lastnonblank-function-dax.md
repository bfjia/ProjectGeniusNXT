<!-- Source: https://learn.microsoft.com/en-us/dax/lastnonblank-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# LASTNONBLANK

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/discouraged.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Note

This function is discouraged for use in [visual calculations](/en-us/power-bi/transform-model/desktop-visual-calculations-overview) as it likely returns meaningless results.

Returns the last value in the column, `column`, filtered by the current context, where the expression is not blank.

## Syntax

``` lang-dax
LASTNONBLANK(<column>,<expression>)
```

### Parameters

| Term         | Definition                                                     |
|--------------|----------------------------------------------------------------|
| `column`     | A column expression.                                           |
| `expression` | An expression evaluated for blanks for each value of `column`. |

## Return value

A table containing a single column and single row with the computed last value.

## Remarks

-   The `column` argument can be any of the following:

    -   A reference to any column.
    -   A table with a single column.
    -   A Boolean expression that defines a single-column table

-   Constraints on Boolean expressions are described in the topic, [CALCULATE function](calculate-function-dax).

-   This function is typically used to return the last value of a column for which the expression is not blank. For example, you could get the last value for which there were sales of a product.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Related content

-   [FIRSTNONBLANK function](firstnonblank-function-dax)
-   [Statistical functions](statistical-functions-dax)

------------------------------------------------------------------------
