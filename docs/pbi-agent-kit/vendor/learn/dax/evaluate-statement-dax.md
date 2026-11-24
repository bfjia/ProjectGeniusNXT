<!-- Source: https://learn.microsoft.com/en-us/dax/evaluate-statement-dax (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# EVALUATE

Introduces a statement containing a table expression required in a [DAX query](dax-queries).

## Syntax

``` lang-dax
EVALUATE <table>
```

## Parameters

| Term    | Definition         |
|---------|--------------------|
| `table` | A table expression |

## Return value

The result of a table expression.

## Remarks

-   A DAX query can contain multiple EVALUATE statements.

-   To learn more about how EVALUATE statements are used, see [DAX queries](dax-queries).

## Example

``` lang-dax
EVALUATE
    'Internet Sales'
```

Returns all rows and columns from the Internet Sales table, as a table.

## Related content

-   [ORDER BY](orderby-statement-dax)
-   [START AT](startat-statement-dax)
-   [DEFINE](define-statement-dax)
-   [VAR](var-dax)
-   [DAX queries](dax-queries)

------------------------------------------------------------------------
