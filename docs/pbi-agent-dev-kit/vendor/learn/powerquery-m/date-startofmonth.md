<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/date-startofmonth (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Date.StartOfMonth

## Syntax

    Date.StartOfMonth(dateTime as any) as any

## About

Returns the start of the month that contains `dateTime`. `dateTime` must be a `date` or `datetime` value.

## Example

Find the start of the month for October 10th, 2011, 8:10:32AM.

**Usage**

``` lang-powerquery-m
Date.StartOfMonth(#datetime(2011, 10, 10, 8, 10, 32))
```

**Output**

`#datetime(2011, 10, 1, 0, 0, 0)`

------------------------------------------------------------------------
