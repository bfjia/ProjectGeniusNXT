<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-unpivotothercolumns (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.UnpivotOtherColumns

## Syntax

    Table.UnpivotOtherColumns(
        table as table,
        pivotColumns as list,
        attributeColumn as text,
        valueColumn as text
    ) as table

## About

Translates all columns other than a specified set into attribute-value pairs, combined with the rest of the values in each row.

## Example

Translates all columns other than a specified set into attribute-value pairs, combined with the rest of the values in each row.

**Usage**

``` lang-powerquery-m
Table.UnpivotOtherColumns(
    Table.FromRecords({
        [key = "key1", attribute1 = 1, attribute2 = 2, attribute3 = 3],
        [key = "key2", attribute1 = 4, attribute2 = 5, attribute3 = 6]
    }),
    {"key"},
    "column1",
    "column2"
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [key = "key1", column1 = "attribute1", column2 = 1],
    [key = "key1", column1 = "attribute2", column2 = 2],
    [key = "key1", column1 = "attribute3", column2 = 3],
    [key = "key2", column1 = "attribute1", column2 = 4],
    [key = "key2", column1 = "attribute2", column2 = 5],
    [key = "key2", column1 = "attribute3", column2 = 6]
})
```

------------------------------------------------------------------------
