<!-- Source: https://learn.microsoft.com/en-us/dax/var-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# VAR

Stores the result of an expression as a named variable, which you can then pass as an argument to other measure expressions. After DAX calculates the values for a variable expression, those values don't change, even if you reference the variable in another expression.

## Syntax

``` lang-dax
VAR <name> = <expression>
```

### Parameters

[TABLE]

## Return value

A named variable containing the result of the expression argument.

## Remarks

-   An expression passed as an argument to VAR can contain another VAR declaration.

-   When you reference a variable:

    -   Measures can't refer to variables defined outside the measure expression, but can refer to functional scope variables defined within the expression.
    -   Variables can refer to measures.
    -   Variables can refer to previously defined variables.
    -   You can't reference columns in table variables by using TableName\[ColumnName\] syntax.

-   For best practices when using VAR, see [Use variables to improve your DAX formulas](best-practices/dax-variables).

-   To learn more about how VAR is used within a DAX Query, see [DAX queries](dax-queries).

## Example

*Examples in this article can be used with the sample Adventure Works DW 2020 Power BI Desktop model. To get the model, see [DAX sample model](https://aka.ms/dax-docs-samples).*

To calculate a percentage of year-over-year growth without using a variable, you could create three separate measures. This first measure calculates Sum of Sales Amount:

``` lang-dax
Sum of Sales Amount =
SUM ( Sales[Sales Amount] )
```

A second measure calculates the sales amount for the previous year:

``` lang-dax
Sales Amount PreviousYear =
CALCULATE ( [Sum of Sales Amount], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
```

You can then create a third measure that combines the other two measures to calculate a growth percentage. Notice that Sum of SalesAmount is used in two places: first to check whether a sale exists, then again to calculate a percentage.

``` lang-dax
Sum of SalesAmount YoY%: =
IF (
    [Sum of Sales Amount] && [Sales Amount PreviousYear],
    DIVIDE (
        ( [Sum of Sales Amount] - [Sales Amount PreviousYear] ),
        [Sales Amount PreviousYear]
    )
)
```

By using a variable, you can create a single measure that calculates the same result:

``` lang-dax
YoY% =
VAR Sales =
    SUM ( Sales[Sales Amount] )
VAR SalesLastYear =
    CALCULATE ( SUM ( Sales[Sales Amount] ), SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN
    IF ( Sales && SalesLastYear, DIVIDE ( Sales - SalesLastYear, SalesLastYear ) )
```

By using a variable, you can get the same outcome in a more readable way. And because the result of the expression is stored in the variable, the measure's performance improves significantly because DAX doesn't recalculate it each time it's used.

## Related content

-   [Use variables to improve your DAX formulas](best-practices/dax-variables)
-   [DAX queries](dax-queries)

------------------------------------------------------------------------
