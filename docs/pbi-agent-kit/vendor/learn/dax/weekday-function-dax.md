<!-- Source: https://learn.microsoft.com/en-us/dax/weekday-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# WEEKDAY

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns a number from 1 to 7 identifying the day of the week of a date. By default the day ranges from 1 (Sunday) to 7 (Saturday).

## Syntax

``` lang-dax
WEEKDAY(<date>, <return_type>)
```

### Parameters

[TABLE]

## Return value

An integer number from 1 to 7.

## Remarks

-   In contrast to Microsoft Excel, which stores dates as serial numbers, DAX works with dates and times in a `datetime` format. If you need to display dates as serial numbers, you can use the formatting options in Excel.

-   You can also type dates in an accepted text representation of a date, but to avoid unexpected results, it is best to convert the text date to a `datetime` format first.

-   When the date argument is a text representation of the date, the function uses the locale and date/time settings of the client computer to understand the text value in order to perform the conversion. If the current date/time settings represent dates in the format of Month/Day/Year, then the string, "1/8/2009", is interpreted as a `datetime` value equivalent to January 8th of 2009. However, if the current date/time settings represent dates in the format of Day/Month/Year, then the same string would be interpreted as a `datetime` value equivalent to August 1st of 2009.

## Example

The following example gets the date from the \[HireDate\] column, adds 1, and displays the weekday corresponding to that date. Because the `return_type` argument has been omitted, the default format is used, in which 1 is Sunday and 7 is Saturday. If the result is 4, the day would be Wednesday.

``` lang-dax
= WEEKDAY([HireDate]+1)
```

## Related content

-   [Date and time functions](date-and-time-functions-dax)
-   [WEEKNUM function](weeknum-function-dax)
-   [YEARFRAC function](yearfrac-function-dax)

------------------------------------------------------------------------
