<!-- Source: https://learn.microsoft.com/en-us/dax/sum-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# SUM

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Adds all the numbers in a column.

## Syntax

``` lang-dax
SUM(<column>)
```

### Parameters

| Term     | Definition                                   |
|----------|----------------------------------------------|
| `column` | The column that contains the numbers to sum. |

## Return value

A decimal number.

## Remarks

If you want to filter the values that you are summing, you can use the SUMX function and specify an expression to sum over.

## Example

The following example adds all the numbers that are contained in the column, Amt, from the table, Sales.

``` lang-dax
= SUM(Sales[Amt])
```

## Related content

-   [SUMX](sumx-function-dax)

------------------------------------------------------------------------
