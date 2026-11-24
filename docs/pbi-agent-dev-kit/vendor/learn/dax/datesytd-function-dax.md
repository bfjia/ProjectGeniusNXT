<!-- Source: https://learn.microsoft.com/en-us/dax/datesytd-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DATESYTD

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/discouraged.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Note

This function is discouraged for use in [visual calculations](/en-us/power-bi/transform-model/desktop-visual-calculations-overview) as it likely returns meaningless results.

For date column input, returns a table that contains a column of the dates for year to date, in the current context.  
For calendar input, returns a table for year to date, in the current context. The table contains all primary tagged columns and all time related columns.

## Syntax

    DATESYTD(<dates> or <calendar> [,<year_end_date>])

### Parameters

| Term                | Definition                                                                                                                                                                |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dates or calendar` | A column that contains dates or a calendar reference.                                                                                                                     |
| `year_end_date`     | (optional) A literal string with a date that defines the year-end date. The default is December 31. This parameter is permitted only when the date column syntax is used. |

## Return value

For date column input, a table containing a single column of date values.  
For calendar input, a table that contains all primary tagged columns and all time related columns.

## Remarks

The `dates` argument can be any of the following:

-   A reference to a date/time column,

-   A table expression that returns a single column of date/time values,

-   A Boolean expression that defines a single-column table of date/time values.

    Note

    Constraints on Boolean expressions are described in the topic, [CALCULATE function](calculate-function-dax).

-   The `year_end_date` parameter is a string literal of a date, in the same locale as the locale of the client where the workbook was created. The year portion of the date is ignored. Depending on locale, the format might be something like "m-dd" or "dd-m".

-   The `year_end_date` parameter is permitted only when the date column syntax is used.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following sample formula creates a measure that calculates the 'Running Total' for Internet sales.

``` lang-dax
= CALCULATE (
    SUM ( InternetSales_USD[SalesAmount_USD] ),
    DATESYTD ( DateTime[DateKey] )
)
```

The following sample formula creates a measure that calculates the 'Fiscal Year Running Total' for Internet sales, using a US Locale for the Date format.

``` lang-dax
= CALCULATE(
    SUM(InternetSales_USD[SalesAmount_USD]), 
    DATESYTD(DateTime[DateKey],
        "6-30"
        )
)
```

## Example for calendar based time intelligence

The following sample formula creates a measure that calculates the 'Running Total' for Internet sales uing fiscal calendar.

``` lang-dax
= CALCULATE (
    SUM ( InternetSales_USD[SalesAmount_USD] ),
    DATESYTD ( FiscalCalendar )
)
```

## Related content

-   [Time intelligence functions](time-intelligence-functions-dax)
-   [Date and time functions](date-and-time-functions-dax)
-   [DATESWTD function](dateswtd-function-dax)
-   [DATESMTD function](datesmtd-function-dax)
-   [DATESQTD function](datesqtd-function-dax)

------------------------------------------------------------------------
