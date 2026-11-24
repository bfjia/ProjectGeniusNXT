<!-- Source: https://learn.microsoft.com/en-us/dax/coalesce-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# COALESCE

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the first expression that does not evaluate to BLANK. If all expressions evaluate to BLANK, BLANK is returned.

## Syntax

``` lang-dax
COALESCE(<expression>, <expression>[, <expression>]…)
```

### Parameters

| Term         | Definition                                           |
|--------------|------------------------------------------------------|
| `expression` | Any DAX expression that returns a scalar expression. |

## Return value

A scalar value coming from one of the expressions or BLANK if all expressions evaluate to BLANK.

## Remarks

Input expressions may be of different data types.

## Example 1

The following DAX query:

``` lang-dax
EVALUATE { COALESCE(BLANK(), 10, DATE(2008, 3, 3)) }
```

Returns `10`, which is the first expression that does not evaluate to BLANK.

## Example 2

The following DAX expression:

``` lang-dax
= COALESCE(SUM(FactInternetSales[SalesAmount]), 0)
```

Returns the sum of all values in the SalesAmount column in the FactInternetSales table, or `0`. This can be used to convert BLANK values of total sales to `0`.

------------------------------------------------------------------------
