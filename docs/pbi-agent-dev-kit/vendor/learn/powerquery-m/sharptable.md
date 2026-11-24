<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/sharptable (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# \#table

## Syntax

    #table(columns as any, rows as any) as any

## About

Creates a table value from `columns` and `rows`. The `columns` value can be a list of column names, a table type, a number of columns, or null. The `rows` value is a list of lists, where each element contains the column values for a single row.

## Example 1

Create an empty table.

**Usage**

``` lang-powerquery-m
#table({}, {})
```

**Output**

`#table({}, {})`

## Example 2

Create a table by inferring the number of columns from the first row.

**Usage**

``` lang-powerquery-m
#table(null, {{"Betty", 90.3}, {"Carl", 89.5}})
```

**Output**

`#table({"Column1", "Column2"}, {{"Betty", 90.3}, {"Carl", 89.5}})`

## Example 3

Create a table by specifying the number of columns.

**Usage**

``` lang-powerquery-m
#table(2, {{"Betty", 90.3}, {"Carl", 89.5}})
```

**Output**

`#table({"Column1", "Column2"}, {{"Betty", 90.3}, {"Carl", 89.5}})`

## Example 4

Create a table by providing a list of column names.

**Usage**

``` lang-powerquery-m
#table({"Name", "Score"}, {{"Betty", 90.3}, {"Carl", 89.5}})
```

**Output**

`#table({"Name", "Score"}, {{"Betty", 90.3}, {"Carl", 89.5}})`

## Example 5

Create a table with an explicit type.

**Usage**

``` lang-powerquery-m
#table(type table [Name = text, Score = number], {{"Betty", 90.3}, {"Carl", 89.5}})
```

**Output**

`#table(type table [Name = text, Score = number], {{"Betty", 90.3}, {"Carl", 89.5}})`

## Related content

-   [Types and type conversion](type-conversion)

------------------------------------------------------------------------
