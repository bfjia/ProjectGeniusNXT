<!-- Source: https://learn.microsoft.com/en-us/dax/medianx-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# MEDIANX

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the median number of an expression evaluated for each row in a table.

To return the median of numbers in a column, use [MEDIAN function](median-function-dax).

## Syntax

``` lang-dax
MEDIANX(<table>, <expression>)
```

### Parameters

| Term         | Definition                                                                |
|--------------|---------------------------------------------------------------------------|
| `table`      | The table containing the rows for which the expression will be evaluated. |
| `expression` | The expression to be evaluated for each row of the table.                 |

## Return value

A decimal number.

## Remarks

-   The MEDIANX function takes as its first argument a table, or an expression that returns a table. The second argument is a column that contains the numbers for which you want to compute the median, or an expression that evaluates to a column.

-   Only the numbers in the column are counted.

-   Logical values and text are ignored.

-   MEDIANX does not ignore blanks; however, MEDIAN does ignore blanks

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following computes the median age of customers who live in the USA.

``` lang-dax
= MEDIANX( FILTER(Customers, RELATED( Geography[Country]="USA" ) ), Customers[Age] )
```

## Related content

-   [MEDIAN function](median-function-dax)

------------------------------------------------------------------------
