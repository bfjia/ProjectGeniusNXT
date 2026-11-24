<!-- Source: https://learn.microsoft.com/en-us/dax/previousmonth-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# PREVIOUSMONTH

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/discouraged.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Note

This function is discouraged for use in [visual calculations](/en-us/power-bi/transform-model/desktop-visual-calculations-overview) as it likely returns meaningless results.

For date column input, returns a table that contains a column of all dates from the previous month, based on the first date in the `<Dates>` column, in the current context.

For calendar input, returns a table of all dates from the previous month, based on the first date in the current context. The table contains all primary tagged columns and all time related columns.

## Syntax

    PREVIOUSMONTH(<dates> or <calendar>)

### Parameters

| Term                | Definition                                           |
|---------------------|------------------------------------------------------|
| `dates or calendar` | A column that contains dates or a calendar reference |

## Return value

For date column input, a table containing a single column of date values.  
For calendar input, a table that contains all primary tagged columns and all time related columns.

## Remarks

-   This function returns all dates from the previous month, using the first date in the column used as input. For example, if the first date in the `Dates` argument refers to June 10, 2009, this function returns all dates for the month of May, 2009.

-   The `Dates` argument can be any of the following:

    -   A reference to a date/time column.
    -   A table expression that returns a single column of date/time values.
    -   A Boolean expression that defines a single-column table of date/time values.

-   Constraints on Boolean expressions are described in the topic, [CALCULATE](calculate-function-dax).

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following sample formula creates a measure that calculates the 'previous month sales' for sales.

``` lang-dax
= CALCULATE ( SUM ( 'Sales'[Sales Amount] ), PREVIOUSMONTH ( 'Date'[Date] ) )
```

## Example for calendar

The following sample formula creates a measure that calculates the 'previous month sales' for Internet sales in terms of fiscal calendar.

``` lang-dax
= CALCULATE (
    SUM ( InternetSales_USD[SalesAmount_USD] ),
    PREVIOUSMONTH ( FiscalCalendar )
)
```

## Related content

-   [Time intelligence functions](time-intelligence-functions-dax)
-   [Date and time functions](date-and-time-functions-dax)
-   [PREVIOUSDAY](previousday-function-dax)
-   [PREVIOUSWEEK](previousweek-function-dax)
-   [PREVIOUSQUARTER](previousquarter-function-dax)
-   [PREVIOUSYEAR](previousyear-function-dax)

------------------------------------------------------------------------
