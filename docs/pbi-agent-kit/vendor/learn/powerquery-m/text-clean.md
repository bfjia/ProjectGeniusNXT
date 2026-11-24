<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/text-clean (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Text.Clean

## Syntax

    Text.Clean(text as nullable text) as nullable text

## About

Returns a text value with all control characters of `text` removed.

## Example

Remove line feeds and other control characters from a text value.

**Usage**

``` lang-powerquery-m
Text.Clean("ABC#(lf)D")
```

**Output**

`"ABCD"`

------------------------------------------------------------------------
