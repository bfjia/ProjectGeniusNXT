<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-combine (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.Combine

## Syntax

    Table.Combine(tables as list, optional columns as any) as table

## About

Returns a table that is the result of appending a list of tables, `tables`. The resulting table will have a row type structure defined by `columns` or by a union of the input types if `columns` is not specified.

## Example 1

Append three tables together.

**Usage**

``` lang-powerquery-m
Table.Combine({
    Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]}),
    Table.FromRecords({[CustomerID = 2, Name = "Jim", Phone = "987-6543"]}),
    Table.FromRecords({[CustomerID = 3, Name = "Paul", Phone = "543-7890"]})
})
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
    [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
    [CustomerID = 3, Name = "Paul", Phone = "543-7890"]
})
```

## Example 2

Append three tables with different structures.

**Usage**

``` lang-powerquery-m
Table.Combine({
    Table.FromRecords({[Name = "Bob", Phone = "123-4567"]}),
    Table.FromRecords({[Fax = "987-6543", Phone = "838-7171"]}),
    Table.FromRecords({[Cell = "543-7890"]})
})
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [Name = "Bob", Phone = "123-4567", Fax = null, Cell = null],
    [Name = null, Phone = "838-7171", Fax = "987-6543", Cell = null],
    [Name = null, Phone = null, Fax = null, Cell = "543-7890"]
})
```

## Example 3

Append two tables and project onto the given type.

**Usage**

``` lang-powerquery-m
Table.Combine(
    {
        Table.FromRecords({[Name = "Bob", Phone = "123-4567"]}),
        Table.FromRecords({[Fax = "987-6543", Phone = "838-7171"]}),
        Table.FromRecords({[Cell = "543-7890"]})
    },
    type table [CustomerID = text, Name = text]
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [CustomerID = null, Name = "Bob"],
    [CustomerID = null, Name = null],
    [CustomerID = null, Name = null]
})
```

------------------------------------------------------------------------
