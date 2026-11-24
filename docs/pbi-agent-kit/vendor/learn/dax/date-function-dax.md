<!-- Source: https://learn.microsoft.com/en-us/dax/date-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DATE

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the specified date in `datetime` format.

## Syntax

``` lang-dax
DATE(<year>, <month>, <day>)
```

### Parameters

[TABLE]

## Return value

Returns the specified date (`datetime`).

## Remarks

-   The DATE function takes the integers that are input as arguments, and generates the corresponding date. The DATE function is most useful in situations where the year, month, and day are supplied by formulas. For example, the underlying data might contain dates in a format that is not recognized as a date, such as YYYYMMDD. You can use the DATE function in conjunction with other functions to convert the dates to a number that can be recognized as a date.

-   In contrast to Microsoft Excel, which stores dates as a serial number, DAX date functions always return a `datetime` data type. However, you can use formatting to display dates as serial numbers if you want.

-   Date and datetime can also be specified as a literal in the format `dt"YYYY-MM-DD"`, `dt"YYYY-MM-DDThh:mm:ss"`, or `dt"YYYY-MM-DD hh:mm:ss"`. When specified as a literal, using the DATE function in the expression is not necessary. To learn more, see [DAX Syntax \| Date and time](dax-syntax-reference#date-and-time).

-   This function is not supported for use in DirectQuery mode when used in calculated columns or row-level security (RLS) rules.

## Examples

### Simple Date

The following formula returns the date July 8, 2009:

``` lang-dax
= DATE(2009,7,8)
```

### Years before 100

If the value that you enter for the `year` argument is between 0 (zero) and 49 (inclusive), that value is added to 2000 to calculate the year.

The following formula returns January 2, 2008: (2000+08).

``` lang-dax
= DATE(08,1,2)
```

If the value that you enter for the `year` argument is between 50 and 99 (inclusive), that value is added to 1900 to calculate the year.

The following formula returns January 2, 1950: (1900+50).

``` lang-dax
= DATE(50,1,2)
```

### Years after 100

If `year` is between 100 and 9999 (inclusive), that value is used as the year. The following formula returns January 2, 2008:

``` lang-dax
= DATE(2008,1,2)
```

### Months

If `month` is greater than 12, `month` adds that number of months to the first month in the year specified. The following formula returns the date February 2, 2009:

``` lang-dax
= DATE(2008,14,2)
```

### Days

If `day` is greater than the number of days in the month specified, `day` adds that number of days to the first day in the month. The following formula returns the date February 4, 2008:

``` lang-dax
= DATE(2008,1,35)
```

## Related content

-   [Date and time functions](date-and-time-functions-dax)
-   [DAY function](day-function-dax)
-   [TODAY function](today-function-dax)

------------------------------------------------------------------------
