<!-- Source: https://learn.microsoft.com/en-us/dax/int-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# INT

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Rounds a number down to the nearest integer.

## Syntax

``` lang-dax
INT(<number>)
```

### Parameters

| Term     | Definition                                      |
|----------|-------------------------------------------------|
| `number` | The number you want to round down to an integer |

## Return value

A whole number.

## Remarks

TRUNC and INT are similar in that both return integers. TRUNC removes the fractional part of the number. INT rounds numbers down to the nearest integer based on the value of the fractional part of the number. INT and TRUNC are different only when using negative numbers: `TRUNC(-4.3)` returns -4, but `INT(-4.3)` returns -5 because -5 is the lower number.

## Example

The following expression rounds the value to 1. If you use the ROUND function, the result would be 2.

``` lang-dax
= INT(1.5)
```

## Related content

-   [Math and Trig functions](math-and-trig-functions-dax)
-   [ROUND function](round-function-dax)
-   [ROUNDUP function](roundup-function-dax)
-   [ROUNDDOWN function](rounddown-function-dax)
-   [MROUND function](mround-function-dax)

------------------------------------------------------------------------
