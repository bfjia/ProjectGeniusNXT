<!-- Source: https://learn.microsoft.com/en-us/dax/today-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# TODAY

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the current date.

## Syntax

``` lang-dax
TODAY()
```

## Return value

A date (`datetime`).

## Remarks

-   The TODAY function is useful when you need to have the current date displayed in a report, regardless of when you open it. It is also useful for calculating intervals.

-   If the TODAY function does not update the date when you expect it to, you might need to change the settings that control when the report or semantic model is refreshed.

-   The NOW function is similar but returns the exact time, whereas TODAY returns the time value 12:00:00 AM (midnight) for all dates.

## Example

If you know that someone was born in 1963, you might use the following formula to find that person's age as of this year's birthday:

``` lang-dax
= YEAR(TODAY())-1963
```

This formula uses the TODAY function as an argument for the YEAR function to obtain the current year, and then subtracts 1963, returning the person's age.

## Related content

-   [Date and time functions](date-and-time-functions-dax)
-   [NOW](now-function-dax)

------------------------------------------------------------------------
