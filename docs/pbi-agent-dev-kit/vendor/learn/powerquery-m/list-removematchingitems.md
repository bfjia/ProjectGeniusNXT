<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/list-removematchingitems (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# List.RemoveMatchingItems

## Syntax

    List.RemoveMatchingItems(
        list1 as list,
        list2 as list,
        optional equationCriteria as any
    ) as list

## About

Removes all occurrences of the given values in `list2` from the list `list1`. If the values in `list2` don't exist in `list1`, the original list is returned. An optional equation criteria value, `equationCriteria`, can be specified to control equality testing.

## Example

Remove the numbers 1 and 5 from the list.

**Usage**

``` lang-powerquery-m
List.RemoveMatchingItems({1, 2, 3, 4, 5, 5}, {1, 5})
```

**Output**

`{2, 3, 4}`

## Related content

[Equation criteria](list-functions#equation-criteria)

------------------------------------------------------------------------
