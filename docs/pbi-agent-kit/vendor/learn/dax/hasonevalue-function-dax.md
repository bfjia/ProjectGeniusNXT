<!-- Source: https://learn.microsoft.com/en-us/dax/hasonevalue-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# HASONEVALUE

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns `TRUE` when the context for `columnName` has been filtered down to one distinct value only. Otherwise is `FALSE`.

## Syntax

``` lang-html
HASONEVALUE(<columnName>)
```

### Parameters

| Term         | Definition                                                                             |
|--------------|----------------------------------------------------------------------------------------|
| `columnName` | The name of an existing column, using standard DAX syntax. It cannot be an expression. |

## Return value

`TRUE` when the context for `columnName` has been filtered down to one distinct value only. Otherwise is `FALSE`.

## Remarks

-   An equivalent expression for HASONEVALUE() is `COUNTROWS(VALUES(<columnName>)) = 1`.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following measure formula verifies if the context is being sliced by one value in order to estimate a percentage against a predefined scenario; in this case you want to compare Reseller Sales against sales in 2007, then you need to know if the context is filtered by single years. Also, if the comparison is meaningless you want to return BLANK.

``` lang-dax
= IF(HASONEVALUE(DateTime[CalendarYear]),SUM(ResellerSales_USD[SalesAmount_USD])/CALCULATE(SUM(ResellerSales_USD[SalesAmount_USD]),DateTime[CalendarYear]=2007),BLANK())
```

------------------------------------------------------------------------
