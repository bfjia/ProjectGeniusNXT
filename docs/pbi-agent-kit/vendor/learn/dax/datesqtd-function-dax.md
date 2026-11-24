<!-- Source: https://learn.microsoft.com/en-us/dax/datesqtd-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DATESQTD

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/discouraged.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Note

This function is discouraged for use in [visual calculations](/en-us/power-bi/transform-model/desktop-visual-calculations-overview) as it likely returns meaningless results.

For date column input, returns a table that contains a column of the dates for quarter to date, in the current context.  
For calendar input, returns a table for quarter to date, in the current context. The table contains all primary tagged columns and all time related columns.

## Syntax

    DATESQTD(<dates> or <calendar>)

### Parameters

| Term                | Definition                                            |
|---------------------|-------------------------------------------------------|
| `dates or calendar` | A column that contains dates or a calendar reference. |

## Return value

For date column input, a table containing a single column of date values. For calendar input, a table that contains all primary tagged columns and all time related columns.

## Remarks

The `dates` argument can be any of the following:

-   A reference to a date/time column.

-   A table expression that returns a single column of date/time values.

-   A Boolean expression that defines a single-column table of date/time values.

    Note

    Constraints on Boolean expressions are described in the topic, [CALCULATE function](calculate-function-dax).

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following sample formula creates a measure that calculates the 'Quarterly Running Total' of Internet Sales.

``` lang-dax
= CALCULATE (
    SUM ( InternetSales_USD[SalesAmount_USD] ),
    DATESQTD ( DateTime[DateKey] )
)
```

## Example for calendar based time intelligence

The following sample formula creates a measure that calculates the 'Quarterly Running Total' for Internet sales uing fiscal calendar.

``` lang-dax
= CALCULATE (
    SUM ( InternetSales_USD[SalesAmount_USD] ),
    DATESQTD ( FiscalCalendar )
)
```

## Related content

-   [Time intelligence functions](time-intelligence-functions-dax)
-   [Date and time functions](date-and-time-functions-dax)
-   [DATESWTD function](dateswtd-function-dax)
-   [DATESMTD function](datesmtd-function-dax)
-   [DATESYTD function](datesytd-function-dax)

------------------------------------------------------------------------
