<!-- Source: https://learn.microsoft.com/en-us/dax/rankx-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# RANKX

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the ranking of a number in a list of numbers for each row in the `table` argument.

## Syntax

``` lang-dax
RANKX(<table>, <expression>[, <value>[, <order>[, <ties>]]])
```

### Parameters

`table` Any DAX expression that returns a table of data over which the expression is evaluated.

`expression` Any DAX expression that returns a single scalar value. The expression is evaluated for each row of `table`, to generate all possible values for ranking. See the remarks section to understand the function behavior when `expression` evaluates to BLANK.

`value` (Optional) Any DAX expression that returns a single scalar value whose rank is to be found. See the remarks section to understand the function's behavior when `value` is not found in the expression.

When the `value` parameter is omitted, the value of expression at the current row is used instead.

`order` (Optional) A value that specifies how to rank `value`, low to high or high to low:

[TABLE]

`ties` (Optional) An enumeration that defines how to determine ranking when there are ties.

[TABLE]

## Return value

The rank number of `value` among all possible values of `expression` evaluated for all rows of `table` numbers.

## Remarks

-   If `expression` or `value` evaluates to BLANK it is treated as a 0 (zero) for all expressions that result in a number, or as an empty text for all text expressions.

-   If `value` is not among all possible values of `expression` then RANKX temporarily adds `value` to the values from `expression` and re-evaluates RANKX to determine the proper rank of `value`.

-   Optional arguments might be skipped by placing an empty comma (,) in the argument list, such as `RANKX(Inventory, [InventoryCost],,,"Dense")`.

-   Equality related comparisons (`=`, `<`, `>`, `>=` and `<=`) between values with the *Decimal Number* data type can potentially return unexpected results when using RANKX function. Incorrect results can occur because values with *Decimal Number* data type are stored as IEEE Standard 754 floating point numbers and have inherent limitations in their precision. To avoid unexpected results, change the data type to *Fixed Decimal Number* or do a forced rounding using [ROUND](/en-us/dax/round-function-dax).

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following calculated column in the Products table calculates the sales ranking for each product in the Internet channel.

``` lang-dax
= RANKX(ALL(Products), SUMX(RELATEDTABLE(InternetSales), [SalesAmount]))
```

------------------------------------------------------------------------
