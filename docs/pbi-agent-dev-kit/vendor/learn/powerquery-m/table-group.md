<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-group (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.Group

## Syntax

    Table.Group(
        table as table,
        key as any,
        aggregatedColumns as list,
        optional groupKind as nullable number,
        optional comparer as nullable function
    ) as table

## About

Groups the rows of `table` by the key columns defined by `key`. The `key` can either be a single column name, or a list of column names. For each group, a record is constructed containing the key columns (and their values), along with any aggregated columns specified by `aggregatedColumns`. Optionally, `groupKind` and `comparer` may also be specified.

If the data is already sorted by the key columns, then a `groupKind` of [`GroupKind.Local`](groupkind-type) can be provided. This may improve the performance of grouping in certain cases, since all the rows with a given set of key values are assumed to be contiguous.

When passing a `comparer`, note that if it treats differing keys as equal, a row may be placed in a group whose keys differ from its own.

This function does not guarantee the ordering of the rows it returns.

## Example

Group the table adding an aggregate column \[total\] which contains the sum of prices ("each List.Sum(\[price\])").

**Usage**

``` lang-powerquery-m
Table.Group(
    Table.FromRecords({
        [CustomerID = 1, price = 20],
        [CustomerID = 2, price = 10],
        [CustomerID = 2, price = 20],
        [CustomerID = 1, price = 10],
        [CustomerID = 3, price = 20],
        [CustomerID = 3, price = 5]
    }),
    "CustomerID",
    {"total", each List.Sum([price])}
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords(
    {
        [CustomerID = 1, total = 30],
        [CustomerID = 2, total = 30],
        [CustomerID = 3, total = 25]
    },
    {"CustomerID", "total"}
)
```

## Related content

[Comparer functions](comparer-functions)

------------------------------------------------------------------------
