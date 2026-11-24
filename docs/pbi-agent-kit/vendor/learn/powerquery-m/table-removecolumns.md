<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-removecolumns (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.RemoveColumns

## Syntax

    Table.RemoveColumns(
        table as table,
        columns as any,
        optional missingField as nullable number
    ) as table

## About

Removes the specified `columns` from the `table` provided. If the specified column doesn't exist, an error is raised unless the optional parameter `missingField` specifies an alternative behavior (for example, [`MissingField.UseNull`](missingfield-type) or [`MissingField.Ignore`](missingfield-type)).

## Example 1

Remove column \[Phone\] from the table.

**Usage**

``` lang-powerquery-m
Table.RemoveColumns(
    Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]}),
    "Phone"
)
```

**Output**

`Table.FromRecords({[CustomerID = 1, Name = "Bob"]})`

## Example 2

Try to remove a non-existent column from the table.

**Usage**

``` lang-powerquery-m
Table.RemoveColumns(
    Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]}),
    "Address"
)
```

**Output**

`[Expression.Error] The column 'Address' of the table wasn't found.`

------------------------------------------------------------------------
