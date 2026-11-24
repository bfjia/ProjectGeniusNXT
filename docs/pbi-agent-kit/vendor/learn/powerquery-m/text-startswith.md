<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/text-startswith (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Text.StartsWith

## Syntax

    Text.StartsWith(
        text as nullable text,
        substring as text,
        optional comparer as nullable function
    ) as nullable logical

## About

Returns true if text value `text` starts with text value `substring`.

-   `text`: A `text` value which is to be searched.
-   `substring`: A `text` value which is the substring to be searched for in `text`.
-   `comparer`: *(Optional)* A `Comparer` used for controlling the comparison. For example, [`Comparer.OrdinalIgnoreCase`](comparer-ordinalignorecase) may be used to perform case-insensitive searches.

`comparer` is a `Comparer` which is used to control the comparison. Comparers can be used to provide case-insensitive or culture and locale-aware comparisons.

The following built-in comparers are available in the formula language:

-   [`Comparer.Ordinal`](comparer-ordinal): Used to perform an exact ordinal comparison.
-   [`Comparer.OrdinalIgnoreCase`](comparer-ordinalignorecase): Used to perform an exact ordinal case-insensitive comparison.
-   [`Comparer.FromCulture`](comparer-fromculture): Used to perform a culture-aware comparison.

## Example 1

Check if the text "Hello, World" starts with the text "hello".

**Usage**

``` lang-powerquery-m
Text.StartsWith("Hello, World", "hello")
```

**Output**

`false`

## Example 2

Check if the text "Hello, World" starts with the text "Hello".

**Usage**

``` lang-powerquery-m
Text.StartsWith("Hello, World", "Hello")
```

**Output**

`true`

## Example 3

Ignoring case, check if the text "Hello, World" starts with the text "hello".

**Usage**

``` lang-powerquery-m
Text.StartsWith("Hello, World", "hello", Comparer.OrdinalIgnoreCase)
```

**Output**

`true`

## Related content

-   [How culture affects text formatting](how-culture-affects-text-formatting)

------------------------------------------------------------------------
