<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-columnnames (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.ColumnNames

## Syntax

    Table.ColumnNames(table as table) as list

## About

Returns the column names in the table `table` as a list of text.

## Example

Find the column names of the table.

**Usage**

``` lang-powerquery-m
Table.ColumnNames(
    Table.FromRecords({
        [CustomerID = 1, Name = "Bob", Phone = "123-4567"],
        [CustomerID = 2, Name = "Jim", Phone = "987-6543"],
        [CustomerID = 3, Name = "Paul", Phone = "543-7890"],
        [CustomerID = 4, Name = "Ringo", Phone = "232-1550"]
    })
)
```

**Output**

`{"CustomerID", "Name", "Phone"}`

------------------------------------------------------------------------
