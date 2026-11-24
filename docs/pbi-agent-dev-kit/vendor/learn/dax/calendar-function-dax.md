<!-- Source: https://learn.microsoft.com/en-us/dax/calendar-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# CALENDAR

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns a table with a single column named "Date" that contains a contiguous set of dates. The range of dates is from the specified start date to the specified end date, inclusive of those two dates.

## Syntax

``` lang-dax
CALENDAR(<start_date>, <end_date>)
```

### Parameters

| Term         | Definition                                        |
|--------------|---------------------------------------------------|
| `start_date` | Any DAX expression that returns a datetime value. |
| `end_date`   | Any DAX expression that returns a datetime value. |

## Return value

Returns a table with a single column named "Date" containing a contiguous set of dates. The range of dates is from the specified start date to the specified end date, inclusive of those two dates.

## Remarks

-   An error is returned if start_date is greater than end_date.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Examples

The following formula returns a table with dates between January 1st, 2015 and December 31st, 2021.

``` lang-dax
= CALENDAR (DATE (2015, 1, 1), DATE (2021, 12, 31))
```

For a data model which includes actual sales data and future sales forecasts, the following expression returns a date table covering the range of dates in both the Sales and Forecast tables.

``` lang-dax
= CALENDAR (MINX (Sales, [Date]), MAXX (Forecast, [Date]))
```

------------------------------------------------------------------------
