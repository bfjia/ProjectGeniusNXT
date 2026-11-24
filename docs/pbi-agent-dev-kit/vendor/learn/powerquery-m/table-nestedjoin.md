<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-nestedjoin (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.NestedJoin

## Syntax

    Table.NestedJoin(
        table1 as table,
        key1 as any,
        table2 as any,
        key2 as any,
        newColumnName as text,
        optional joinKind as nullable number,
        optional keyEqualityComparers as nullable list
    ) as table

## About

Joins the rows of `table1` with the rows of `table2` based on the equality of the values of the key columns selected by `key1` (for `table1`) and `key2` (for `table2`). The results are entered into the column named `newColumnName`.

The optional `joinKind` specifies the kind of join to perform. By default, a left outer join is performed if a `joinKind` is not specified.

An optional set of `keyEqualityComparers` may be included to specify how to compare the key columns. This feature is currently intended for internal use only.

## Example

Join two tables using a single key column.

**Usage**

``` lang-powerquery-m
Table.NestedJoin(
    Table.FromRecords({
        [CustomerToCall = 1],
        [CustomerToCall = 3]
    }),
    {"CustomerToCall"},
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    }),
    {"CustomerID"},
    "CustomerDetails"
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [CustomerToCall = 1, CustomerDetails = Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]})],
    [CustomerToCall = 3, CustomerDetails = Table.FromRecords({[CustomerID = 3, Name = "Paul", Phone = "543-7890"]})]
})
```

## Related content

[Join kind](joinkind-type)

------------------------------------------------------------------------
