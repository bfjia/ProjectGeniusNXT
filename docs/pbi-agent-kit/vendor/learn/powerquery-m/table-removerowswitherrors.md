<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-removerowswitherrors (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.RemoveRowsWithErrors

## Syntax

    Table.RemoveRowsWithErrors(table as table, optional columns as nullable list) as table

## About

Returns a table with the rows removed from the input table that contain an error in at least one of the cells. If a columns list is specified, then only the cells in the specified columns are inspected for errors.

## Example

Remove error value from first row.

**Usage**

``` lang-powerquery-m
Table.RemoveRowsWithErrors(
    Table.FromRecords({
        [Column1 = ...],
        [Column1 = 2],
        [Column1 = 3]
    })
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [Column1 = 2],
    [Column1 = 3]
})
```

------------------------------------------------------------------------
