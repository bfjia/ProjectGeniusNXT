<!-- Source: https://learn.microsoft.com/en-us/dax/max-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# MAX

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the largest value in a column, or between two scalar expressions.

## Syntax

``` lang-dax
MAX(<column>)
```

``` lang-dax
MAX(<expression1>, <expression2>)
```

### Parameters

| Term         | Definition                                              |
|--------------|---------------------------------------------------------|
| `column`     | The column in which you want to find the largest value. |
| `expression` | Any DAX expression which returns a single value.        |

## Return value

The largest value.

## Remarks

-   When comparing two expressions, blank is treated as 0 when comparing. That is, Max(1, Blank() ) returns 1, and Max( -1, Blank() ) returns 0. If both arguments are blank, MAX returns a blank. If either expression returns a value which is not allowed, MAX returns an error.

-   `TRUE`/`FALSE` values are not supported. If you want to evaluate a column of `TRUE`/`FALSE` values, use the MAXA function.

## Example 1

The following example returns the largest value found in the ExtendedAmount column of the InternetSales table.

``` lang-dax
= MAX(InternetSales[ExtendedAmount])
```

## Example 2

The following example returns the largest value between the result of two expressions.

``` lang-dax
= Max([TotalSales], [TotalPurchases])
```

## Related content

-   [MAXA function](maxa-function-dax)
-   [MAXX function](maxx-function-dax)
-   [Statistical functions](statistical-functions-dax)

------------------------------------------------------------------------
