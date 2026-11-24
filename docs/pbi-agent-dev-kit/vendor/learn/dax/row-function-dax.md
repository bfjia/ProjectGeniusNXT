<!-- Source: https://learn.microsoft.com/en-us/dax/row-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# ROW function

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns a table with a single row containing values that result from the expressions given to each column.

## Syntax

``` lang-dax
ROW(<name>, <expression>[[,<name>, <expression>]…])
```

### Parameters

| Term         | Definition                                                                 |
|--------------|----------------------------------------------------------------------------|
| `name`       | The name given to the column, enclosed in double quotes.                   |
| `expression` | Any DAX expression that returns a single scalar value to populate. `name`. |

## Return value

A single row table

## Remarks

-   Arguments must always come in pairs of `name` and `expression`.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following example returns a single row table with the total sales for internet and resellers channels.

``` lang-dax
ROW("Internet Total Sales (USD)", SUM(InternetSales_USD[SalesAmount_USD]),
         "Resellers Total Sales (USD)", SUM(ResellerSales_USD[SalesAmount_USD]))
```

------------------------------------------------------------------------
