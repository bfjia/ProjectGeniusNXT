<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-range (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.Range

## Syntax

    Table.Range(
        table as table,
        offset as number,
        optional count as nullable number
    ) as table

## About

Returns the rows from the `table` starting at the specified `offset`. An optional parameter, `count`, specifies how many rows to return. By default, all the rows after the offset are returned.

## Example 1

Return all the rows starting at offset 1 in the table.

**Usage**

``` lang-powerquery-m
Table.Range(
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    }),
    1
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
    [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
    [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
})
```

## Example 2

Return one row starting at offset 1 in the table.

**Usage**

``` lang-powerquery-m
Table.Range(
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    }),
    1,
    1
)
```

**Output**

`Table.FromRecords({[CustomerID = 2, Name = "Jim", Phone = "987-6543"]})`

------------------------------------------------------------------------
