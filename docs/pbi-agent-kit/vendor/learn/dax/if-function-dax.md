<!-- Source: https://learn.microsoft.com/en-us/dax/if-function-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# IF

**Applies to:** ![](media/icons/yes.png) [Calculated column](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-column-dax) ![](media/icons/yes.png) [Calculated table](/en-us/power-bi/transform-model/desktop-calculations-options#calculated-table) ![](media/icons/yes.png) [Measure](/en-us/power-bi/transform-model/desktop-calculations-options#measures) ![](media/icons/yes.png) [Visual calculation](/en-us/power-bi/transform-model/desktop-calculations-options#visual-calculation)

Checks a condition, and returns one value when it's `TRUE`, otherwise it returns a second value.

## Syntax

``` lang-dax
IF(<logical_test>, <value_if_true>[, <value_if_false>])
```

### Parameters

| Term             | Definition                                                                                          |
|------------------|-----------------------------------------------------------------------------------------------------|
| `logical_test`   | Any value or expression that can be evaluated to `TRUE` or `FALSE`.                                 |
| `value_if_true`  | The value that's returned if the logical test is `TRUE`.                                            |
| `value_if_false` | (Optional) The value that's returned if the logical test is `FALSE`. If omitted, BLANK is returned. |

## Return value

Either `value_if_true`, `value_if_false`, or `BLANK`.

## Remarks

-   The IF function can return a variant data type if `value_if_true` and `value_if_false` are of different data types, but the function attempts to return a single data type if both `value_if_true` and `value_if_false` are of numeric data types. In the latter case, the IF function implicitly converts data types to accommodate both values.

    For example, the formula `IF(<condition>, TRUE(), 0)` returns `TRUE` or 0, but the formula `IF(<condition>, 1.0, 0)` returns only decimal values even though `value_if_false` is of the whole number data type. To learn more about implicit data type conversion, see [Data types](dax-overview#data-types).

-   To execute the branch expressions regardless of the condition expression, use [IF.EAGER](if-eager-function-dax) instead.

## Examples

The following **Product** table calculated column definitions use the IF function in different ways to classify each product based on its list price.

The first example tests whether the **List Price** column value is less than 500. When this condition is true, the function returns **Low**. Because there's no `value_if_false` value, the function returns BLANK.

*Examples in this article can be used with the sample Adventure Works DW 2020 Power BI Desktop model. To get the model, see [DAX sample model](https://aka.ms/dax-docs-samples).*

``` lang-dax
Price Group =
IF ( 'Product'[List Price] < 500, "Low" )
```

The second example uses the same test, but this time includes a `value_if_false` value. So, the formula classifies each product as either `Low` or `High`.

``` lang-dax
Price Group =
IF ( 'Product'[List Price] < 500, "Low", "High" )
```

The third example uses the same test, but this time nests an IF function to perform an additional test. So, the formula classifies each product as either `Low`, `Medium`, or `High`.

``` lang-dax
Price Group =
IF (
    'Product'[List Price] < 500,
    "Low",
    IF ( 'Product'[List Price] < 1500, "Medium", "High" )
)
```

Tip

When you need to nest multiple IF functions, the [SWITCH](switch-function-dax) function might be a better option. This function provides a more elegant way to write an expression that returns more than two possible values.

## Related content

-   [IF.EAGER function](if-eager-function-dax)
-   [SWITCH function (DAX)](switch-function-dax)
-   [Logical functions](logical-functions-dax)

------------------------------------------------------------------------
