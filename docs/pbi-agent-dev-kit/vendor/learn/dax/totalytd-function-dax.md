<!-- Source: https://learn.microsoft.com/en-us/dax/totalytd-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# TOTALYTD

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/discouraged.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Note

This function is discouraged for use in [visual calculations](/en-us/power-bi/transform-model/desktop-visual-calculations-overview) as it likely returns meaningless results.

Evaluates the year-to-date value of the `expression` in the current context.

## Syntax

    TOTALYTD(<expression>,<dates> or <calendar>[,<filter>][,<year_end_date>])

### Parameters

| Parameter           | Definition                                                                                          |
|---------------------|-----------------------------------------------------------------------------------------------------|
| `expression`        | An expression that returns a scalar value.                                                          |
| `dates or calendar` | A column that contains dates or a calendar reference                                                |
| `filter`            | (optional) An expression that specifies a filter to apply to the current context.                   |
| `year_end_date`     | (optional) A literal string with a date that defines the year-end date. The default is December 31. |

## Return value

A scalar value that represents the `expression` evaluated for the current year-to-date `dates` or `calendar`.

## Remarks

-   The `dates` argument can be any of the following:

    -   A reference to a date/time column.
    -   A table expression that returns a single column of date/time values.
    -   A Boolean expression that defines a single-column table of date/time values.

-   Constraints on Boolean expressions are described in the topic, [CALCULATE](calculate-function-dax).

-   The `filter` expression has restrictions described in the topic, [CALCULATE](calculate-function-dax).

-   The `year_end_date` parameter is a string literal of a date, in the same locale as the locale of the client where the workbook was created. The year portion of the date is not required and is ignored. For example, the following formula specifies a (fiscal) year_end_date of 6/30 in an EN-US locale workbook.

    ``` lang-dax
    = TOTALYTD(SUM(InternetSales_USD[SalesAmount_USD]),DateTime[DateKey], ALL('DateTime'), "6/30")
    ```

    In this example, year_end_date can be specified as "6/30", "Jun 30", "30 June", or any string that resolves to a month/day. However, it is recommended you specify year_end_date using "month/day" (as shown) to ensure the string resolves to a date.

-   The `year_end_date` parameter must not be specified when a calendar is used.

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Example

The following sample formula creates a measure that calculates the 'year running total' or 'year running sum' for Internet sales.

``` lang-dax
= TOTALYTD(SUM(InternetSales_USD[SalesAmount_USD]),DateTime[DateKey])
```

## Example for calendar based time intelligence

The following sample formula creates a measure that calculates the 'year running total' or 'year running sum' for Internet sales in terms of fiscal calendar.

``` lang-dax
= TOTALYTD(SUM(InternetSales_USD[SalesAmount_USD]), FiscalCalendar)
```

## Related content

-   [ALL](all-function-dax)
-   [CALCULATE](calculate-function-dax)
-   [DATESYTD](datesytd-function-dax)
-   [TOTALMTD](totalmtd-function-dax)
-   [TOTALQTD](totalqtd-function-dax)
-   [TOTALWTD](totalwtd-function-dax)

------------------------------------------------------------------------
