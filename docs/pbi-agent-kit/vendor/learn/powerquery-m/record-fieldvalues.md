<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/record-fieldvalues (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Record.FieldValues

## Syntax

    Record.FieldValues(record as record) as list

## About

Returns a list of the field values in record `record`.

## Example

Find the field values in the record.

**Usage**

``` lang-powerquery-m
Record.FieldValues([CustomerID = 1, Name = "Bob", Phone = "123-4567"])
```

**Output**

`{1, "Bob", "123-4567"}`

------------------------------------------------------------------------
