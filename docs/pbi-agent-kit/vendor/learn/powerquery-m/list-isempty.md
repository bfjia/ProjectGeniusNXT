<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/list-isempty (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# List.IsEmpty

## Syntax

    List.IsEmpty(list as list) as logical

## About

Returns `true` if the list, `list`, contains no values (length 0). If the list contains values (length \> 0), returns `false`.

## Example 1

Find if the list {} is empty.

**Usage**

``` lang-powerquery-m
List.IsEmpty({})
```

**Output**

`true`

## Example 2

Find if the list {1, 2} is empty.

**Usage**

``` lang-powerquery-m
List.IsEmpty({1, 2})
```

**Output**

`false`

------------------------------------------------------------------------
