<!-- Source: https://learn.microsoft.com/en-us/dax/countrows-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# COUNTROWS

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

The COUNTROWS function counts the number of rows in the specified table, or in a table defined by an expression.

## Syntax

``` lang-dax
COUNTROWS([<table>])
```

### Parameters

| Term    | Definition                                                                                                                                                                                      |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `table` | (Optional) The name of the table that contains the rows to be counted, or an expression that returns a table. When not provided, the default value is the home table of the current expression. |

## Return value

A whole number.

## Remarks

-   This function can be used to count the number of rows in a base table, but more often is used to count the number of rows that result from filtering a table, or applying context to a table.

-   When the table argument contains no rows, the function returns BLANK.

-   To learn more about best practices when using COUNT and COUNTROWS, see [Use COUNTROWS instead of COUNT in DAX](best-practices/dax-countrows).

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example 1

The following example shows how to count the number of rows in the table Orders. The expected result is 52761.

``` lang-dax
= COUNTROWS('Orders')
```

## Example 2

The following example demonstrates how to use COUNTROWS with a row context. In this scenario, there are two sets of data that are related by order number. The table Reseller contains one row for each reseller; the table ResellerSales contains multiple rows for each order, each row containing one order for a particular reseller. The tables are connected by a relationship on the column, ResellerKey.

The formula gets the value of ResellerKey and then counts the number of rows in the related table that have the same reseller ID. The result is output in the column, **CalculatedColumn1**.

``` lang-dax
= COUNTROWS(RELATEDTABLE(ResellerSales))
```

The following table shows a portion of the expected results:

| ResellerKey | CalculatedColumn1 |
|-------------|-------------------|
| 1           | 73                |
| 2           | 70                |
| 3           | 394               |

## Related content

-   [COUNT function](count-function-dax)
-   [COUNTA function](counta-function-dax)
-   [COUNTAX function](countax-function-dax)
-   [COUNTX function](countx-function-dax)
-   [Statistical functions](statistical-functions-dax)

------------------------------------------------------------------------
