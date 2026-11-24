<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/csv-document (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Csv.Document

## Syntax

    Csv.Document(
        source as any,
        optional columns as any,
        optional delimiter as any,
        optional extraValues as nullable number,
        optional encoding as nullable number
    ) as table

## About

Returns the contents of the CSV document as a table.

-   `columns` can be null, the number of columns, a list of column names, a table type, or an options record.
-   `delimiter` can be a single character, a list of characters, or the value `""`, which indicates rows should be split by consecutive whitespace characters. Default: `","`.
-   Refer to [`ExtraValues.Type`](extravalues-type) for the supported values of `extraValues`.
-   `encoding` specifies the [text encoding type](textencoding-type).

If a record is specified for `columns` (and `delimiter`, `extraValues`, and `encoding` are null), the following record fields may be provided:

-   `Delimiter`: A single character column delimiter. Default: `","`.
-   `Columns`: Can be null, the number of columns, a list of column names, or a table type. If the number of columns is lower than the number found in the input, the additional columns will be ignored. If the number of columns is higher than the number found in the input, the additional columns will be null. When not specified, the number of columns will be determined by what is found in the input.
-   `Encoding`: The text encoding of the file. Default: 65001 (UTF-8).
-   `CsvStyle`: Specifies how quotes are handled.
    -   [`CsvStyle.QuoteAfterDelimiter`](csvstyle-type) (default): Quotes in a field are only significant immediately following the delimiter.
    -   [`CsvStyle.QuoteAlways`](csvstyle-type): Quotes in a field are always significant, regardless of where they appear.
-   `QuoteStyle`: Specifies how quoted line breaks are handled.
    -   [`QuoteStyle.Csv`](quotestyle-type) (default): Quoted line breaks are treated as part of the data, not as the end of the current row.
    -   [`QuoteStyle.None`](quotestyle-type): All line breaks are treated as the end of the current row, even when they occur inside a quoted value.
-   `IncludeByteOrderMark`: A logical value indicating whether to include a Byte Order Mark (BOM) at the beginning of the CSV output. When set to true, the BOM is written (for example, UTF-8 BOM: `0xEF 0xBB 0xBF`); when set to false, no BOM is included. This option is applicable only in output scenarios. Default is `false`.
-   `ExtraValues`: Refer to [`ExtraValues.Type`](extravalues-type) for the supported values of ExtraValues.

## Example 1

Process CSV text with column headers.

**Usage**

``` lang-powerquery-m
let
    csv = Text.Combine({"OrderID,Item", "1,Fishing rod", "2,1 lb. worms"}, "#(cr)#(lf)")
in
    Table.PromoteHeaders(Csv.Document(csv))
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [OrderID = "1", Item = "Fishing rod"],
    [OrderID = "2", Item = "1 lb. worms"]
})
```

## Example 2

Process CSV text with multiple delimiter characters. In this example, the third parameter specifies the delimiter pattern `#|#` to use instead of the default.

**Usage**

``` lang-powerquery-m
let
    csv = Text.Combine({"OrderID#|#Color", "1#|#Red", "2#|#Blue"}, "#(cr)#(lf)")
in
    Table.PromoteHeaders(Csv.Document(csv, null, "#|#"))
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [OrderID = "1", Color = "Red"],
    [OrderID = "2", Color = "Blue"]
})
```

## Example 3

Process CSV text with a custom delimiter and a fixed number of columns.

**Usage**

``` lang-powerquery-m
Csv.Document(
    "1|Barb#(cr)#(lf)2|Cal",
    [
        Delimiter = "|",
        Columns = 3
    ]
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [Column1 = "1", Column2 = "Barb", Column3 = ""],
    [Column1 = "2", Column2 = "Cal", Column3 = ""]
})
```

## Example 4

Process CSV text with a custom delimiter and a set of custom column names, while treating line breaks embedded inside quotes as the end of the current row.

**Usage**

``` lang-powerquery-m
Csv.Document(
    "1|Barb|""Smith#(cr)#(lf)2|Cal|Fisher",
    [
        Delimiter = "|",
        Columns = type table [ID = text, First Name = text, Last Name = text],
        QuoteStyle = QuoteStyle.None
    ]
)
```

**Output**

``` lang-powerquery-m
Table.FromRecords({
    [ID = "1", First Name = "Barb", Last Name = "Smith"],
    [ID = "2", First Name = "Cal", Last Name = "Fisher"]
})
```

------------------------------------------------------------------------
