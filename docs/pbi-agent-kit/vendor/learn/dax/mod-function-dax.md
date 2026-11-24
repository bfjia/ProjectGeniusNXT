<!-- Source: https://learn.microsoft.com/en-us/dax/mod-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# MOD

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Returns the remainder after a number is divided by a divisor. The result always has the same sign as the divisor.

## Syntax

``` lang-dax
MOD(<number>, )
```

### Parameters

| Term      | Definition                                                                           |
|-----------|--------------------------------------------------------------------------------------|
| `number`  | The number for which you want to find the remainder after the division is performed. |
| `divisor` | The number by which you want to divide.                                              |

## Return value

A whole number.

## Remarks

-   If the divisor is 0 (zero), MOD returns an error. You cannot divide by 0.

-   The MOD function can be expressed in terms of the INT function: MOD(n, d) = n - d\*INT(n/d)

## Example 1

The following formula returns 1, the remainder of 3 divided by 2.

``` lang-dax
= MOD(3,2)
```

## Example 2

The following formula returns -1, the remainder of 3 divided by 2. Note that the sign is always the same as the sign of the divisor.

``` lang-dax
= MOD(-3,-2)
```

## Related content

-   [Math and Trig functions](math-and-trig-functions-dax)
-   [ROUND function](round-function-dax)
-   [ROUNDUP function](roundup-function-dax)
-   [ROUNDDOWN function](rounddown-function-dax)
-   [MROUND function](mround-function-dax)
-   [INT function](int-function-dax)

------------------------------------------------------------------------
