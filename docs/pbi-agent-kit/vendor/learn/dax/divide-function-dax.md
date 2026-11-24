<!-- Source: https://learn.microsoft.com/en-us/dax/divide-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# DIVIDE

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Performs division and returns alternate result or BLANK() on division by 0.

## Syntax

``` lang-dax
DIVIDE(<numerator>, <denominator> [,<alternateresult>])
```

### Parameters

| Term              | Definition                                                                                                                |
|-------------------|---------------------------------------------------------------------------------------------------------------------------|
| `numerator`       | The dividend or number to divide.                                                                                         |
| `denominator`     | The divisor or number to divide by.                                                                                       |
| `alternateresult` | (Optional) The value returned when division by zero results in an error. When not provided, the default value is BLANK(). |

## Return value

-   A decimal number.

## Remarks

-   Alternate result on divide by 0 must be a constant.

-   For best practices when using DIVIDE, see [DIVIDE function vs. divide operator (/) in DAX](best-practices/dax-divide-function-operator).

## Example

The following example returns 2.5.

``` lang-dax
= DIVIDE(5,2)
```

## Example 1

The following example returns BLANK.

``` lang-dax
= DIVIDE(5,0)
```

## Example 2

The following example returns 1.

``` lang-dax
= DIVIDE(5,0,1)
```

## Related content

-   [QUOTIENT function](quotient-function-dax)
-   [Math and Trig functions](math-and-trig-functions-dax)

------------------------------------------------------------------------
