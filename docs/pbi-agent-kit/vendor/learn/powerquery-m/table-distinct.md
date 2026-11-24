<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/table-distinct (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Table.Distinct

## Syntax

    Table.Distinct(table as table, optional equationCriteria as any) as table

## About

Removes duplicate rows from the table. An optional parameter, `equationCriteria`, specifies which columns of the table are tested for duplication. If `equationCriteria` is not specified, all columns are tested.

Because Power Query sometimes offloads certain operations to backend data sources (known as "folding"), and also sometimes optimizes queries by skipping operations that aren't strictly necessary, in general there's no guarantee which specific duplicate will be preserved. For example, you can't assume that the first row with a unique set of column values will remain, and rows further down in the table will be removed. If you want the duplicate removal to behave predictably, first buffer the table using [`Table.Buffer`](table-buffer).

## Example 1

Remove the duplicate rows from the table.

**Usage**

``` lang-powerquery-m
Table.Distinct(
    Table.FromRecords({
        [a = "A", b = "a"],
        [a = "B", b = "b"],
        [a = "A", b = "a"]
    })
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [a = "A", b = "a"],
    [a = "B", b = "b"]
})
```

## Example 2

Remove the duplicate rows from column \[b\] in the table `({[a = "A", b = "a"], [a = "B", b = "a"], [a = "A", b = "b"]})`.

**Usage**

``` lang-powerquery-m
Table.Distinct(
    Table.FromRecords({
        [a = "A", b = "a"],
        [a = "B", b = "a"],
        [a = "A", b = "b"]
    }),
    "b"
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [a = "A", b = "a"],
    [a = "A", b = "b"]
})
```

## Related content

[Equation criteria](table-functions#equation-criteria)

------------------------------------------------------------------------
