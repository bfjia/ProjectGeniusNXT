<!-- Source: https://learn.microsoft.com/en-us/dax/quarter-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# QUARTER

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the quarter as a number from 1 (January – March) to 4 (October – December).

## Syntax

``` lang-dax
QUARTER(<date>)
```

### Parameters

| Term   | Definition |
|--------|------------|
| `date` | A date.    |

## Return value

An integer number from 1 to 4.

## Remarks

-   If the input value is BLANK, the output value is also BLANK.

-   This function isn't available in Power Pivot in Excel.

## Example 1

The following DAX query:

``` lang-dax
EVALUATE { QUARTER(DATE(2019, 2, 1)), QUARTER(DATE(2018, 12, 31)) } 
```

Returns:

| \[Value\] |
|-----------|
| 1         |
| 4         |

## Example 2

The following DAX query:

``` lang-dax
EVALUATE
ADDCOLUMNS(
    FILTER(
        VALUES(
            FactInternetSales[OrderDate]), 
            [OrderDate] >= DATE(2008, 3, 31) && [OrderDate] <= DATE(2008, 4, 1)
        ), 
    "Quarter", QUARTER([OrderDate])
)
```

Returns:

| FactInternetSales\[OrderDate\] | \[Quarter\] |
|--------------------------------|-------------|
| 3/31/2008                      | 1           |
| 4/1/2008                       | 2           |

## Related content

-   [YEAR](year-function-dax)
-   [MONTH](month-function-dax)
-   [DAY](day-function-dax)

------------------------------------------------------------------------
