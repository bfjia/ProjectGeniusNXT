<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-renamecolumns (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.RenameColumns

## Syntax

    Table.RenameColumns(
        table as table,
        renames as list,
        optional missingField as nullable number
    ) as table

## About

Performs the given renames to the columns in table `table`. A replacement operation `renames` consists of a list of two values, the old column name and new column name, provided in a list. If the column doesn't exist, an error is raised unless the optional parameter `missingField` specifies an alternative (eg. [`MissingField.UseNull`](missingfield-type) or [`MissingField.Ignore`](missingfield-type)).

## Example 1

Replace the column name "CustomerNum" with "CustomerID" in the table.

**Usage**

``` lang-powerquery-m
Table.RenameColumns(
    Table.FromRecords({[CustomerNum = 1, Name = "Bob", Phone = "123-4567"]}),
    {"CustomerNum", "CustomerID"}
)
```

**Output**

`Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]})`

## Example 2

Replace the column name "CustomerNum" with "CustomerID" and "PhoneNum" with "Phone" in the table.

**Usage**

``` lang-powerquery-m
Table.RenameColumns(
    Table.FromRecords({[CustomerNum = 1, Name = "Bob", PhoneNum = "123-4567"]}),
    {
        {"CustomerNum", "CustomerID"},
        {"PhoneNum", "Phone"}
    }
)
```

**Output**

`Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]})`

## Example 3

Replace the column name "NewCol" with "NewColumn" in the table, and ignore if the column doesn't exist.

**Usage**

``` lang-powerquery-m
Table.RenameColumns(
    Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]}),
    {"NewCol", "NewColumn"},
    MissingField.Ignore
)
```

**Output**

`Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"]})`

------------------------------------------------------------------------
