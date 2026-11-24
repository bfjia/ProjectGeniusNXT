<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/replacer-replacevalue (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Replacer.ReplaceValue

## Syntax

    Replacer.ReplaceValue(
        value as any,
        old as any,
        new as any
    ) as any

## About

Replaces the `old` value in the original `value` with the `new` value. This replacer function can be used in [`List.ReplaceValue`](list-replacevalue) and [`Table.ReplaceValue`](table-replacevalue).

## Example

Replace the value 11 with the value 10.

**Usage**

``` lang-powerquery-m
Replacer.ReplaceValue(11, 11, 10)
```

**Output**

`10`

------------------------------------------------------------------------
