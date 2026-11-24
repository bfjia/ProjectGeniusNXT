<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/text-endswith (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Text.EndsWith

## Syntax

    Text.EndsWith(
        text as nullable text,
        substring as text,
        optional comparer as nullable function
    ) as nullable logical

## About

Indicates whether the given text, `text`, ends with the specified value, `substring`. The indication is case sensitive.

`comparer` is a `Comparer` which is used to control the comparison. Comparers can be used to provide case-insensitive or culture and locale-aware comparisons.

The following built-in comparers are available in the formula language:

-   [`Comparer.Ordinal`](comparer-ordinal): Used to perform an exact ordinal comparison
-   [`Comparer.OrdinalIgnoreCase`](comparer-ordinalignorecase): Used to perform an exact ordinal case-insensitive comparison
-   [`Comparer.FromCulture`](comparer-fromculture): Used to perform a culture-aware comparison

## Example 1

Check if "Hello, World" ends with "world".

**Usage**

``` lang-powerquery-m
Text.EndsWith("Hello, World", "world")
```

**Output**

`false`

## Example 2

Check if "Hello, World" ends with "World".

**Usage**

``` lang-powerquery-m
Text.EndsWith("Hello, World", "World")
```

**Output**

`true`

## Related content

-   [How culture affects text formatting](how-culture-affects-text-formatting)

------------------------------------------------------------------------
