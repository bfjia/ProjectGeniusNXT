<!-- Source: https://learn.microsoft.com/en-us/dax/distinctcountnoblank-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DISTINCTCOUNTNOBLANK

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Counts the number of distinct values in a column.

## Syntax

``` lang-dax
DISTINCTCOUNTNOBLANK(<column>)
```

### Parameters

| Term     | Description                                       |
|----------|---------------------------------------------------|
| `column` | The column that contains the values to be counted |

## Return value

The number of distinct values in `column`.

## Remarks

-   Unlike [DISTINCTCOUNT](distinctcount-function-dax) function, DISTINCTCOUNTNOBLANK does not count the BLANK value.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following example shows how to count the number of distinct sales orders in the column ResellerSales_USD\[SalesOrderNumber\].

``` lang-dax
= DISTINCTCOUNT(ResellerSales_USD[SalesOrderNumber])
```

DAX query

``` lang-DAX
EVALUATE
    ROW(
        "DistinctCountNoBlank", DISTINCTCOUNTNOBLANK(DimProduct[EndDate]),
        "DistinctCount", DISTINCTCOUNT(DimProduct[EndDate])
    )
```

| \[DistinctCountNoBlank\] | \[DistinctCount\] |
|--------------------------|-------------------|
| 2                        | 3                 |

## Related content

-   [DISTINCTCOUNT](distinctcount-function-dax)

------------------------------------------------------------------------
