<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/number-fromtext (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Number.FromText

## Syntax

    Number.FromText(text as nullable text, optional culture as nullable text) as nullable number

## About

Returns a `number` value from the given text value, `text`.

-   `text`: The textual representation of a number value. The representation must be in a common number format, such as "15", "3,423.10", or "5.0E-10".
-   `culture`: An optional culture that controls how `text` is interpreted (for example, "en-US").

## Example 1

Get the number value of `"4"`.

**Usage**

``` lang-powerquery-m
Number.FromText("4")
```

**Output**

`4`

## Example 2

Get the number value of `"5.0e-10"`.

**Usage**

``` lang-powerquery-m
Number.FromText("5.0e-10")
```

**Output**

`5E-10`

## Related content

-   [How culture affects text formatting](how-culture-affects-text-formatting)
-   [Standard numeric format strings](standard-numeric-format-strings)
-   [Custom numeric format strings](custom-numeric-format-strings)

------------------------------------------------------------------------
