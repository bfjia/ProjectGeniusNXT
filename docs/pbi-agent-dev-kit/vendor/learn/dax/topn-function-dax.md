<!-- Source: https://learn.microsoft.com/en-us/dax/topn-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# TOPN

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the top N rows of the specified table.

## Syntax

``` lang-dax
TOPN(<N_Value>, <Table>, <OrderBy_Expression>, [<Order>[, <OrderBy_Expression>, [<Order>]]…])
```

### Parameters

[TABLE]

## Return value

A table with the top N rows of `Table` or an empty table if `N_Value` is 0 (zero) or less. Rows are not sorted in any particular order.

## Remarks

-   If there is a tie, in `Order_By` values, at the N-th row of the table, then all tied rows are returned. Then, when there are ties at the N-th row the function might return more than n rows.

-   If N_Value is 0 (zero) or less, TOPN returns an empty table.

-   TOPN does not guarantee any sort order for the results.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following measure formula returns the top 10 sold products by sales amount.

``` lang-dax
= SUMX(
        TOPN(
            10, 
            SUMMARIZE(
                    InternetSales, 
                    InternetSales[ProductKey], 
                    "TotalSales", SUM(InternetSales[SalesAmount])
            ),
            [TotalSales], DESC
        ),
        [TotalSales]
)
 
```

------------------------------------------------------------------------
