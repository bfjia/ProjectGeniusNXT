<!-- Source: https://learn.microsoft.com/en-us/dax/year-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# YEAR

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the year of a date as a four digit integer in the range 1900-9999.

## Syntax

``` lang-dax
YEAR(<date>)
```

### Parameters

| Term   | Definition                                                                 |
|--------|----------------------------------------------------------------------------|
| `date` | A date in `datetime` or text format, containing the year you want to find. |

## Return value

An integer in the range 1900-9999.

## Remarks

-   In contrast to Microsoft Excel, which stores dates as serial numbers, DAX uses a `datetime` data type to work with dates and times.

-   Dates should be entered by using the DATE function, or as results of other formulas or functions. You can also enter dates in accepted text representations of a date, such as March 3, 2007, or Mar-3-2003.

-   Values returned by the YEAR, MONTH, and DAY functions will be Gregorian values regardless of the display format for the supplied date value. For example, if the display format of the supplied date uses the Hijri calendar, the returned values for the YEAR, MONTH, and DAY functions will be values associated with the equivalent Gregorian date.

-   When the date argument is a text representation of the date, the function uses the locale and date time settings of the client computer to understand the text value in order to perform the conversion. Errors may arise if the format of strings is incompatible with the current locale settings. For example, if your locale defines dates to be formatted as month/day/year, and the date is provided as day/month/year, then 25/1/2009 will not be interpreted as January 25th of 2009 but as an invalid date.

## Example

The following example returns 2007.

``` lang-dax
= YEAR("March 2007")
```

## Example - Date as result of expression

### Description

The following example returns the year for today's date.

``` lang-dax
= YEAR(TODAY())
```

## Related content

-   [Date and time functions](date-and-time-functions-dax)
-   [HOUR function](hour-function-dax)
-   [MINUTE function](minute-function-dax)
-   [YEAR function](year-function-dax)
-   [SECOND function](second-function-dax)

------------------------------------------------------------------------
