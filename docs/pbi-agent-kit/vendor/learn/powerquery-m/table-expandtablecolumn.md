<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-expandtablecolumn (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.ExpandTableColumn

## Syntax

    Table.ExpandTableColumn(
        table as table,
        column as text,
        columnNames as list,
        optional newColumnNames as nullable list
    ) as table

## About

Expands tables in `table`\[`column`\] into multiple rows and columns. `columnNames` is used to select the columns to expand from the inner table. Specify `newColumnNames` to avoid conflicts between existing columns and new columns.

Note that in addition to nested tables, the function also supports expanding nested lists of records.

## Example

Expand the Locations column into two new columns.

**Usage**

``` lang-powerquery-m
Table.ExpandTableColumn(
    Table.FromRecords({
        [
            Company = "Contoso",
            Locations = Table.FromRecords({
                [City = "Redmond", State = "WA"],
                [City = "Bellevue", State = "WA"],
                [City = "Tempe", State = "AZ"]
            })
        ]
    }),
    "Locations",
    {"City", "State"},
    {"Locations.City", "Locations.State"}
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [Company = "Contoso", Locations.City = "Redmond", Locations.State = "WA"],
    [Company = "Contoso", Locations.City = "Bellevue", Locations.State = "WA"],
    [Company = "Contoso", Locations.City = "Tempe", Locations.State = "AZ"]
})
```

------------------------------------------------------------------------
